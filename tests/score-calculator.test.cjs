const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { read } = require('./helpers/app.cjs');
const context = vm.createContext({});
vm.runInContext(read('js/score-calculator.js') + '\n' + read('js/exam-config.js') + '\n' + read('js/data.js'), context);
const calc = vm.runInContext('ScoreCalculator', context);
const config = vm.runInContext('ExamConfig', context);
const data = vm.runInContext('data', context);
const plain = value => JSON.parse(JSON.stringify(value));

test('빈 입력과 0점은 구별하고, 허용 점수 단위와 제외 점수를 검사한다', () => {
    assert.deepEqual(plain(calc.lookupRaw([[100, 99, 1]], '', calc.rules.main)), ['', '', '']);
    for (const value of ['abc', '1', '99', '-1', '101', '3.5']) assert.equal(calc.isValidScore(value, calc.rules.main), false);
    assert.equal(calc.isValidScore('0', calc.rules.main), true);
    assert.equal(calc.isValidScore('48.5', calc.rules.integrated), true);
    for (const value of ['0.5', '1', '49', '49.5', '48.25']) assert.equal(calc.isValidScore(value, calc.rules.integrated), false);
    assert.equal(calc.isValidPart('2.5', 24), false);
});

test('절대평가의 등급 경계와 불가능 점수를 처리한다', () => {
    for (const [kind, cases] of Object.entries({
        english: [['0', 9], ['89', 2], ['90', 1], ['98', 1], ['99', 'X'], ['100', 1]],
        history: [['0', 9], ['39', 2], ['40', 1], ['48', 1], ['49', 'X'], ['50', 1]],
        language: [['0', 9], ['1', 9], ['44', 2], ['45', 1], ['49', 1], ['50', 1]],
    })) {
        for (const [input, expected] of cases) assert.equal(calc.absoluteGrade(input, kind), expected, `${kind}: ${input}`);
        assert.equal(calc.absoluteGrade('2.5', kind), 'X');
        assert.equal(calc.absoluteGrade('', kind), '');
    }
});

test('표준점수 역조회는 범위, 미존재 점수, 0점, 소수점 표기를 구별한다', () => {
    const rows = [[80, 100, 1], [79, 99, 1], [79, 99, 1], [0, 0, 9]];
    assert.equal(calc.lookupStandard(rows, '79', { max: 50 }), '48 ~ 49');
    assert.equal(calc.lookupStandard(rows, '79', { max: 50, step: 0.5 }), '49.0 ~ 49.5');
    assert.equal(calc.lookupStandard(rows, '0', { max: 50 }), '47');
    assert.equal(calc.lookupStandard(rows, '78', { max: 50 }), 'N/A');
    assert.equal(calc.lookupStandard(rows, '79x', { max: 50 }), 'X');
    assert.equal(calc.lookupStandard(rows, '', { max: 50 }), '');
});

test('공통·선택 계산은 실제 계수로 표준점수와 백분위·등급을 조회한다', () => {
    const rows = data['202611sat']['국어'];
    const coefficients = rows[0]['언어와 매체'];
    assert.deepEqual(plain(coefficients), [0.984, 0.995, 48.8]);
    const result = plain(calc.calculateSplit(rows, '언어와 매체', '76', '24', '국어'));
    assert.equal(result[0], 147);
    assert.deepEqual(result.slice(1), plain(rows.find(row => row[0] == 147).slice(1)));
    assert.deepEqual(plain(calc.calculateSplit(rows, '언어와 매체', '75', '24', '국어')), ['X', 'X', 'X']);
    assert.deepEqual(plain(calc.calculateSplit(rows, '언어와 매체', '', '24', '국어')), ['', '', '']);
});

test('선택점수를 고정한 역산과 전체 범위 역산을 구별한다', () => {
    const rows = [{ '화법과 작문': [1, 1, 40] }];
    assert.equal(calc.reverseSplit(rows, '화법과 작문', '100', '20', '국어'), '60');
    assert.equal(calc.reverseSplit(rows, '화법과 작문', '100', '', '국어'), '60');
    assert.equal(calc.reverseSplit(rows, '화법과 작문', '140', '24', '국어'), '100');
    assert.equal(calc.reverseSplit(rows, '화법과 작문', '141', '24', '국어'), 'N/A');
    assert.equal(calc.reverseSplit(rows, '화법과 작문', '100', '23', '국어'), '60');
    assert.equal(calc.reverseSplit(rows, '화법과 작문', 'abc', '', '국어'), 'X');
});

test('교육과정 전환 경계와 과목·월 옵션을 공통 설정에서 결정한다', () => {
    for (const [type, year, month, expected] of [
        ['1st', '2025', '3', false], ['1st', '2025', '6', true],
        ['2nd', '2025', '10', false], ['2nd', '2026', '3', true],
        ['3rd', '2026', '10', false], ['3rd', '2027', '3', true],
        ['sat', '2027', '11', false], ['sat', '2028', '11', true],
    ]) assert.equal(config.isIntegrated({ type, year, month }), expected);
    assert.deepEqual(plain(config.getMonths({ type: '3rd', year: '2023' })), ['3', '4', '7', '10']);
    assert.deepEqual(plain(config.getMonths({ type: '3rd', year: '2024' })), ['3', '5', '7', '10']);
    assert.equal(config.hasElectives({ type: 'sat', year: '2028', month: '11' }), false);
    assert.equal(config.getForeignLanguages({ type: '2nd', year: '2026', month: '10' })[0], '독일어');
    assert.equal(config.getForeignLanguages({ type: 'sat', year: '2027', month: '9' })[0], '독일어Ⅰ');
});

test('실제 수학 점수표의 빈 행과 누락된 0점 데이터는 예외를 일으키지 않는다', () => {
    const rows = data['202331st']['수학'];
    assert.equal(rows[1], undefined);
    assert.doesNotThrow(() => calc.lookupStandard(rows, '60', { max: 100 }));
    assert.deepEqual(plain(calc.lookupRaw(rows, '0', calc.rules.main)), ['N/A', 'N/A', 'N/A']);
    assert.deepEqual(plain(calc.lookupRaw(undefined, '20', calc.rules.inquiry)), ['N/A', 'N/A', 'N/A']);
});
