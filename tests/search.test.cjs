const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

function withApp(fn) {
    const app = createApp();
    try { fn(app); } finally { app.close(); }
}

function change(app, element, value) {
    if (value !== undefined) element.value = value;
    element.dispatchEvent(new app.window.Event('change', { bubbles: true }));
}

test('77개 실제 시험에서 양방향 표를 만들고 점수를 계산한다', () => withApp(app => {
    const keys = app.window.eval('Object.keys(data)');
    assert.equal(keys.length, 77);
    for (const key of keys) {
        for (const mode of [0, 1]) {
            app.selectExam(key, mode);
            assert.ok(app.document.querySelector('tbody'), `${key}/${mode}`);
            for (const input of app.document.querySelectorAll('tbody input')) input.value = mode === 0 ? '20' : '60';
            assert.doesNotThrow(() => app.window[mode === 0 ? 'showInfo1' : 'showInfo2'](), `${key}/${mode}`);
            assert.ok(!app.resultSnapshot(mode).flat().includes('undefined'), `${key}/${mode}`);
        }
    }
}));

test('이전 연도를 보고 시험 유형을 바꿔도 최신 연도의 월 옵션을 사용한다', () => withApp(app => {
    app.selectExam('202233rd');
    const radio = app.document.getElementById('2nd');
    radio.checked = true;
    change(app, radio);
    assert.equal(app.document.getElementById('year').value, '2026');
    assert.deepEqual(Array.from(app.document.getElementById('month').options, option => option.value), ['3', '6', '9', '10']);
    assert.equal(app.document.getElementById('month').value, '10');
    app.document.getElementById('year').value = '2022';
    app.window.yearChange();
    assert.equal(app.document.getElementById('month').value, '3');
}));

test('옵션만 바꿀 때는 생성한 표의 시험·이미지 경로를 유지한다', () => withApp(app => {
    app.selectExam('202611sat');
    app.document.querySelector('tbody input').value = '50';
    app.document.querySelectorAll('tbody input')[1].value = '20';
    app.window.showInfo1();
    const before = app.resultSnapshot(0);
    const radio = app.document.getElementById('1st');
    radio.checked = true;
    change(app, radio);
    app.window.showInfo1();
    assert.deepEqual(app.resultSnapshot(0), before);
    app.window.printTable(0);
    assert.equal(app.document.querySelector('img.stat').getAttribute('src'), './img/2026/sat/11/국어.png');
    assert.equal(app.document.querySelector('img.formula').getAttribute('src'), './img/2026/sat/11/공식.png');
}));

test('선택과목 change 이벤트로 점수 입력 후 결과를 다시 계산한다', () => withApp(app => {
    app.selectExam('202611sat');
    const row = app.document.querySelector('tbody').rows[0];
    const [common, elective] = row.querySelectorAll('input');
    common.value = '70'; elective.value = '20';
    app.window.showInfo1();
    const before = row.cells[4].textContent;
    change(app, row.querySelector('select'), '언어와 매체');
    const expected = app.window.eval('ScoreCalculator.calculateSplit(data["202611sat"]["국어"], "언어와 매체", "70", "20", "국어")[0]');
    assert.equal(row.cells[4].textContent, String(expected));
    assert.notEqual(row.cells[4].textContent, before);
}));

test('고1 구교육과정 역산은 탐구 행 없이 국어·수학을 계산한다', () => withApp(app => {
    app.selectExam('202431st', 1);
    assert.equal(app.document.querySelector('#ex1'), null);
    app.document.querySelector('tbody input').value = '100';
    assert.doesNotThrow(() => app.window.showInfo2());
    assert.notEqual(app.resultSnapshot(1)[0][0], '');
}));

test('통합탐구의 0.5점 단위와 제2외국어의 이미지 경로를 처리한다', () => withApp(app => {
    app.selectExam('2026102nd');
    const input = app.document.querySelector('#ex2 input');
    input.value = '48.5';
    app.window.showInfo1();
    assert.notEqual(app.document.querySelector('.ex2p').textContent, 'X');
    app.window.printTable(6);
    assert.equal(app.document.querySelector('img.stat').getAttribute('src'), './img/2026/2nd/10/독일어.png');
    input.value = '49.5';
    app.window.showInfo1();
    assert.equal(app.document.querySelector('.ex2p').textContent, 'X');
}));

test('성적 발표 안내와 미등록 시험은 이전 표·이미지를 지운다', () => withApp(app => {
    app.selectExam('202611sat');
    app.window.printTable(0);
    app.selectExam('202711sat');
    assert.match(app.document.querySelector('div.table').textContent, /12월 11일\(금\)/);
    assert.equal(app.document.querySelector('tbody'), null);
    assert.equal(app.document.querySelector('img.stat').getAttribute('src'), null);
    assert.doesNotThrow(() => app.window.showInfo1());
    app.selectExam('203011sat');
    assert.match(app.document.querySelector('div.table').textContent, /아직 등록되지/);
}));

test('index.html의 실제 스크립트 순서와 인라인 버튼·입력 이벤트가 작동한다', async () => {
    const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
    const { read } = require('./helpers/app.cjs');
    const errors = [];
    class LocalScripts extends ResourceLoader {
        fetch(url) {
            const path = new URL(url).pathname;
            return path.startsWith('/js/') ? Promise.resolve(Buffer.from(read(path.slice(1)))) : null;
        }
    }
    const dom = new JSDOM(read('index.html'), {
        runScripts: 'dangerously', resources: new LocalScripts(), url: 'https://example.test/',
        virtualConsole: new VirtualConsole().on('jsdomError', error => errors.push(error.message)),
    });
    try {
        await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
        const { document } = dom.window;
        document.querySelector('.btn1').click();
        const row = document.querySelector('tbody').rows[0];
        const inputs = row.querySelectorAll('input');
        inputs[0].value = '70'; inputs[1].value = '20';
        inputs[1].dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        assert.notEqual(row.cells[4].textContent, '');
        assert.equal(document.querySelector('caption').textContent, '2026학년도 10월 고3 전국연합학력평가 성적 계산기');
        assert.deepEqual(errors, []);
    } finally { dom.window.close(); }
});
