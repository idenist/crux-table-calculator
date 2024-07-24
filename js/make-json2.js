const xlsx = require('xlsx');

const fileName = "2311-3";
const workbook = xlsx.readFile('./xlsm/'+fileName+'.xlsx');
const kormath = ["국어", "수학"];
const exp = ["생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사",
                "세계사", "경제", "정치와 법", "사회∙문화", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ",
                "지구과학Ⅰ", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ", "성공적인 직업생활", "농업 기초 기술",
                "공업 일반", "상업 경제", "수산·해운 산업 기초", "인간 발달"];
const kormath3 = ["국어 백분위 표", "수학 백분위 표"];

for(let i=0; i<workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    if(!(kormath3.includes(sheetName) ||
        kormath.includes(sheetName) ||
        exp.includes(sheetName))) {
        continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if(kormath.includes(sheetName)) {
        console.log('"' + sheetName + '": [')
        for(let row = 7; row <= 107; row++) {
            if(row == 8 || row == 106) {
                console.log('[],');
                continue;
            }
                let stdScore;
                let grade;
                let percentile;
            if(sheet["D" + String(row)]) {
                stdScore = sheet["D" + String(row)].w;
                grade = sheet["E" + String(row)].w;
                percentile = sheet["F" + String(row)].w;
            } else {
                stdScore = sheet["D" + String(row-1)].w;
                grade = sheet["E" + String(row-1)].w;
                percentile = sheet["F" + String(row-1)].w;
            }

            console.log('["' + stdScore + '", "' + percentile.replace(' ', '') + '", "' + grade + '"],'); 
        }
        console.log("],");
    } else if(exp.includes(sheetName)) {
        console.log('"' + sheetName + '": {')
        for(let row = 7; row <= 57; row++) {
            if(row == 8 || row == 56) {
                continue;
            }
                let stdScore;
                let grade;
                let percentile;
            if(sheet["D" + String(row)]) {
                stdScore = sheet["D" + String(row)].w;
                grade = sheet["E" + String(row)].w;
                percentile = sheet["F" + String(row)].w;
            } else {
                let i = 1;
                while(!sheet["D" + String(row-i)]) i++;
                stdScore = sheet["D" + String(row-i)].w;
                grade = sheet["E" + String(row-i)].w;
                percentile = sheet["F" + String(row-i)].w;
            }

            console.log(stdScore + ': [' + + percentile.replace(' ', '') + ', ' + grade + '],'); 
        }
        console.log("},");
    } else if(kormath3.includes(sheetName)) {
        console.log('"' + sheetName.substring(0,2) + '": {')
        for(let row = 6; row <= 200; row++) {
            let stdScore;
            let grade;
            let percentile;
            if(sheet["B" + String(row)] && sheet["B" + String(row)].w != "0") {
                stdScore = sheet["B" + String(row)].w;
                grade = sheet["C" + String(row)].w;
                percentile = sheet["D" + String(row)].w;
            } else {
                console.log("},");
                break;
            }
            console.log(stdScore + ': [' + percentile.replace(' ', '') + ', ' + grade + '], '); 
        }
    }
}