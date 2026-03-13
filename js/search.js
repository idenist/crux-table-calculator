// 초깃값 설정
const typeEls = document.querySelectorAll("input[name='test_type']");
let yearEl = document.querySelector("#year");   
let monthEl = document.querySelector("#month"); 
let typeEl = document.querySelector("#test_type");
let year, month, type; // 버튼을 눌렀을 때만 확정되는 값
let tbodyEl;

// select 요소의 option을 수정하는 함수
// SaM : Sat and Month일 때, 그러니까 시험 유형이 'sat'이고 'monthEl'을 바꿀 때만 true
function changeOpts(parent, newChild, SaM = false) {
    // 기존 옵션 삭제
    while(parent.firstElementChild) 
        parent.removeChild(parent.firstElementChild);
    // 새로운 옵션 추가
    newChild.forEach((newVal) => {
        const optEl = document.createElement("option");
        optEl.value = newVal;
        if(!SaM) {
            optEl.innerText = newVal;
        } else {
            if(newVal != "11") {
                optEl.innerText = "대학수학능력시험 " + newVal + "월 모의평가";
            } else {
                optEl.innerText = "대학수학능력시험";
            }
        }
        parent.appendChild(optEl);
    })
}
// 라디오버튼 바뀔 때 시험명 형식이 다르게 출력되도록
typeEls.forEach((type) => { 
    type.addEventListener("change", (e) => {
        typeEl = e.currentTarget;
        const type = typeEl.value;  // 전역 type은 버튼을 눌렀을 때만 변경되어야 하므로 지역 변수를 따로 선언
        const TNSE = document.querySelector("p#test_name > span");  // Test Name Span Element
        let years, months;
        // years와 months의 옵션 지정 ({수능, {3학년, {1,2학년}}}의 논리로 구성되어 있음)
        if(type == "sat") {
            years = ["2027", "2026", "2025", "2024", "2023", "2022"]; 
            months = ["6", "9", "11"];
            TNSE.innerText = ""
        } else {
            years = ["2026", "2025", "2024", "2023", "2022"]; // years는 1st~3rd가 공통됨 
            if(type == "3rd") {
                months = ["3", "5", "7", "10"]; // 2024 추가 이후에는 5로 바꾸기
                TNSE.innerText = "월 고3 전국연합학력평가";
            } else {
                months = ["3", "6", "9", "10"]; // months는 1st, 2nd가 공통됨 (2024 추가 이후에는 10으로 바꾸기)
                if(type == "2nd")
                    TNSE.innerText = "월 고2 전국연합학력평가";
                else
                    TNSE.innerText = "월 고1 전국연합학력평가";
            }
        }
        changeOpts(yearEl, years);
        changeOpts(monthEl, months, type == "sat");

        // 연도 디폴트값 설정
        if(type == "sat") {
            document.querySelector('option[value = "2026"]').selected = true; 
        } else{
            document.querySelector('option[value = "2025"]').selected = true;
        }

        // 월 디폴트값 설정
        if(type == "sat" && yearEl.value == "2026") {
            document.querySelector('option[value = "11"]').selected = true; 
        } else if(type == "3rd" && yearEl.value == "2025") {
            document.querySelector('option[value = "10"]').selected = true; 
        } else if(type == "2nd" && yearEl.value == "2025") {
            document.querySelector('option[value = "10"]').selected = true; 
        } else if(type == "1st" && yearEl.value == "2025") {
            document.querySelector('option[value = "10"]').selected = true; 
        }
    })
})

