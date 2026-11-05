const { JSDOM } = require('jsdom');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '../..');
const read = path => readFileSync(resolve(root, path), 'utf8');

function createApp({ legacySource } = {}) {
    const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', url: 'https://example.test/' });
    // jsdom은 레이아웃을 계산하지 않으므로 이전 코드의 innerText를 textContent로 대응한다.
    Object.defineProperty(dom.window.HTMLElement.prototype, 'innerText', {
        get() { return this.textContent; },
        set(value) { this.textContent = value; },
    });
    const evaluate = code => vm.runInContext(code, dom.getInternalVMContext());
    for (const path of ['js/table-form.js', 'js/data.js']) evaluate(read(path));
    if (legacySource) evaluate(legacySource);
    else for (const path of ['js/exam-config.js', 'js/score-calculator.js', 'js/search.js']) evaluate(read(path));
    const { window } = dom;
    const { document } = window;
    function selectExam(key, mode = 0) {
        const [, year, month, type] = key.match(/^(\d{4})(\d{1,2})(sat|[123](?:st|nd|rd))$/);
        document.querySelectorAll('[name="test_type"]').forEach(input => { input.checked = input.value === type; });
        for (const [id, value] of [['year', year], ['month', month]]) {
            const select = document.getElementById(id);
            select.replaceChildren(new window.Option(value, value));
        }
        window.makeTable(mode);
        // 원본 구현에는 직업탐구 독립 행이 없으므로 기존 행만 비교한다.
        if (legacySource) document.querySelector('#voc')?.remove();
    }
    function resultSnapshot(mode, { excludeVocational = false } = {}) {
        const selector = excludeVocational ? 'tbody tr:not(#voc)' : 'tbody tr';
        return Array.from(document.querySelectorAll(selector), row => {
            const cells = Array.from(row.cells);
            return cells.length ? (mode === 0 ? cells.slice(-4, -1) : cells.slice(-2, -1)).map(cell => cell.textContent) : [];
        });
    }
    return { window, document, selectExam, resultSnapshot, close: () => window.close() };
}
module.exports = { createApp, read };
