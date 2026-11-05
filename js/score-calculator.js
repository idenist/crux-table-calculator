// DOM을 읽거나 수정하지 않는 계산 함수. 시험별 계수와 점수표는 호출자가 전달한다.
const ScoreCalculator = (() => {
    const subjects = {
        국어: { commonMax: 76, electiveMax: 24, choices: ["화법과 작문", "언어와 매체"] },
        수학: { commonMax: 74, electiveMax: 26, choices: ["확률과 통계", "미적분", "기하"] },
    };
    const rules = {
        main: { max: 100, step: 1, excluded: [1, 99] },
        inquiry: { max: 50, step: 1, excluded: [1, 49] },
        integrated: { max: 50, step: 0.5, excluded: [0.5, 1, 49, 49.5] },
        language: { max: 50, step: 1, excluded: [] },
        languageNew: { max: 50, step: 1, excluded: [1, 49] },
    };

    function isEmpty(value) {
        return String(value).trim() === "";
    }

    function isValidScore(value, { max, step = 1, excluded = [] }) {
        if (isEmpty(value)) return false;
        const score = Number(value);
        return Number.isFinite(score) && score >= 0 && score <= max
            && Number.isInteger(score / step) && !excluded.includes(score);
    }

    function isValidPart(value, max) {
        return isValidScore(value, { max, excluded: [1, max - 1] });
    }

    function repeat(value) {
        return [value, value, value];
    }

    function formatRange(min, max, decimals) {
        if (min > max || min < 0 || max < 0) return "N/A";
        const format = value => decimals === undefined ? String(value) : value.toFixed(decimals);
        return min === max ? format(min) : `${format(min)} ~ ${format(max)}`;
    }

    function lookupRaw(rows, value, rule) {
        if (isEmpty(value)) return repeat("");
        if (!isValidScore(value, rule)) return repeat("X");
        return rows?.[(rule.max - Number(value)) / rule.step] || repeat("N/A");
    }

    function lookupStandard(rows, value, { max, step = 1, standardMax = 200 }) {
        if (isEmpty(value)) return "";
        if (!isValidScore(value, { max: standardMax })) return "X";
        const score = Number(value);
        const first = rows?.findIndex(row => row?.[0] == score) ?? -1;
        if (first === -1) return "N/A";
        let last = rows.length - 1;
        while (rows[last]?.[0] != score) last--;
        return formatRange(max - last * step, max - first * step, step === 0.5 ? 1 : undefined);
    }

    function absoluteGrade(value, kind, { newCurriculum = false } = {}) {
        if (isEmpty(value)) return "";
        const languageRule = newCurriculum ? rules.languageNew : rules.language;
        const rule = kind === "english" ? rules.main : kind === "language" ? languageRule : rules.inquiry;
        if (!isValidScore(value, rule)) return "X";
        const score = Number(value);
        if (kind === "english") return Math.max(1, Math.min(9, 10 - Math.floor(score / 10)));
        if (kind === "language") return Math.max(1, Math.min(9, 10 - Math.floor(score / 5)));
        return Math.max(1, 9 - Math.floor(score / 5));
    }

    function toStandard(coefficients, common, elective) {
        // 기존 반올림 방식과 계수 적용 순서를 유지한다.
        return parseInt(coefficients[0] * common + coefficients[1] * elective + coefficients[2] + 0.5);
    }

    function calculateSplit(rows, choice, common, elective, subject) {
        const { commonMax, electiveMax } = subjects[subject];
        if (isEmpty(common) || isEmpty(elective)) return repeat("");
        if (!isValidPart(common, commonMax) || !isValidPart(elective, electiveMax)) return repeat("X");
        const coefficients = rows?.[0]?.[choice];
        if (!coefficients) return repeat("N/A");
        const standard = toStandard(coefficients, Number(common), Number(elective));
        const match = rows.slice(1).find(row => row?.[0] == standard);
        return [standard, match ? match[1] : "N/A", match ? match[2] : "N/A"];
    }

    function reverseWithElective(coefficients, standard, elective, { commonMax }) {
        // 기존 역산의 반올림 경계(0.49999)와 절삭 규칙을 보존한다.
        const [a, b, c] = coefficients;
        const min = parseInt(1 + ((standard - 0.5) - c - b * elective) / a);
        const max = parseInt(((standard + 0.49999) - c - b * elective) / a);
        if (!isValidPart(min, commonMax) || !isValidPart(max, commonMax)) return "N/A";
        return formatRange(min + elective, max + elective);
    }

    function extremeStandards(total, coefficients, { commonMax, electiveMax }) {
        let elective = Math.min(total, electiveMax);
        let common = total - elective;
        if (total === electiveMax - 1) { common = 2; elective = total - common; }
        if (total === electiveMax + 1) { common = 3; elective = total - common; }
        const electiveFirst = toStandard(coefficients, common, elective);

        common = Math.min(total, commonMax);
        elective = total - common;
        if (total === commonMax - 1) { elective = 2; common = total - elective; }
        if (total === commonMax + 1) { elective = 3; common = total - elective; }
        return [electiveFirst, toStandard(coefficients, common, elective)];
    }

    function reverseWithoutElective(coefficients, standard, subject) {
        let min = -1;
        let max = -1;
        for (let total = 0; total <= 100; total++) {
            if (total === 1 || total === 99) continue;
            const extremes = extremeStandards(total, coefficients, subject);
            if (min === -1 && extremes.some(score => score >= standard)) min = total;
            if (extremes.some(score => score <= standard)) max = total;
        }
        return formatRange(min, max);
    }

    function reverseSplit(rows, choice, value, elective, subject) {
        if (isEmpty(value)) return "";
        if (!isValidScore(value, { max: 200 })) return "X";
        const coefficients = rows?.[0]?.[choice];
        if (!coefficients) return "N/A";
        const spec = subjects[subject];
        if (isValidPart(elective, spec.electiveMax)) {
            return reverseWithElective(coefficients, Number(value), Number(elective), spec);
        }
        return reverseWithoutElective(coefficients, Number(value), spec);
    }

    return { subjects, rules, isEmpty, isValidScore, isValidPart, lookupRaw,
        lookupStandard, absoluteGrade, calculateSplit, reverseSplit };
})();
