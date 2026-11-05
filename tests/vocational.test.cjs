const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

function withApp(fn) {
    const app = createApp();
    try { fn(app); } finally { app.close(); }
}

function addFutureFixture(app, key) {
    // 미공개 시험은 실제 데이터가 없으므로 고2 자료로 화면 연결만 검사한다.
    app.window.eval(`data[${JSON.stringify(key)}] = data['2026102nd']; ExamConfig.getReleaseNotice = () => '';`);
}

function installHalfPointFixture(app) {
    // 계산 연결 검증용 가상 자료. 실제 점수표를 보간하거나 변경하지 않는다.
    app.window.eval(`{
        const rows = Array.from({ length: 101 }, (_, index) => [String(70 - Math.floor(index / 2)), '50', '5']);
        rows[0] = ['80', '100', '1'];
        rows[3] = ['79', '99', '1'];
        rows[4] = ['79', '99', '1'];
        rows[5] = ['78', '98', '1'];
        rows[100] = ['20', '0', '9'];
        for (const index of [1, 2, 98, 99]) rows[index] = [];
        data['2026102nd']['성공적인 직업생활'] = rows;
    }`);
}

test('직업탐구 표시 조건은 유형별 시작 연도와 월을 모두 검사한다', () => withApp(app => {
    const config = app.window.eval('ExamConfig');
    for (const [type, firstYear] of [['2nd', 2026], ['3rd', 2027], ['sat', 2028]]) {
        for (const year of [firstYear - 1, firstYear, firstYear + 1]) {
            for (const month of [3, 5, 6, 7, 8, 9, 10, 11]) {
                const expected = year >= firstYear && (type === 'sat' || month === 10);
                for (const exam of [{ type, year, month }, { type, year: String(year), month: String(month) }]) {
                    assert.equal(config.hasVocationalInquiry(exam), expected, JSON.stringify(exam));
                }
            }
        }
    }
    assert.equal(config.hasVocationalInquiry({ type: '1st', year: 2030, month: 10 }), false);
}));

test('해당 시험에서만 과학탐구 뒤에 직업탐구를 배치한다', () => withApp(app => {
    for (const key of ['2025102nd', '2026103rd', '20279sat', '2026101st', '202632nd', '202662nd', '202692nd']) {
        for (const mode of [0, 1]) {
            app.selectExam(key, mode);
            assert.equal(app.document.querySelector('#voc'), null, `${key}/${mode}`);
        }
    }
    const futureKeys = ['2027102nd', '2027103rd', '2028103rd', '20286sat', '20288sat', '20289sat', '202811sat', '20296sat'];
    for (const key of ['2026102nd', ...futureKeys]) {
        if (key !== '2026102nd') addFutureFixture(app, key);
        for (const mode of [0, 1]) {
            app.selectExam(key, mode);
            const row = app.document.getElementById('voc');
            assert.ok(row, `${key}/${mode}`);
            assert.equal(row.previousElementSibling.id, 'ex2');
            assert.equal(row.cells[0].textContent, '직업탐구');
            assert.equal(row.cells[1].textContent, '성공적인 직업생활');
            assert.equal(row.cells.length, mode === 0 ? 7 : 5);
            if (mode === 0) assert.equal(row.nextElementSibling.id, 'sfl');
            else assert.equal(row.nextElementSibling, null);
        }
    }
}));

test('직업탐구 원점수는 0.5점 단위 자료로 계산하고 제2외국어 등급도 유지한다', () => withApp(app => {
    installHalfPointFixture(app);
    app.selectExam('2026102nd');
    const vocational = app.document.querySelector('#voc input');
    const language = app.document.querySelector('#sfl input');
    language.value = '45';
    for (const [score, expected] of [
        ['50', ['80', '100', '1']], ['48.5', ['79', '99', '1']], ['47.5', ['78', '98', '1']],
        ['0', ['20', '0', '9']], ['', ['', '', '']],
        ['1', ['X', 'X', 'X']], ['49', ['X', 'X', 'X']],
        ['0.5', ['X', 'X', 'X']], ['49.5', ['X', 'X', 'X']], ['48.25', ['X', 'X', 'X']], ['abc', ['X', 'X', 'X']],
    ]) {
        vocational.value = score;
        app.window.showInfo1();
        assert.deepEqual(Array.from(app.document.querySelectorAll('#voc .vocp, #voc .vocb, #voc .vocd'), el => el.textContent), expected, score);
        assert.equal(app.document.querySelector('#sfl .sd').textContent, '1');
    }
    app.document.querySelector('#ex2 input').value = '48.5';
    app.window.showInfo1();
    assert.notEqual(app.document.querySelector('#ex2 .ex2p').textContent, 'X');
}));

test('직업탐구 역산도 0.5점 단위 범위를 출력하고 입력 범위와 빈값을 처리한다', () => withApp(app => {
    installHalfPointFixture(app);
    app.selectExam('2026102nd', 1);
    const input = app.document.querySelector('#voc input');
    for (const [score, expected] of [['79', '48.0 ~ 48.5'], ['80', '50.0'], ['20', '0.0'], ['0', 'N/A'], ['100', 'N/A'], ['101', 'X'], ['79.5', 'X'], ['', '']]) {
        input.value = score;
        app.window.showInfo2();
        assert.equal(app.document.querySelector('#voc .vocw').textContent, expected, score);
    }
}));

test('직업탐구 이미지와 기존 제2외국어 이미지 키가 서로 섞이지 않는다', () => withApp(app => {
    app.selectExam('202611sat');
    app.window.printTable(0);
    assert.ok(app.document.querySelector('img.formula').getAttribute('src'));
    for (const mode of [0, 1]) {
        app.selectExam('2026102nd', mode);
        app.window.eval(app.document.querySelector('#voc button').getAttribute('onclick'));
        assert.equal(app.document.querySelector('img.stat').getAttribute('src'), './img/2026/2nd/10/성공적인 직업생활.png');
        assert.equal(app.document.querySelector('img.formula').getAttribute('src'), null);
        if (mode === 0) {
            app.document.querySelector('#sfl select').value = '한문';
            app.window.printTable(6);
            assert.equal(app.document.querySelector('img.stat').getAttribute('src'), './img/2026/2nd/10/한문.png');
        }
    }
}));

test('직업탐구 데이터가 없는 새 시험에서도 입력 후 예외 없이 N/A를 표시한다', () => withApp(app => {
    app.window.eval(`data['2029103rd'] = { ...data['2026102nd'] }; delete data['2029103rd']['성공적인 직업생활'];`);
    for (const mode of [0, 1]) {
        app.selectExam('2029103rd', mode);
        app.document.querySelector('#voc input').value = mode === 0 ? '47' : '71';
        app.window[mode === 0 ? 'showInfo1' : 'showInfo2']();
        const cells = app.document.querySelector('#voc').cells;
        assert.equal(cells[cells.length - 2].textContent, 'N/A');
    }
}));

test('기존 51행 직업탐구 자료를 잘못된 점수 단위로 해석하지 않는다', () => withApp(app => {
    app.window.eval(`data['2026102nd']['성공적인 직업생활'] = Array.from({ length: 51 }, () => ['99', '99', '1']);`);
    for (const mode of [0, 1]) {
        app.selectExam('2026102nd', mode);
        const input = app.document.querySelector('#voc input');
        input.value = mode === 0 ? '48.5' : '71';
        app.window[mode === 0 ? 'showInfo1' : 'showInfo2']();
        const cells = app.document.querySelector('#voc').cells;
        assert.equal(cells[cells.length - 2].textContent, 'N/A');
    }
}));