// 2024학년도부터 고3은 4월 학평이 5월 학평으로 바뀌고
// 고1,2는 11월 학평이 10월 학평으로 바뀐다.
function yearChange() {
    yearEl = document.querySelector("#year");
    monthEl = document.querySelector("#month");
    let type;
    typeEls.forEach((t) => {
        if(t.checked == true)    type = t.value;
    })
    let months;

    if(type == "sat") {
        months = (yearEl.value == 2027) ? ["11"] : ["6", "9", "11"]
    } else if(type == "3rd") {
        months = (yearEl.value == 2026) ? ["3"] :
                (yearEl.value >= 2024) ? ["3", "5", "7", "10"] : ["3", "4", "7", "10"];
    } else {
        months = (yearEl.value == 2026) ? ["3"] :
                (yearEl.value >= 2024) ? ["3", "6", "9", "10"] : ["3", "6", "9", "11"];
    }

    changeOpts(monthEl, months, type == "sat");

    // 월 디폴트값 설정
    if(type == "sat" && yearEl.value != "2026") {
        document.querySelector('option[value = "11"]').selected = true; 
    } else if(type == "sat"){
        document.querySelector('option[value = "11"]').selected = true; 
    } else if(type == "3rd" && yearEl.value == "2025") {
        document.querySelector('option[value = "10"]').selected = true; 
    } else if(type == "2nd" && yearEl.value == "2025") {
        document.querySelector('option[value = "10"]').selected = true; 
    } else if(type == "1st" && yearEl.value == "2025") {
        document.querySelector('option[value = "10"]').selected = true; 
    }
}
// 성적표 생성 함수
function makeTable(mode) {
    // 기존에 띄운 통계자료 이미지 제거
    document.querySelector("div.image").firstElementChild.innerText = "";
    document.querySelector("img.formula").removeAttribute("src"); 
    document.querySelector("img.formula").removeAttribute("alt");
    document.querySelector("img.stat").removeAttribute("src");
    document.querySelector("img.stat").removeAttribute("alt");

    const divEl = document.querySelector("div.table");

    // year, month, type 확정
    year = yearEl.value;
    month = monthEl.value;
    typeEls.forEach((t) => {
        if(t.checked == true)    type = t.value;
    })

    // 탐구 통합
    const newSystem = (type == "1st" && year >= 2025 && !(year == 2025 && month == 3))  
                        || (type == "2nd" && year >= 2026)
                        || (type == "3rd" && year >= 2027)
                        || (type == "sat" && year >= 2028)

    // 성적통지일 나온 시험만 여기에 나열할 것
    if(year == "2026" && month == "3") {
        divEl.innerText = "해당 시험의 성적 발표일은 4월 9일(목)입니다."
        return;
    }
    if(year == "2026" && month == "5") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if((type == "1st" || type == "2nd") && year == "2026" && month == "6") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if(type == "sat" && year == "2027" && month == "6") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if(year == "2026" && month == "7") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if((type == "1st" || type == "2nd") && year == "2026" && month == "9") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if(type == "sat" && year == "2027" && month == "9") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if(year == "2026" && month == "10") {
        divEl.innerText = "해당 시험의 성적 발표일은 na월 na일(na)입니다."
        return;
    }
    if(type == "sat" && year == "2027" && month == "11") {
        divEl.innerText = "해당 시험의 성적 발표일은 12월 11일(금)입니다."
        return;
    }

    if(divEl.firstChild)
        divEl.removeChild(divEl.firstChild);

    // 국어와 수학이 공통/선택으로 나뉘어 있는가? (있으면 tableType2, 없으면 tableType1)
    if(mode == 0) {
        if(newSystem)
            divEl.innerHTML = tableType5;
        else if(type == "sat" || type == "3rd") 
            divEl.innerHTML = tableType2;
        else
            divEl.innerHTML = tableType1;
    } else {
        if(type == "sat" || type == "3rd") 
            divEl.innerHTML = tableType4;
        else
            divEl.innerHTML = tableType3;
    }
    
    tbodyEl = document.querySelector("tbody"); // 표 생성 후 tbody 요소 지정

    // 제2외국어 처리 부분
    if(mode == 0) {
        const sfl = document.querySelector("#sfl");
        if(type == "1st" || type == "2nd" && month != "10" && month != "11"
            || type == "3rd" && month != "10") {
            sfl.parentNode.removeChild(sfl);
        } else {
            let sflList;
            if(type == "2nd" || type == "3rd" && month == "10") {
                sflList = ["독일어Ⅰ", "프랑스어Ⅰ", "스페인어Ⅰ", "중국어Ⅰ",
                    "일본어Ⅰ", "러시아어Ⅰ", "한문Ⅰ"];
            } else {
                sflList = ["독일어Ⅰ", "프랑스어Ⅰ", "스페인어Ⅰ", "중국어Ⅰ",
                    "일본어Ⅰ", "러시아어Ⅰ", "아랍어Ⅰ", "베트남어Ⅰ", "한문Ⅰ"];
            }

            const sflSelectEl = sfl.children[1].firstChild;
            changeOpts(sflSelectEl, sflList);
        }
    }
    
    // 탐구 처리 부분
    const ex1 = document.querySelector("#ex1");
    const ex2 = document.querySelector("#ex2");
    if(newSystem) {
        if(mode == 0) {
            if(type == "1st" && month == "3") {
                ex1.children[1].innerText = "사회";
                ex2.children[0].innerText = "과학";
            } else {
                ex1.children[1].innerText = "통합사회";
                ex2.children[0].innerText = "통합과학";
            }
        } else {
            ex1.children[1].innerText = "통합사회";
            ex2.children[0].innerText = "통합과학";
        } 
    } else if(type == "1st") {
        // 1학년인가? (1학년이면 탐구 선택과목 자동 지정, 표준점수와 등급은 지원 안 됨)
        if(mode == 0) {
            if(month == "3") {
                ex1.children[1].innerText = "사회";
                ex2.children[0].innerText = "과학";
            } else {
                ex1.children[1].innerText = "통합사회";
                ex2.children[0].innerText = "통합과학";
            }

            ex1.children[3].innerText = 
                ex1.children[4].innerText = 
                ex2.children[2].innerText = 
                ex2.children[3].innerText = "-";
        } else {
            ex1.parentNode.removeChild(ex1);
            ex2.parentNode.removeChild(ex2);
        } 
    } else {
        let expList;
        // 2학년 3~9월, 3학년 3월 (기본)
        if(type == "2nd" && month.length == 1 || type == "3rd" && month == "3")
            expList = ["생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
                "세계사", "경제", "정치와 법", "사회∙문화", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ",
                "지구과학Ⅰ"];
        // 2학년 11(10)월 (기본에서 직업탐구 추가됨)
        if(type == "2nd" && month.length == 2)
            expList = ["생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
                "세계사", "경제", "정치와 법", "사회∙문화", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ",
                "지구과학Ⅰ", "성공적인 직업생활", "농업 기초 기술", "공업 일반", "상업 경제", 
                "수산∙해운 산업 기초", "인간 발달"];
        // 3학년 4(5), 7월 (기본에서 투과목 추가됨)
        if(type == "3rd" && (month == "4" || month == "5" || month == "7"))
            expList = ["생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
            "세계사", "경제", "정치와 법", "사회∙문화", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ",
            "지구과학Ⅰ", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ"];
        // 3학년 6월, 9월, 10월, 수능 (기본에서 투과목, 직업탐구 추가됨)
        if(type == "3rd" && month == "10" || type == "sat")
            expList = ["생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
                "세계사", "경제", "정치와 법", "사회∙문화", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ",
                "지구과학Ⅰ", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ", "성공적인 직업생활",
                "농업 기초 기술", "공업 일반", "상업 경제", "수산·해운 산업 기초", "인간 발달"];
        const exp1SelectEl = document.createElement("select");
        const exp2SelectEl = document.createElement("select");
        const onclickAttr1 = document.createAttribute("onclick");
        const onclickAttr2 = document.createAttribute("onclick");
        if(mode == 0) {
            onclickAttr1.value = "showInfo1()";
            onclickAttr2.value = "showInfo1()";
        } else {
            onclickAttr1.value = "showInfo2()";
            onclickAttr2.value = "showInfo2()";
        }
        exp1SelectEl.setAttributeNode(onclickAttr1);
        exp2SelectEl.setAttributeNode(onclickAttr2);
        changeOpts(exp1SelectEl, expList);
        changeOpts(exp2SelectEl, expList);
        ex1.children[1].appendChild(exp1SelectEl);
        ex2.children[0].appendChild(exp2SelectEl);
    }

    // 국어&수학 선택과목 선택기
    if(type == "3rd" || type == "sat") {
        const korList = ["화법과 작문", "언어와 매체"];
        const mathList = ["확률과 통계", "미적분", "기하"];
        const korSelectEl = document.createElement("select");
        const mathSelectEl = document.createElement("select");
        changeOpts(korSelectEl, korList);
        changeOpts(mathSelectEl, mathList);
        tbodyEl.children[0].children[1].appendChild(korSelectEl);
        tbodyEl.children[1].children[1].appendChild(mathSelectEl);
        const onclickAttr1 = document.createAttribute("onclick");
        const onclickAttr2 = document.createAttribute("onclick");
        if(mode == 0) {
            onclickAttr1.value = "showInfo1()";
            onclickAttr2.value = "showInfo1()";
        } else {
            onclickAttr1.value = "showInfo2()";
            onclickAttr2.value = "showInfo2()";
        }
        korSelectEl.setAttributeNode(onclickAttr1);
        mathSelectEl.setAttributeNode(onclickAttr2);
    }

    // 테이블 제목
    const titleEl = document.querySelector("caption");
    if(type == "sat")  {
        if(monthEl.value == "11")
            titleEl.innerText = `${year}학년도 대학수학능력시험 성적 계산기`;
        else
            titleEl.innerText = `${year}학년도 대학수학능력시험 ${month}월 모의평가 성적 계산기`
    } else {
        titleEl.innerText = `${year}학년도 ${month}월 고${type.substring(0,1)} 전국연합학력평가 성적 계산기`
    }

    // 너비 조정
    if(mode == 0) {
        if(type == "2nd" && month.length == 2) {
            const thEl = document.querySelectorAll("th");
            thEl[0].getAttributeNode("width").value = "20%"
            thEl[1].getAttributeNode("width").value = "25%"
            thEl[2].getAttributeNode("width").value = "15%"
            thEl[3].getAttributeNode("width").value = "10%"
            thEl[4].getAttributeNode("width").value = "10%"
            thEl[5].getAttributeNode("width").value = "10%"
            thEl[6].getAttributeNode("width").value = "10%"
        }
    }
}

function showInfo1() {
    let key = year + month + type; // 딕셔너리형 데이터의 key
    // 국어&수학 처리 부분. 1~2학년은 if문에서, 3학년은 else문에서 처리
    if(type == "1st" || type == "2nd") {
        // 국어 처리 부분 (고1, 고2)
        const korEl = tbodyEl.children[0].children;
        const korScore = korEl[2].firstChild.value; // 국어 원점수  
        const KSCN = korEl[2].firstChild.getAttributeNode("style"); // 국어 원점수 스타일 노드
        // 국어 표준점수, 백분위, 등급 출력 부분 (고1, 고2)
        if(!korScore) {
            korEl[3].innerText = korEl[4].innerText = korEl[5].innerText = ''; 
        } else if (0 <= korScore && korScore <= 100 
            && korScore != 1 && korScore != 99
            && korScore % 1 == 0) {
            korEl[3].innerText = data[key]["국어"][100-korScore][0];
            korEl[4].innerText = data[key]["국어"][100-korScore][1];
            korEl[5].innerText = data[key]["국어"][100-korScore][2];
            KSCN.value = "color: #3030EE";
        } else {
            korEl[3].innerText = korEl[4].innerText = korEl[5].innerText = 'X'; 
            KSCN.value = "color: #EE3030";
        }

        // 수학 처리 부분 (고1, 고2)
        const mathEl = tbodyEl.children[1].children;
        const mathScore = mathEl[2].firstChild.value; // 수학 원점수
        const mathScoreColor = mathEl[2].firstChild.getAttributeNode("style"); // 스타일 노드
        // 수학 표준점수, 백분위, 등급 출력 부분 (고1, 고2)
        if(!mathScore) {
            mathEl[3].innerText = mathEl[4].innerText = mathEl[5].innerText = ''; 
        } else if (0 <= mathScore && mathScore <= 100 && mathScore != 1 && mathScore != 99 && mathScore % 1 == 0) {
            mathEl[3].innerText = data[key]["수학"][100-mathScore][0];
            mathEl[4].innerText = data[key]["수학"][100-mathScore][1];
            mathEl[5].innerText = data[key]["수학"][100-mathScore][2];
            mathScoreColor.value = "color: #3030EE";
        } else {
            mathEl[3].innerText = mathEl[4].innerText = mathEl[5].innerText = 'X'; 
            mathScoreColor.value = "color: #EE3030";
        }
        mathEl[2].firstChild.setAttributeNode(mathScoreColor);
    } else {
        // 국어 처리 부분 (고3, 수능)
        const korEl = tbodyEl.children[0].children;
        const korChoice = korEl[1].firstChild.value; // 국어 선택과목
        const korScore1 = korEl[2].firstChild.value; // 국어 공통과목 원점수
        const korScore2 = korEl[3].firstChild.value; // 국어 선택과목 원점수
        const KSSN1 = korEl[2].firstChild.getAttributeNode("style"); // 국어 공통과목 원점수 스타일 노드 (Korean Score Style Node 1)
        const KSSN2 = korEl[3].firstChild.getAttributeNode("style"); // 국어 선택과목 원점수 스타일 노드 (Korean Score Style Node 2)
        const korValidity1 = (0 <= korScore1 && korScore1 <= 76 && korScore1 != 1 && korScore1 != 75); // 국어 공통과목 원점수 유효성
        const korValidity2 = (0 <= korScore2 && korScore2 <= 24 && korScore2 != 1 && korScore2 != 23); // 국어 선택과목 원점수 유효성
        const korMemory = data[key]["국어"][0][korChoice] // 국어 표준점수 산출식 저장된 곳
        KSSN1.value = korValidity1 ? "color: #3030EE" : "color: #EE3030"; // 공통과목 원점수 유효하면 파란색, 아니면 빨간색
        KSSN2.value = korValidity2 ? "color: #3030EE" : "color: #EE3030"; // 선택과목 원점수 유효하면 파란색, 아니면 빨간색

        // 국어 표준점수, 백분위, 등급 출력 부분 (고3, 수능)
        if(!korScore1 || !korScore2) {
            korEl[4].innerText = korEl[5].innerText = korEl[6].innerText = ''; 
        } else if (korValidity1 && korValidity2) {
            const korStandard = parseInt(korMemory[0] * parseInt(korScore1) 
                + korMemory[1] * parseInt(korScore2) + korMemory[2] + 0.5);
            korEl[4].innerText = korStandard;

            let idx = 1;
            while(idx < data[key]["국어"].length && data[key]["국어"][idx][0] != korStandard) idx++;
            if(idx < data[key]["국어"].length) {
                korEl[5].innerText = data[key]["국어"][idx][1];
                korEl[6].innerText = data[key]["국어"][idx][2];
            } else {
                korEl[5].innerText = "N/A";
                korEl[6].innerText = "N/A";
            }
        } else {
            korEl[4].innerText = korEl[5].innerText = korEl[6].innerText = 'X'; 
        }

        // 수학 처리 부분 (고3, 수능)
        const mathEl = tbodyEl.children[1].children;
        const mathChoice = mathEl[1].firstChild.value; // 수학 선택과목
        const mathScore1 = mathEl[2].firstChild.value; // 수학 공통과목 원점수
        const mathScore2 = mathEl[3].firstChild.value; // 수학 선택과목 원점수
        const MSSN1 = mathEl[2].firstChild.getAttributeNode("style"); // 수학 공통과목 원점수 스타일 노드 (Math Score Style Node 1)
        const MSSN2 = mathEl[3].firstChild.getAttributeNode("style"); // 수학 선택과목 원점수 스타일 노드 (Math Score Style Node 2)
        const MathValidity1 = (0 <= mathScore1 && mathScore1 <= 74 && mathScore1 != 1 && mathScore1 != 73);
        const MathValidity2 = (0 <= mathScore2 && mathScore2 <= 26 && mathScore2 != 1 && mathScore2 != 25);
        const mathMemory = data[key]["수학"][0][mathChoice] // 수학 표준점수 산출식 저장된 곳
        MSSN1.value = MathValidity1 ? "color: #3030EE" : "color: #EE3030"; // 공통과목 원점수 유효하면 파란색, 아니면 빨간색
        MSSN2.value = MathValidity2 ? "color: #3030EE" : "color: #EE3030"; // 선택과목 원점수 유효하면 파란색, 아니면 빨간색

        // 수학 표준점수, 백분위, 등급 출력 부분 (고3, 수능)
        if(!mathScore1 || !mathScore2) {
            mathEl[4].innerText = mathEl[5].innerText = mathEl[6].innerText = ''; 
        } else if (MathValidity1 && MathValidity2) {
            const mathStandard = parseInt(mathMemory[0] * parseInt(mathScore1) 
                + mathMemory[1] * parseInt(mathScore2) + mathMemory[2] + 0.5);
                mathEl[4].innerText = mathStandard;

            let idx = 1;
            while(idx < data[key]["수학"].length && data[key]["수학"][idx][0] != mathStandard) idx++;
            if(idx < data[key]["수학"].length) {
                mathEl[5].innerText = data[key]["수학"][idx][1];
                mathEl[6].innerText = data[key]["수학"][idx][2];
            } else {
                mathEl[5].innerText = "N/A";
                mathEl[6].innerText = "N/A";
            }
        } else {
            mathEl[4].innerText = mathEl[5].innerText = mathEl[6].innerText = 'X'; 
        }
    }

    // 영어 처리 부분
    const engEl = tbodyEl.children[2].children;
    const engScore = engEl[2].firstChild.value; // 영어 원점수
    const ESSN = engEl[2].firstChild.getAttributeNode("style");
    engEl[5].innerText = 
        engScore == "" ? "" :
        engScore % 1 ? "X" : 
        engScore == 100 ? 1 : 
        0 <= engScore && engScore <= 9 && engScore != 1 ? 9 :
        2 <= engScore && engScore <= 98 ? 10-parseInt(engScore/10) : 
        "X";
    ESSN.value = engEl[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";

    // 한국사 처리 부분
    const histEl = tbodyEl.children[3].children;
    const histScore = histEl[2].firstChild.value; // 한국사 원점수
    const HSSN = histEl[2].firstChild.getAttributeNode("style");
    histEl[5].innerText = 
        histScore == "" ? "" :
        histScore == 50 ? 1 : 
        45 <= histScore && histScore <= 48 ? 1 :
        2 <= histScore && histScore <= 44 || histScore == 0 ? 10-parseInt(histScore/5+1) : 
        "X";
    HSSN.value = histEl[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";

    // 탐구 처리 부분
    const exp1El = ex1.children;
    const exp2El = ex2.children;
    const exp1Score = exp1El[2].firstChild.value; // 탐구1 원점수
    const exp2Score = exp2El[1].firstChild.value; // 탐구2 원점수
    const Ex1SSN = exp1El[2].firstChild.getAttributeNode("style");
    const Ex2SSN = exp2El[1].firstChild.getAttributeNode("style");
    // 탐구 통합
    const newSystem = (type == "1st" && year >= 2025 && !(year == 2025 && month == 3))  
                        || (type == "2nd" && year >= 2026)
                        || (type == "3rd" && year >= 2027)
                        || (type == "sat" && year >= 2028)

    if(newSystem) {
        let subject = "통합사회";
        // 원점수 처리 (탐구 1선택)
        if(!exp1Score) {
            exp1El[3].innerText = exp1El[4].innerText = exp1El[5].innerText = ''; 
        } else if (0 <= exp1Score && exp1Score <= 50 
            && exp1Score != 0.5 && exp1Score != 1 && exp1Score != 49 && exp1Score != 49.5
            && exp1Score*2 % 1 == 0) {
            exp1El[3].innerText = data[key][subject][100-exp1Score*2][0];
            exp1El[4].innerText = data[key][subject][100-exp1Score*2][1];
            exp1El[5].innerText = data[key][subject][100-exp1Score*2][2];
        } else {
            exp1El[3].innerText = exp1El[4].innerText = exp1El[5].innerText = 'X'; 
        }
        Ex1SSN.value = exp1El[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";

        subject = "통합과학";
        // 원점수 처리 (탐구 2선택)
        if(!exp2Score) {
            exp2El[2].innerText = exp2El[3].innerText = exp2El[4].innerText = ''; 
        } else if (0 <= exp2Score && exp2Score <= 50 
            && exp2Score != 0.5 && exp2Score != 1 && exp2Score != 49 && exp2Score != 49.5
            && exp2Score*2 % 1 == 0) {
            exp2El[2].innerText = data[key][subject][100-exp2Score*2][0];
            exp2El[3].innerText = data[key][subject][100-exp2Score*2][1];
            exp2El[4].innerText = data[key][subject][100-exp2Score*2][2];
        } else {
            exp2El[2].innerText = exp2El[3].innerText = exp2El[4].innerText = 'X'; 
        }
        Ex2SSN.value = exp2El[4].innerText != "X" ? "color: #3030EE" : "color: #EE3030";
    } else if(type == "1st") {
        exp1El[5].innerText = 
            exp1Score == "" ? "" :
            exp1Score == 50 ? 1 : 
            45 <= exp1Score && exp1Score <= 48 ? 1 :
            2 <= exp1Score && exp1Score <= 44 || exp1Score == 0 ? 10-parseInt(exp1Score/5+1) : 
            "X"
        Ex1SSN.value = exp1El[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";

        exp2El[4].innerText = 
            exp2Score == "" ? "" :
            exp2Score == 50 ? 1 : 
            45 <= exp2Score && exp2Score <= 48 ? 1 :
            2 <= exp2Score && exp2Score <= 44 || exp2Score == 0 ? 10-parseInt(exp2Score/5+1) : 
            "X"
        Ex2SSN.value = exp2El[4].innerText != "X" ? "color: #3030EE" : "color: #EE3030";
    } else {
        let subject = exp1El[1].firstChild.value;
        // 원점수 처리 (탐구 1선택)
        if(!exp1Score) {
            exp1El[3].innerText = exp1El[4].innerText = exp1El[5].innerText = ''; 
        } else if (0 <= exp1Score && exp1Score <= 50 && exp1Score != 1 && exp1Score != 49) {
            exp1El[3].innerText = data[key][subject][50-exp1Score][0];
            exp1El[4].innerText = data[key][subject][50-exp1Score][1];
            exp1El[5].innerText = data[key][subject][50-exp1Score][2];
        } else {
            exp1El[3].innerText = exp1El[4].innerText = exp1El[5].innerText = 'X'; 
        }
        Ex1SSN.value = exp1El[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";

        subject = exp2El[0].firstChild.value;
        // 원점수 처리 (탐구 2선택)
        if(!exp2Score) {
            exp2El[2].innerText = exp2El[3].innerText = exp2El[4].innerText = ''; 
        } else if (0 <= exp2Score && exp2Score <= 50 && exp2Score != 1 && exp2Score != 49) {
            exp2El[2].innerText = data[key][subject][50-exp2Score][0];
            exp2El[3].innerText = data[key][subject][50-exp2Score][1];
            exp2El[4].innerText = data[key][subject][50-exp2Score][2];
        } else {
            exp2El[2].innerText = exp2El[3].innerText = exp2El[4].innerText = 'X'; 
            console.log('vv')
        }
        Ex2SSN.value = exp2El[4].innerText != "X" ? "color: #3030EE" : "color: #EE3030";
    }

    // 제2외국어&한문 처리 부분
    if(tbodyEl.children.length == 7) {
        const sflEl = tbodyEl.children[6].children;
        const sflScore = sflEl[2].firstChild.value; // 제2외국어 원점수
        const SSSN = sflEl[2].firstChild.getAttributeNode("style");
        sflEl[5].innerText = 
            sflScore == "" ? "" :
            sflScore == 50 ? 1 : 
            0 <= sflScore && sflScore <= 4 ? 9 :
            5 <= sflScore && sflScore <= 49 ? 10-parseInt(sflScore/5) : 
            "X"
        SSSN.value = sflEl[5].innerText != "X" ? "color: #3030EE" : "color: #EE3030";
    }            
}

function showInfo2() {
    let key = year + month + type; // 딕셔너리형 데이터의 key
    // 탐구 통합
    const newSystem = (type == "1st" && year >= 2025 && !(year == 2025 && month == 3))  
                        || (type == "2nd" && year >= 2026)
                        || (type == "3rd" && year >= 2027)
                        || (type == "sat" && year >= 2028)

    // 국어&수학 처리 부분. 1~2학년은 if문에서, 3학년은 else문에서 처리
    const kor = document.querySelector("#kor").children;
    const math = document.querySelector("#math").children;
    const korStd = parseInt(kor[2].firstChild.value);
    const mathStd = parseInt(math[2].firstChild.value);
    if(type == "1st" || type == "2nd") {
        // 국어 처리 부분 (고1, 고2)
        let idx = 0;
        if(!korStd) {
            kor[3].innerText = "";
        } else if(0 <= korStd && korStd <= 200) {
            while(idx < data[key]["국어"].length && data[key]["국어"][idx][0] != korStd) idx++;
            if(idx >= data[key]["국어"].length) {
                kor[3].innerText = "N/A";
            } else {
                let idx2 = data[key]["국어"].length-1;
                while(idx2 > -1 && data[key]["국어"][idx2][0] != korStd) idx2--;
                if(idx != idx2) {
                    kor[3].innerText = `${100-idx2} ~ ${100-idx}`
                } else {
                    kor[3].innerText = 100-idx;
                }
            } 
        } else {
            kor[3].innerText = "X";
        }
        kor[2].firstChild.style = kor[3].innerText != "X" ? "color: #3030EE" : "color: #EE3030"; 

        // 수학 처리 부분 (고1, 고2)
        idx = 0;
        if(!mathStd) {
            math[3].innerText = "";
        } else if(0 <= mathStd && mathStd <= 200) {
            while(idx < data[key]["수학"].length && data[key]["수학"][idx][0] != mathStd) idx++;
            if(idx >= data[key]["수학"].length) {
                math[3].innerText = "N/A";
            } else {
                let idx2 = data[key]["수학"].length-1;
                while(idx2 > -1 && data[key]["수학"][idx2][0] != mathStd) idx2--;
                if(idx != idx2) {
                    math[3].innerText = `${100-idx2} ~ ${100-idx}`
                } else {
                    math[3].innerText = 100-idx;
                }
            } 
        } else {
            math[3].innerText = "X";
        }
        math[2].firstChild.style = math[3].innerText != "X" ? "color: #3030EE" : "color: #EE3030"; 
    } else {
        const korChoice = kor[1].firstChild.value;
        const mathChoice = math[1].firstChild.value;
        const korMemory = data[key]["국어"][0][korChoice] // 국어 표준점수 산출식 저장된 곳
        const mathMemory = data[key]["수학"][0][mathChoice] // 수학 표준점수 산출식 저장된 곳
        let k = kor[3].firstChild.value;
        let m = math[3].firstChild.value;
        // 국어 처리 부분 (고3, 수능)
        let idx = 1;
        if(!korStd) {
            kor[4].innerText = ""
        } else if(0 <= korStd && korStd <= 200) {
            kor[2].firstChild.style = "color: #3030EE";
            if(k && (k == 0 || 1 < k && k < 23 || k == 24)) {
                if(idx < data[key]["국어"].length) {
                    kor[3].firstChild.style = "color: #3030EE"
                    k = parseInt(k);
                    let min = parseInt(1 + ((korStd - 0.5) - korMemory[2] - korMemory[1]*k)/korMemory[0]);
                    let max = parseInt(((korStd + 0.49999) - korMemory[2] - korMemory[1]*k)/korMemory[0]);
                    let minValidity = (min == 0 || 1 < min && min < 75 || min == 76)
                    let maxValidity = (max == 0 || 1 < max && max < 75 || max == 76)
                    if(minValidity && maxValidity) {
                        if(min == max) {
                            kor[4].innerText = min + k;
                        } else if(min < max) {
                            kor[4].innerText = `${min + k} ~ ${max + k}`;
                        } else {
                            kor[4].innerText = "N/A";
                        }
                    }  else {
                        kor[4].innerText = "N/A";
                    }
                    kor[3].firstChild.style = "color: #3030EE"
                }
            } else {
                // 선택과목 원점수 유효하지 않음(전범위 출력)
                kor[3].firstChild.style = "color: #EE3030"
                let temp1, temp2, min=-1, max=-1;
                // 최솟값 구하기
                for(total = 0; total <= 100; total++) {
                    if(total == 1 || total == 99)
                        continue;

                    // temp1: 선택과목을 최대한 많이 맞힌 경우
                    s = total >= 24 ? 24 : total;
                    g = total - s;
                    if(total == 23) { g = 2; s = 21; }
                    if(total == 25) { g = 3; s = 22; }
                    temp1 = parseInt(g*korMemory[0] + s*korMemory[1] + korMemory[2] + 0.5);

                    // temp2: 공통과목을 최대한 많이 맞힌 경우
                    g = total >= 76 ? 76 : total;
                    s = total - g;
                    if(total == 75) { g = 73; s = 2; }
                    if(total == 77) { g = 74; s = 3; }
                    temp2 = parseInt(g*korMemory[0] + s*korMemory[1] + korMemory[2] + 0.5);

                    if(temp1 >= korStd || temp2 >= korStd) {
                        min = total;
                        break;
                    }
                }

                // 최댓값 구하기
                for(total = 100; total >= 0; total--) {
                    if(total == 1 || total == 99)
                        continue;

                    // temp1: 선택과목을 최대한 많이 맞힌 경우
                    s = total >= 24 ? 24 : total;
                    g = total - s;
                    if(total == 23) { g = 2; s = 21; }
                    if(total == 25) { g = 3; s = 22; }
                    temp1 = parseInt(g*korMemory[0] + s*korMemory[1] + korMemory[2] + 0.5);

                    // temp2: 공통과목을 최대한 많이 맞힌 경우
                    g = total >= 76 ? 76 : total;
                    s = total - g;
                    if(total == 75) { g = 73; s = 2; }
                    if(total == 77) { g = 74; s = 3; }
                    temp2 = parseInt(g*korMemory[0] + s*korMemory[1] + korMemory[2] + 0.5);

                    if(temp1 <= korStd || temp2 <= korStd) {
                        max = total;
                        break;
                    }
                }

                if(min == -1 || max == -1 || min > max)
                    kor[4].innerText = "N/A"
                else if(min == max)
                    kor[4].innerText = min;
                else   
                    kor[4].innerText = `${min} ~ ${max}`
            }
        } else {
            kor[2].firstChild.style = "color: #EE3030";
            kor[4].innerText = "X";
        }

        // 수학 처리 부분 (고3, 수능)
        idx = 1;
        if(!mathStd) {
            math[4].innerText = ""
        } else if(0 <= mathStd && mathStd <= 200) {
            math[2].firstChild.style = "color: #3030EE";
            if(m && (m == 0 || 1 < m && m < 25 || m == 26)) {
                math[3].firstChild.style = "color: #3030EE"
                m = parseInt(m);
                let min = parseInt(1 + ((mathStd - 0.5) - mathMemory[2] - mathMemory[1]*m)/mathMemory[0]);
                let max = parseInt(((mathStd + 0.49999) - mathMemory[2] - mathMemory[1]*m)/mathMemory[0]);
                let minValidity = (min == 0 || 1 < min && min < 73 || min == 74)
                let maxValidity = (max == 0 || 1 < max && max < 73 || max == 74)
                if(minValidity && maxValidity) {
                    if(min == max) {
                        math[4].innerText = min + m;
                    } else if(min < max) {
                        math[4].innerText = `${min + m} ~ ${max + m}`;
                    } else {
                        math[4].innerText = "N/A";
                    }
                } else {
                    math[4].innerText = "N/A";
                }
                math[3].firstChild.style = "color: #3030EE"
            } else {
                // 선택과목 원점수 유효하지 않음(전범위 출력)
                math[3].firstChild.style = "color: #EE3030"
                let temp1, temp2, min=-1, max=-1;
                // 최솟값 구하기
                for(total = 0; total <= 100; total++) {
                    if(total == 1 || total == 99)
                        continue;

                    // temp1: 선택과목을 최대한 많이 맞힌 경우
                    s = total >= 26 ? 26 : total;
                    g = total - s;
                    if(total == 25) { g = 2; s = 23; }
                    if(total == 27) { g = 3; s = 24; }
                    temp1 = parseInt(g*mathMemory[0] + s*mathMemory[1] + mathMemory[2] + 0.5);

                    // temp2: 공통과목을 최대한 많이 맞힌 경우
                    g = total >= 74 ? 74 : total;
                    s = total - g;
                    if(total == 73) { g = 71; s = 2; }
                    if(total == 75) { g = 72; s = 3; }
                    temp2 = parseInt(g*mathMemory[0] + s*mathMemory[1] + mathMemory[2] + 0.5);

                    if(temp1 >= mathStd || temp2 >= mathStd) {
                        min = total;
                        break;
                    }
                }

                // 최댓값 구하기
                for(total = 100; total >= 0; total--) {
                    if(total == 1 || total == 99)
                        continue;

                    // temp1: 선택과목을 최대한 많이 맞힌 경우
                    s = total >= 26 ? 26 : total;
                    g = total - s;
                    if(total == 25) { g = 2; s = 23; }
                    if(total == 27) { g = 3; s = 24; }
                    temp1 = parseInt(g*mathMemory[0] + s*mathMemory[1] + mathMemory[2] + 0.5);

                    // temp2: 공통과목을 최대한 많이 맞힌 경우
                    g = total >= 74 ? 74 : total;
                    s = total - g;
                    if(total == 73) { g = 71; s = 2; }
                    if(total == 75) { g = 72; s = 3; }
                    temp2 = parseInt(g*mathMemory[0] + s*mathMemory[1] + mathMemory[2] + 0.5);

                    if(temp1 <= mathStd || temp2 <= mathStd) {
                        max = total;
                        break;
                    }
                }

                if(min == -1 || max == -1 || min > max)
                    math[4].innerText = "N/A"
                else if(min == max)
                    math[4].innerText = min;
                else   
                    math[4].innerText = `${min} ~ ${max}`
            }
        } else {
            math[2].firstChild.style = "color: #EE3030";
            math[4].innerText = "X";
        }
    }

    const ex1 = document.querySelector("#ex1").children;
    const ex2 = document.querySelector("#ex2").children;
    const E1 = newSystem ? ex1[1].innerText : ex1[1].firstChild.value;
    const E2 = newSystem ? ex2[0].innerText :ex2[0].firstChild.value;
    const ex1Std = ex1[2].firstChild.value;
    const ex2Std = ex2[1].firstChild.value;
    const ex1Output = (newSystem || type == "2nd") ? ex1[3] : ex1[4];
    const ex2Output = (newSystem || type == "2nd") ? ex2[2] : ex2[3];

    // 탐구1 처리 부분
    let idx = 0;
    if(!ex1Std) {
        ex1Output.innerText = "";
    } else if(0 <= ex1Std && ex1Std <= 100) {
        while(idx < data[key][E1].length && data[key][E1][idx][0] != ex1Std) idx++;
        if(idx >= data[key][E1].length) {
            ex1Output.innerText = "N/A";
        } else {
            let idx2 = data[key][E1].length-1;
            while(idx2 > -1 && data[key][E1][idx2][0] != ex1Std) idx2--;
            if(idx != idx2) {
                ex1Output.innerText = newSystem ? `${((100-idx2)/2).toFixed(1)} ~ ${((100-idx)/2).toFixed(1)}` : `${50-idx2} ~ ${50-idx}`
            } else {
                ex1Output.innerText = newSystem ? ((100-idx)/2).toFixed(1) : 50-idx;
            }
        } 
    } else {
        ex1Output.innerText = "X";
    }
    ex1[2].firstChild.style = ex1Output.innerText != "X" ? "color: #3030EE" : "color: #EE3030"; 

    // 탐구2 처리 부분
    idx = 0;
    if(!ex2Std) {
        ex2Output.innerText = "";
    } else if(0 <= ex2Std && ex2Std <= 100) {
        while(idx < data[key][E2].length && data[key][E2][idx][0] != ex2Std) idx++;
        if(idx >= data[key][E2].length) {
            ex2Output.innerText = "N/A";
        } else {
            let idx2 = data[key][E2].length-1;
            while(idx2 > -1 && data[key][E2][idx2][0] != ex2Std) idx2--;
            if(idx != idx2) {
                ex2Output.innerText = newSystem ? `${((100-idx2)/2).toFixed(1)} ~ ${((100-idx)/2).toFixed(1)}` : `${50-idx2} ~ ${50-idx}`
            } else {
                ex2Output.innerText = newSystem ? ((100-idx)/2).toFixed(1) : 50-idx;
            }
        } 
    } else {
        ex2Output.innerText = "X";
    }
    ex2[1].firstChild.style = ex2Output.innerText != "X" ? "color: #3030EE" : "color: #EE3030"; 
    
}

// 크럭스 테이블 이미지 출력
function printTable (subNum) {
    document.querySelector("div.image").firstElementChild.innerText = "통계자료 이미지";
    const tbodyEl = document.querySelector("tbody");
    const imgEl = document.querySelectorAll("div.image > img");
    const subEl = tbodyEl.children[subNum].children;
    let subjectName;
    if(subNum <= 3) {
        subjectName = subEl[0].innerText;
    } else {
        if(type == "1st") {
            if(subNum == 5)
                subjectName = subEl[0].innerText;
            else   
                subjectName = subEl[1].innerText;
        } else {
            if(subNum == 5)
                subjectName = subEl[0].firstElementChild.value;
            else   
                subjectName = subEl[1].firstElementChild.value;
        }
    }
        
    const srcAttr = document.createAttribute("src");
    const altAttr = document.createAttribute("alt");
    srcAttr.value = "./img/" + year + "/" + type + "/" + month + "/" + subjectName + ".png"
    imgEl[1].setAttributeNode(srcAttr);
    
    altAttr.value = "미지원"
    imgEl[1].setAttributeNode(altAttr);
    // 3학년 국/수 표준점수 산출 공식
    if((type == "3rd" || type == "sat") && (subNum == "0" || subNum == "1")) {
        const srcAttr = document.createAttribute("src");
        srcAttr.value = "./img/" + year + "/" + type + "/" + month + "/공식.png";
        imgEl[0].setAttributeNode(srcAttr);
    } else {
        imgEl[0].removeAttribute("src");
    }
}