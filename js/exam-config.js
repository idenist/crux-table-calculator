// 시험 일정과 교육과정 규칙. 새 시험을 공개할 때는 이 파일의 설정을 갱신한다.
const ExamConfig = (() => {
    const firstYear = 2022;
    const latest = {
        sat: { year: "2027", month: "9" },
        school: { year: "2026", month: "10" },
    };
    const baseInquirySubjects = [
        "생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
        "세계사", "경제", "정치와 법", "사회·문화",
        "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ", "지구과학Ⅰ",
    ];
    const advancedScienceSubjects = ["물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ"];
    const foreignLanguages = ["독일어", "프랑스어", "스페인어", "중국어", "일본어", "러시아어"];
    // 아직 공개하지 않은 시험의 기존 안내 문구를 보존한다.
    const releaseNotices = [
        { year: "2027", months: ["3", "5", "7"], date: "na월 na일(na)" },
        { year: "2027", months: ["6", "9"], types: ["1st", "2nd"], date: "na월 na일(na)" },
        { year: "2028", months: ["6"], types: ["sat"], date: "na월 na일(na)" },
        { year: "2028", months: ["9"], types: ["sat"], date: "na월 na일(화)" },
        { year: "2028", months: ["10"], date: "na월 na일(목)" },
        { year: "2027", months: ["11"], types: ["sat"], date: "12월 11일(금)" },
    ];

    function getLatest(type) {
        return latest[type === "sat" ? "sat" : "school"];
    }

    function getYears(type) {
        const lastYear = Number(getLatest(type).year);
        return Array.from({ length: lastYear - firstYear + 1 }, (_, i) => String(lastYear - i));
    }

    function getMonths({ type, year }) {
        if (type === "sat") return Number(year) === 2028 ? ["11"] : ["6", "9", "11"];
        if (Number(year) === 2027) return ["3"];
        if (type === "3rd") return Number(year) >= 2024 ? ["3", "5", "7", "10"] : ["3", "4", "7", "10"];
        return Number(year) >= 2024 ? ["3", "6", "9", "10"] : ["3", "6", "9", "11"];
    }

    function getDefaultMonth(exam) {
        if (String(exam.year) === getLatest(exam.type).year) return getLatest(exam.type).month;
        return exam.type === "sat" ? "11" : getMonths(exam)[0];
    }

    function isIntegrated({ type, year, month }) {
        return (type === "1st" && year >= 2025 && !(year == 2025 && month == 3))
            || (type === "2nd" && year >= 2026)
            || (type === "3rd" && year >= 2027)
            || (type === "sat" && year >= 2028);
    }

    function hasElectives(exam) {
        return !isIntegrated(exam) && ["3rd", "sat"].includes(exam.type);
    }

    function hasVocationalInquiry({ type, year, month }) {
        return (type === "2nd" && Number(year) >= 2026 && Number(month) === 10)
            || (type === "3rd" && Number(year) >= 2027 && Number(month) === 10)
            || (type === "sat" && Number(year) >= 2028);
    }

    function getInquirySubjects({ type, month }) {
        const subjects = [...baseInquirySubjects];
        if (type === "sat" || (type === "3rd" && month !== "3")) subjects.push(...advancedScienceSubjects);
        if (type === "sat" || month === "10" || month === "11") {
            // 과목명과 이미지 파일명은 가운뎃점 U+00B7로 통일한다.
            subjects.push("성공적인 직업생활", "농업 기초 기술", "공업 일반", "상업 경제",
                "수산·해운 산업 기초", "인간 발달");
        }
        return subjects;
    }

    function getForeignLanguages(exam) {
        const { type, month } = exam;
        const offered = type === "sat" || (type === "3rd" && month === "10")
            || (type === "2nd" && ["10", "11"].includes(month));
        if (!offered) return [];
        const subjects = [...foreignLanguages];
        if (type === "sat") subjects.push("아랍어", "베트남어");
        subjects.push("한문");
        return subjects.map(subject => isIntegrated(exam) ? subject : `${subject}Ⅰ`);
    }

    function getInquiryNames({ type, month }) {
        return type === "1st" && month === "3" ? ["사회", "과학"] : ["통합사회", "통합과학"];
    }

    function getReleaseNotice(exam) {
        const notice = releaseNotices.find(rule => rule.year === String(exam.year)
            && rule.months.includes(String(exam.month)) && (!rule.types || rule.types.includes(exam.type)));
        return notice ? `해당 시험의 성적 발표일은 ${notice.date}입니다.` : "";
    }

    function getTitle({ type, year, month }) {
        if (type !== "sat") return `${year}학년도 ${month}월 고${type[0]} 전국연합학력평가 성적 계산기`;
        const name = month === "11" ? "대학수학능력시험" : `대학수학능력시험 ${month}월 모의평가`;
        return `${year}학년도 ${name} 성적 계산기`;
    }

    return { getLatest, getYears, getMonths, getDefaultMonth, isIntegrated, hasElectives, hasVocationalInquiry,
        getInquirySubjects, getForeignLanguages, getInquiryNames, getReleaseNotice, getTitle };
})();
