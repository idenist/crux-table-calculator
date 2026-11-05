// 화면 처리만 담당한다. 시험 규칙은 ExamConfig, 계산은 ScoreCalculator에 둔다.
const SearchController = (() => {
    const typeEls = document.querySelectorAll("input[name='test_type']");
    const yearEl = document.querySelector("#year");
    const monthEl = document.querySelector("#month");
    const tableContainer = document.querySelector("div.table");
    const imageContainer = document.querySelector("div.image");
    const formulaImage = imageContainer.querySelector("img.formula");
    const statImage = imageContainer.querySelector("img.stat");
    const validColor = "#3030EE";
    const invalidColor = "#EE3030";
    let activeExam = null; // 검색 옵션을 바꿔도 버튼을 누르기 전까지 기존 표의 시험을 유지한다.
    let activeMode = 0;
    let rows = [];

    function readSelection() {
        return { type: document.querySelector("input[name='test_type']:checked").value,
            year: yearEl.value, month: monthEl.value };
    }

    function replaceOptions(select, values, label = value => value) {
        select.replaceChildren(...values.map(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label(value);
            return option;
        }));
    }

    function updateMonths() {
        const exam = readSelection();
        replaceOptions(monthEl, ExamConfig.getMonths(exam), month => {
            if (exam.type !== "sat") return month;
            return month === "11" ? "대학수학능력시험" : `대학수학능력시험 ${month}월 모의평가`;
        });
        monthEl.value = ExamConfig.getDefaultMonth(exam);
    }

    function updateType() {
        const { type } = readSelection();
        replaceOptions(yearEl, ExamConfig.getYears(type));
        yearEl.value = ExamConfig.getLatest(type).year;
        document.querySelector("p#test_name > span").textContent = type === "sat"
            ? "" : `월 고${type[0]} 전국연합학력평가`;
        updateMonths();
    }

    function clearImages() {
        imageContainer.querySelector("p").textContent = "";
        for (const image of [formulaImage, statImage]) {
            image.removeAttribute("src");
            image.removeAttribute("alt");
        }
    }

    function getTemplate(exam, mode) {
        if (ExamConfig.isIntegrated(exam)) return mode === 0 ? tableType5 : tableType6;
        if (ExamConfig.hasElectives(exam)) return mode === 0 ? tableType2 : tableType4;
        return mode === 0 ? tableType1 : tableType3;
    }

    function appendSubjectSelect(cell, subjects) {
        const select = document.createElement("select");
        replaceOptions(select, subjects);
        // change는 키보드 및 모바일의 실제 선택 변경도 처리한다.
        select.addEventListener("change", updateScores);
        cell.appendChild(select);
    }

    function configureForeignLanguages() {
        if (activeMode !== 0) return;
        const row = tableContainer.querySelector("#sfl");
        const subjects = ExamConfig.getForeignLanguages(activeExam);
        if (!subjects.length) row.remove();
        else replaceOptions(row.querySelector("select"), subjects);
    }

    function configureInquiry() {
        const inquiryRows = [tableContainer.querySelector("#ex1"), tableContainer.querySelector("#ex2")];
        const integrated = ExamConfig.isIntegrated(activeExam);
        if (integrated || activeExam.type === "1st") {
            if (!integrated && activeMode === 1) {
                inquiryRows.forEach(row => row.remove());
                return;
            }
            const names = ExamConfig.getInquiryNames(activeExam);
            inquiryRows.forEach((row, index) => {
                row.querySelector(`.ex${index + 1}s`).textContent = names[index];
                if (!integrated) {
                    row.querySelector(`.ex${index + 1}p`).textContent = "-";
                    row.querySelector(`.ex${index + 1}b`).textContent = "-";
                }
            });
            if (integrated) {
                inquiryRows[1].querySelector(".ex2s").style.backgroundColor = activeMode === 0 ? "#CCFFCC" : "#FFCCFF";
            }
            return;
        }
        const subjects = ExamConfig.getInquirySubjects(activeExam);
        inquiryRows.forEach((row, index) => appendSubjectSelect(row.querySelector(`.ex${index + 1}s`), subjects));
    }

    function configureMainSubjects(tbody) {
        if (!ExamConfig.hasElectives(activeExam)) return;
        ["국어", "수학"].forEach((subject, index) => {
            appendSubjectSelect(tbody.rows[index].cells[1], ScoreCalculator.subjects[subject].choices);
        });
    }

    function configureVocationalInquiry() {
        const row = tableContainer.querySelector("#voc");
        if (row && !ExamConfig.hasVocationalInquiry(activeExam)) row.remove();
    }

    function adjustWidths() {
        if (activeMode !== 0 || activeExam.month.length !== 2) return;
        const { type, year } = activeExam;
        let widths;
        if (type === "2nd" && year <= 2025) widths = [20, 25, 15, 10, 10, 10, 10];
        else if (type === "2nd" || (type === "3rd" && year >= 2027)) widths = [17, 17, 18, 12, 12, 12, 12];
        if (widths) tableContainer.querySelectorAll("th").forEach((cell, i) => cell.setAttribute("width", `${widths[i]}%`));
    }

    function bindRows(tbody) {
        // 6가지 표의 셀 배치는 여기서만 해석한다. 추가 행은 위치 대신 ID로 구별한다.
        const names = ["국어", "수학", "영어", "한국사", ...ExamConfig.getInquiryNames(activeExam)];
        return Array.from(tbody.rows, (row, index) => {
            if (!row.cells.length) return null; // 역산 표의 영어·한국사 빈 행
            const inputs = Array.from(row.querySelectorAll("input"));
            const cells = Array.from(row.cells);
            const subject = row.id === "voc" ? "성공적인 직업생활"
                : row.id === "sfl" ? "제2외국어/한문" : names[index];
            // 기존 printTable(6)은 제2외국어를 계속 가리키고 직업탐구는 별도 키를 쓴다.
            const imageKey = row.id === "voc" ? "voc" : row.id === "sfl" ? 6 : index;
            return { id: row.id, index, subject, imageKey, select: row.querySelector("select"), inputs,
                outputs: activeMode === 0 ? cells.slice(-4, -1) : cells.slice(-2, -1) };
        });
    }

    function makeTable(mode) {
        clearImages();
        activeExam = readSelection();
        activeMode = Number(mode);
        rows = [];
        const notice = ExamConfig.getReleaseNotice(activeExam);
        if (notice) {
            tableContainer.textContent = notice;
            return;
        }
        if (!data[examKey()]) {
            tableContainer.textContent = "해당 시험의 성적 데이터가 아직 등록되지 않았습니다.";
            return;
        }
        tableContainer.innerHTML = getTemplate(activeExam, activeMode);
        const tbody = tableContainer.querySelector("tbody");
        configureForeignLanguages();
        configureInquiry();
        configureVocationalInquiry();
        configureMainSubjects(tbody);
        tableContainer.querySelector("caption").textContent = ExamConfig.getTitle(activeExam);
        adjustWidths();
        rows = bindRows(tbody);
    }

    function examKey() {
        return activeExam.year + activeExam.month + activeExam.type;
    }

    function setInputColor(input, valid) {
        input.style.color = valid ? validColor : invalidColor;
    }

    function writeResult(row, values) {
        row.outputs.forEach((cell, i) => { cell.textContent = values[i]; });
        setInputColor(row.inputs[0], !values.includes("X"));
    }

    function getSubject(row) {
        return row.select ? row.select.value : row.subject;
    }

    function updateRawMain(row, examData) {
        const calc = ScoreCalculator;
        if (!ExamConfig.hasElectives(activeExam)) {
            writeResult(row, calc.lookupRaw(examData[row.subject], row.inputs[0].value, calc.rules.main));
            return;
        }
        const [common, elective] = row.inputs.map(input => input.value);
        writeResult(row, calc.calculateSplit(examData[row.subject], getSubject(row), common, elective, row.subject));
        const { commonMax, electiveMax } = calc.subjects[row.subject];
        [commonMax, electiveMax].forEach((max, i) => {
            setInputColor(row.inputs[i], calc.isEmpty(row.inputs[i].value) || calc.isValidPart(row.inputs[i].value, max));
        });
    }

    function updateAbsolute(row, kind) {
        const grade = ScoreCalculator.absoluteGrade(row.inputs[0].value, kind,
            { newCurriculum: ExamConfig.isIntegrated(activeExam) });
        row.outputs[2].textContent = grade;
        setInputColor(row.inputs[0], grade !== "X");
    }

    function updateRaw(row, examData) {
        if (row.index < 2) return updateRawMain(row, examData);
        if (row.index === 2) return updateAbsolute(row, "english");
        if (row.index === 3) return updateAbsolute(row, "history");
        if (row.id === "sfl") return updateAbsolute(row, "language");
        if (activeExam.type === "1st" && !ExamConfig.isIntegrated(activeExam)) return updateAbsolute(row, "history");
        const rule = getInquiryRule();
        writeResult(row, ScoreCalculator.lookupRaw(getInquiryData(row, examData), row.inputs[0].value, rule));
    }

    function getInquiryRule() {
        return ScoreCalculator.rules[ExamConfig.isIntegrated(activeExam) ? "integrated" : "inquiry"];
    }

    function getInquiryData(row, examData) {
        const subjectData = examData[getSubject(row)];
        if (row.id === "voc") {
            // 잘못된 기존 1점 단위 자료를 0.5점 단위로 읽어 점수를 오표시하지 않는다.
            const { max, step } = getInquiryRule();
            if (subjectData?.length !== max / step + 1) return undefined;
        }
        return subjectData;
    }

    function updateReverse(row, examData) {
        const calc = ScoreCalculator;
        const value = row.inputs[0].value;
        if (row.index < 2 && ExamConfig.hasElectives(activeExam)) {
            const elective = row.inputs[1].value;
            const result = calc.reverseSplit(examData[row.subject], getSubject(row), value, elective, row.subject);
            writeResult(row, [result]);
            setInputColor(row.inputs[1], calc.isValidPart(elective, calc.subjects[row.subject].electiveMax));
            return;
        }
        const main = row.index < 2;
        const step = main ? 1 : getInquiryRule().step;
        const result = calc.lookupStandard(main ? examData[row.subject] : getInquiryData(row, examData), value,
            { max: main ? 100 : 50, step, standardMax: main ? 200 : 100 });
        writeResult(row, [result]);
    }

    function updateScores() {
        if (!activeExam || !rows.length) return;
        const examData = data[examKey()];
        for (const row of rows) {
            if (!row) continue;
            if (activeMode === 0) updateRaw(row, examData);
            else updateReverse(row, examData);
        }
    }

    function printTable(key) {
        const row = rows.find(row => row && String(row.imageKey) === String(key));
        if (!row) return;
        const path = `./img/${activeExam.year}/${activeExam.type}/${activeExam.month}`;
        imageContainer.querySelector("p").textContent = "통계자료 이미지";
        // 국어·수학의 파일명은 선택과목 이름이 아닌 영역 이름이다.
        statImage.setAttribute("src", `${path}/${row.index < 4 ? row.subject : getSubject(row)}.png`);
        statImage.alt = "미지원";
        if (ExamConfig.hasElectives(activeExam) && row.index < 2) formulaImage.setAttribute("src", `${path}/공식.png`);
        else formulaImage.removeAttribute("src");
    }

    typeEls.forEach(input => input.addEventListener("change", updateType));
    updateType();
    return { makeTable, updateScores, updateMonths, printTable };
})();

// 기존 HTML과 table-form.js의 인라인 이벤트에서 사용하는 진입점은 유지한다.
function yearChange() { SearchController.updateMonths(); }
function makeTable(mode) { SearchController.makeTable(mode); }
function showInfo1() { SearchController.updateScores(); }
function showInfo2() { SearchController.updateScores(); }
function printTable(subNum) { SearchController.printTable(subNum); }
