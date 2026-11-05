const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

function withApp(fn) {
    const app = createApp();
    try { fn(app); } finally { app.close(); }
}

function setLanguageScore(app, value) {
    const input = app.document.querySelector('#sfl input');
    input.value = value;
    app.window.showInfo1();
    return { grade: app.document.querySelector('#sfl .sd').textContent, color: input.style.color };
}

test('새 교육과정 제2외국어는 1·49점만 추가로 제외하고 등급 경계와 정수 단위를 유지한다', () => withApp(app => {
    const calc = app.window.eval('ScoreCalculator');
    const options = { newCurriculum: true };
    for (const [score, oldGrade, newGrade] of [
        ['', '', ''], ['0', 9, 9], ['1', 9, 'X'], ['2', 9, 9], ['4', 9, 9], ['5', 9, 9],
        ['39', 3, 3], ['40', 2, 2], ['44', 2, 2], ['45', 1, 1], ['48', 1, 1], ['49', 1, 'X'], ['50', 1, 1],
        ['1.0', 9, 'X'], ['49.00', 1, 'X'], ['0.5', 'X', 'X'], ['48.5', 'X', 'X'], ['-1', 'X', 'X'], ['51', 'X', 'X'], ['abc', 'X', 'X'],
    ]) {
        assert.equal(calc.absoluteGrade(score, 'language'), oldGrade, `old/${score}`);
        assert.equal(calc.absoluteGrade(score, 'language', options), newGrade, `new/${score}`);
    }
    for (let score = 0; score <= 50; score++) {
        if (score === 1 || score === 49) continue;
        assert.equal(calc.absoluteGrade(String(score), 'language', options), calc.absoluteGrade(String(score), 'language'));
    }
}));

test('교육과정 옵션은 영어·한국사·구교육과정 고1 탐구의 등급에 영향을 주지 않는다', () => withApp(app => {
    const calc = app.window.eval('ScoreCalculator');
    for (const kind of ['english', 'history']) {
        for (let score = -1; score <= 101; score++) {
            assert.equal(calc.absoluteGrade(String(score), kind, { newCurriculum: true }), calc.absoluteGrade(String(score), kind), `${kind}/${score}`);
        }
    }
}));

test('고2·고3·평가원의 모든 제2외국어와 한문에 교육과정별 규칙을 적용한다', () => withApp(app => {
    const exams = [
        ['2025102nd', false], ['2026103rd', false], ['20279sat', false],
        ['2026102nd', true], ['2027103rd', true], ['20286sat', true], ['20288sat', true], ['202811sat', true],
    ];
    for (const [key, newCurriculum] of exams) {
        if (!app.window.eval(`data[${JSON.stringify(key)}]`)) {
            // 아직 없는 시험은 표 연결 검증용 자료를 사용한다. 실제 데이터는 수정하지 않는다.
            app.window.eval(`data[${JSON.stringify(key)}] = data['2026102nd']; ExamConfig.getReleaseNotice = () => '';`);
        }
        app.selectExam(key);
        const select = app.document.querySelector('#sfl select');
        for (const option of select.options) {
            select.value = option.value;
            for (const score of ['1', '49']) {
                const result = setLanguageScore(app, score);
                assert.equal(result.grade, newCurriculum ? 'X' : score === '1' ? '9' : '1', `${key}/${option.value}/${score}`);
                assert.equal(result.color, newCurriculum ? 'rgb(238, 48, 48)' : 'rgb(48, 48, 238)');
            }
            const corrected = setLanguageScore(app, '48');
            assert.equal(corrected.grade, '1');
            assert.equal(corrected.color, 'rgb(48, 48, 238)');
        }
        const text = app.document.querySelector('div.table').textContent.replace(/\s+/g, ' ');
        assert.equal(text.includes('제2외국어/한문: 0부터 50까지의 정수 (1과 49는 유효하지 않음)'), newCurriculum, key);
    }
}));

test('검색 옵션을 바꿔도 새 표를 만들기 전에는 기존 표의 교육과정으로 검증한다', () => withApp(app => {
    app.selectExam('2025102nd');
    assert.equal(setLanguageScore(app, '49').grade, '1');
    const year = app.document.getElementById('year');
    year.replaceChildren(new app.window.Option('2026', '2026'));
    assert.equal(setLanguageScore(app, '49').grade, '1');
    app.window.makeTable(0);
    assert.ok(app.document.querySelector('#voc'));
    assert.equal(setLanguageScore(app, '49').grade, 'X');
    assert.equal(setLanguageScore(app, '0').grade, '9');
    assert.equal(setLanguageScore(app, '50').grade, '1');
}));
