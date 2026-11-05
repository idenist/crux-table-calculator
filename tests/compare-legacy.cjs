// 실행: npm run test:compat -- /path/to/original/search.js
// 경로를 생략하면 리팩토링 전 커밋의 파일을 git에서 읽는다.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { createApp } = require('./helpers/app.cjs');
const baseline = '0b536e535e753d73ae3b4a36c7cfd6383b96afae';
const source = process.argv[2] ? readFileSync(process.argv[2], 'utf8')
    : execFileSync('git', ['show', `${baseline}:js/search.js`], { encoding: 'utf8' });
const old = createApp({ legacySource: source });
const current = createApp();
let comparisons = 0;
let knownLegacyErrors = 0;
const unmatchedLegacyErrors = {};
function compare(key, mode, label) {
    let legacyError;
    try { old.window[mode === 0 ? 'showInfo1' : 'showInfo2'](); }
    catch (error) { legacyError = error; }
    current.window[mode === 0 ? 'showInfo1' : 'showInfo2']();
    if (legacyError) {
        const oldGrade1 = key.endsWith('1st') && (Number(key.slice(0, 4)) < 2025 || key === '202531st');
        const missingRows = Array.from(old.document.querySelectorAll('#ex1, #ex2')).filter(row => {
            const subject = row.querySelector('select')?.value;
            return subject && !old.window.eval(`data[${JSON.stringify(key)}][${JSON.stringify(subject)}]`);
        });
        if (missingRows.length && /undefined/.test(legacyError.message)) {
            for (const row of missingRows) {
                const cells = current.document.getElementById(row.id).cells;
                assert.equal(cells[cells.length - 2].textContent, 'N/A', `${key}/${label}`);
            }
            unmatchedLegacyErrors.missingSubject = (unmatchedLegacyErrors.missingSubject || 0) + 1;
            return;
        }
        if (key === '202331st' && /undefined/.test(legacyError.message)) {
            unmatchedLegacyErrors.sparseData = (unmatchedLegacyErrors.sparseData || 0) + 1;
            return;
        }
        // 고1 구교육과정에서는 원본도 국어·수학 출력은 끝낸 뒤 탐구 행에서 실패한다.
        if (!(mode === 1 && oldGrade1 && /null/.test(legacyError.message))) { console.error({ key, mode, label }); throw legacyError; }
        knownLegacyErrors++;
    }
    assert.deepEqual(current.resultSnapshot(mode, { excludeVocational: true }), old.resultSnapshot(mode), `${key}/${mode}/${label}`);
    comparisons++;
}
try {
    for (const key of current.window.eval('Object.keys(data)')) {
        for (const mode of [0, 1]) {
            for (const app of [old, current]) app.selectExam(key, mode);
            const inputs = [old, current].map(app => Array.from(app.document.querySelectorAll('tbody tr:not(#voc) input')));
            assert.equal(inputs[0].length, inputs[1].length, key);
            const values = mode === 0 ? ['', '0', '2', '3', '20', '24', '26', '48', '50', '74', '76', '98', '100', '-1', '101']
                : ['', '2', '20', '50', '60', '80', '100', '120', '140', '160', '200', '201'];
            for (const value of values) {
                for (const list of inputs) list.forEach(input => { input.value = value; });
                compare(key, mode, value);
            }
            // 모든 선택과목으로 바꾸어 데이터 키와 계산 연결도 확인한다.
            const selects = [old, current].map(app => Array.from(app.document.querySelectorAll('tbody select')));
            assert.equal(selects[0].length, selects[1].length, key);
            for (let i = 0; i < selects[0].length; i++) {
                assert.deepEqual(Array.from(selects[1][i].options, o => o.value), Array.from(selects[0][i].options, o => o.value), key);
                for (const option of selects[0][i].options) {
                    for (const list of inputs) list.forEach(input => { input.value = mode === 0 ? '20' : '60'; });
                    selects.forEach(list => { list[i].value = option.value; });
                    compare(key, mode, option.value);
                }
                selects.forEach(list => { list[i].selectedIndex = 0; });
            }
            if (mode === 1 && /(?:sat|3rd)$/.test(key)) {
                for (const elective of ['', '0', '2', '20', '24', '26']) {
                    for (let standard = 1; standard <= 200; standard++) {
                        for (const list of inputs) {
                            list[0].value = list[2].value = String(standard);
                            list[1].value = list[3].value = elective;
                        }
                        compare(key, mode, `std=${standard}/elective=${elective}`);
                    }
                }
            }
        }
    }
    console.log(JSON.stringify({ exams: 77, comparisons, knownLegacyErrors, unmatchedLegacyErrors, result: 'matched' }, null, 2));
} finally { old.close(); current.close(); }
