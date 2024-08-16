const tableType1 = 
'<table>\
    <caption></caption>\
    <thead>\
        <tr>\
            <th width = "15%">과목</th>\
            <th width = "20%">선택과목</th>\
            <th width = "15%">원점수</th>\
            <th width = "14%">표준점수</th>\
            <th width = "14%">백분위</th>\
            <th width = "8%">등급</th>\
            <th width = "14%">통계자료</th>\
        </tr>\
    </thead>\
    <tbody>\
        <tr class="kor">\
            <td>국어</td>\
            <td>-</td>\
            <td class="kw"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="kp"></td>\
            <td class="kb"></td>\
            <td class="kd"></td>\
            <td><button type="button" onclick="printTable(0)">보기</button></td>\
        </tr>\
        <tr class="math">\
            <td>수학</td>\
            <td>-</td>\
            <td class="mw"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="mp"></td>\
            <td class="mb"></td>\
            <td class="md"></td>\
            <td><button type="button" onclick="printTable(1)">보기</button></td>\
        </tr>\
        <tr>\
            <td>영어</td>\
            <td>-</td>\
            <td class="ew"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td>-</td>\
            <td>-</td>\
            <td class="ed"></td>\
            <td><button type="button" onclick="printTable(2)">보기</button></td>\
        </tr>\
        <tr>\
            <td>한국사</td>\
            <td>-</td>\
            <td class="hw"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td>-</td>\
            <td>-</td>\
            <td class="hd"></td>\
            <td><button type="button" onclick="printTable(3)">보기</button></td>\
        </tr>\
        <tr id="ex1">\
            <td rowspan="2">탐구</td>\
            <td class="ex1s"></td>\
            <td class="ex1w"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="ex1p"></td>\
            <td class="ex1b"></td>\
            <td class="ex1d"></td>\
            <td><button type="button" onclick="printTable(4)">보기</button></td>\
        </tr>\
        <tr id="ex2">\
            <td class="ex2s"></td>\
            <td class="ex2w"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="ex2p"></td>\
            <td class="ex2b"></td>\
            <td class="ex2d"></td>\
            <td><button type="button" onclick="printTable(5)">보기</button></td>\
        </tr>\
        <tr id="sfl">\
            <td>제2외국어/한문</td>\
            <td class="ss"><select onchange=showInfo1()></select></td>\
            <td class="sw"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class>-</td>\
            <td class>-</td>\
            <td class="sd"></td>\
            <td><button type="button" onclick="printTable(6)">보기</button></td>\
        </tr>\
    </tbody>\
</table>\
    <ul>\
    <li>모바일로 접속하신 경우, 반드시 <strong>선택과목을 먼저 지정</strong>하신 후에 점수를 입력해주세요.<br>\
    점수를 먼저 입력하고 선택과목을 나중에 바꾸면 계산 결과가 이전 선택과목 기준으로 출력되는 문제가 있습니다.</li>\
    <li>유효하지 않은 원점수를 입력하면 결과가 "X"로 나옵니다.<br>\
        <span style="color:blue">\
            *** 유효한 원점수란? ***<br>\
            1) 국어, 수학, 영어: 0부터 100까지의 정수 <span style="color:red">(1과 99는 유효하지 않음)</span><br>\
            2) 한국사, 탐구: 0부터 50까지의 정수 <span style="color:red">(1과 49는 유효하지 않음)</span><br>\
            3) 제2외국어/한문: 0부터 50까지의 정수</li>\
        </span>\
    </ul>\
';

const tableType2 = 
'<table>\
<caption></caption>\
    <thead>\
        <tr>\
            <th rowspan="2" width="18%">과목</th>\
            <th rowspan="2" width="20%">선택과목</th>\
            <th colspan="2" width="18%">원점수</th>\
            <th rowspan="2" width="12%">표준점수</th>\
            <th rowspan="2" width="12%">백분위</th>\
            <th rowspan="2" width="8%">등급</th>\
            <th rowspan="2" width="12%">통계자료</th>\
        </tr>\
        <tr>\
            <th width="0%">공통</th>\
            <th width="0%">선택</th>\
        </tr>\
    </thead>\
    <tbody>\
        <tr id="kor">\
            <td>국어</td>\
            <td class="ks"></td>\
            <td class="kw1"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="kw2"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="kp"></td>\
            <td class="kb"></td>\
            <td class="kd"></td>\
            <td><button type="button" onclick="printTable(0)">보기</button></td>\
        </tr>\
        <tr id="math">\
            <td>수학</td>\
            <td class="ms"></td>\
            <td class="mw1"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="mw2"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="mp"></td>\
            <td class="mb"></td>\
            <td class="md"></td>\
            <td><button type="button" onclick="printTable(1)">보기</button></td>\
        </tr>\
        <tr>\
            <td>영어</td>\
            <td>-</td>\
            <td colspan="2" class="ew"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td>-</td>\
            <td>-</td>\
            <td class="ed"></td>\
            <td><button type="button" onclick="printTable(2)">보기</button></td>\
        </tr>\
        <tr>\
            <td>한국사</td>\
            <td>-</td>\
            <td colspan="2" class="hw"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td>-</td>\
            <td>-</td>\
            <td class="hd"></td>\
            <td><button type="button" onclick="printTable(3)">보기</button></td>\
        </tr>\
        <tr id="ex1">\
            <td rowspan="2">탐구</td>\
            <td class="ex1s"></td>\
            <td colspan="2" class="ex1w"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="ex1p"></td>\
            <td class="ex1b"></td>\
            <td class="ex1d"></td>\
            <td><button type="button" onclick="printTable(4)">보기</button></td>\
        </tr>\
        <tr id="ex2">\
            <td class="ex2s"></td>\
            <td colspan="2" class="ex2w"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td class="ex2p"></td>\
            <td class="ex2b"></td>\
            <td class="ex2d"></td>\
            <td><button type="button" onclick="printTable(5)">보기</button></td>\
        </tr>\
        <tr id="sfl">\
            <td>제2외국어/한문</td>\
            <td class="ss"><select onchange=showInfo1()></select></td>\
            <td colspan="2" class="sw"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo1()" style=""></input></td>\
            <td>-</td>\
            <td>-</td>\
            <td class="sd"></td>\
            <td><button type="button" onclick="printTable(6)">보기</button></td>\
        </tr>\
    </tbody>\
</table>\
<ul>\
    <li>모바일로 접속하신 경우, 반드시 <strong>선택과목을 먼저 지정</strong>하신 후에 점수를 입력해주세요.<br>\
    점수를 먼저 입력하고 선택과목을 나중에 바꾸면 계산 결과가 이전 선택과목 기준으로 출력되는 문제가 있습니다.</li>\
    <li>국어 공통과목 원점수 만점: 76점, 선택과목 원점수 만점: 24점</li>\
    <li>수학 공통과목 원점수 만점: 74점, 선택과목 원점수 만점: 26점</li>\
    <li>\
        유효하지 않은 원점수를 입력하면 결과가 "X"로 나옵니다.<br>\
        <span style="color:blue">\
            *** 유효한 원점수란? ***<br>\
            1-1) 국어 공통과목: 0부터 76까지의 정수 <span style="color:red">(1과 75는 유효하지 않음)</span><br>\
            1-2) 국어 선택과목: 0부터 24까지의 정수 <span style="color:red">(1과 23은 유효하지 않음)</span><br>\
            2-1) 수학 공통과목: 0부터 74까지의 정수 <span style="color:red">(1과 73은 유효하지 않음)</span><br>\
            2-2) 수학 선택과목: 0부터 26까지의 정수 <span style="color:red">(1과 25는 유효하지 않음)</span><br>\
            3) 영어: 0부터 100까지의 정수 <span style="color:red">(1과 99는 유효하지 않음)</span><br>\
            4) 한국사, 탐구: 0부터 50까지의 정수 <span style="color:red">(1과 49는 유효하지 않음)</span><br>\
            5) 제2외국어/한문: 0부터 50까지의 정수\
        </span>\
    </li>\
</ul>\
';


const tableType3 = 
'<table class="rev">\
    <caption></caption>\
    <thead>\
        <tr>\
            <th width = "19%">과목</th>\
            <th width = "24%">선택과목</th>\
            <th width = "19%">표준점수</th>\
            <th width = "19%">원점수</th>\
            <th width = "19%">통계자료</th>\
        </tr>\
    </thead>\
    <tbody>\
        <tr id="kor">\
            <td>국어</td>\
            <td>-</td>\
            <td class="kp"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="kw"></td>\
            <td><button type="button" onclick="printTable(0)">보기</button></td>\
        </tr>\
        <tr id="math">\
            <td>수학</td>\
            <td>-</td>\
            <td class="mp"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="mw"></td>\
            <td><button type="button" onclick="printTable(1)">보기</button></td>\
        <tr></tr>\
        <tr></tr>\
        </tr>\
        <tr id="ex1">\
            <td rowspan="2">탐구</td>\
            <td class="ex1s"></td>\
            <td class="ex1w"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="ex1d"></td>\
            <td><button type="button" onclick="printTable(4)">보기</button></td>\
        </tr>\
        <tr id="ex2">\
            <td class="ex2s"></td>\
            <td class="ex2w"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="ex2d"></td>\
            <td><button type="button" onclick="printTable(5)">보기</button></td>\
        </tr>\
    </tbody>\
</table>\
<ul>\
    <li>모바일로 접속하신 경우, 반드시 <strong>선택과목을 먼저 지정</strong>하신 후에 점수를 입력해주세요.<br>\
    점수를 먼저 입력하고 선택과목을 나중에 바꾸면 계산 결과가 이전 선택과목 기준으로 출력되는 문제가 있습니다.</li>\
    <li>\
        유효하지 않은 표준점수를 입력하면 결과가 "X"로 나옵니다.<br>\
        <span style="color:blue">\
            *** 유효한 표준점수란? ***<br>\
            1) 국어, 수학: 0부터 200까지의 정수<br>\
            2) 탐구: 0부터 100까지의 정수<br>\
        </span>\
    </li>\
    <li>\
        입력된 표준점수가 유효하지만 해당 시험에 없는 표준점수일 경우에는 결과에 "N/A"가 출력됩니다.<br>\
        <span style="color:#888888">예) 어떤 과목 만점자의 표준점수가 141인데, 이 과목 표준점수를 142로 입력하면 N/A 출력</span>\
    </li>\
</ul>\
';

const tableType4 = 
'<table class="rev">\
    <caption></caption>\
    <thead>\
        <tr>\
            <th width = "15%">과목</th>\
            <th width = "20%">선택과목</th>\
            <th width = "14%">표준점수</th>\
            <th width = "14%">선택과목<br>원점수</th>\
            <th width = "14%">원점수<br>(공통+선택)</th>\
            <th width = "14%">통계자료</th>\
        </tr>\
    </thead>\
    <tbody>\
        <tr id="kor">\
            <td>국어</td>\
            <td></td>\
            <td class="kw"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="kd"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="kb"></td>\
            <td><button type="button" onclick="printTable(0)">보기</button></td>\
        </tr>\
        <tr id="math">\
            <td>수학</td>\
            <td></td>\
            <td class="mw"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="md"><input type="text" name="score" maxlength="2" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="mb"></td>\
            <td><button type="button" onclick="printTable(1)">보기</button></td>\
        </tr>\
        <tr></tr>\
        <tr></tr>\
        <tr id="ex1">\
            <td rowspan="2">탐구</td>\
            <td class="ex1s"></td>\
            <td class="ex1w"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="ex1d">-</td>\
            <td class="ex2b"></td>\
            <td><button type="button" onclick="printTable(4)">보기</button></td>\
        </tr>\
        <tr id="ex2">\
            <td class="ex2s"></td>\
            <td class="ex2w"><input type="text" name="score" maxlength="3" placeholder="입력란" onchange="showInfo2()" style=""></input></td>\
            <td class="ex2d">-</td>\
            <td class="ex2b"></td>\
            <td><button type="button" onclick="printTable(5)">보기</button></td>\
        </tr>\
    </tbody>\
</table>\
<ul>\
    <li>모바일로 접속하신 경우, 반드시 <strong>선택과목을 먼저 지정</strong>하신 후에 점수를 입력해주세요.<br>\
    점수를 먼저 입력하고 선택과목을 나중에 바꾸면 계산 결과가 이전 선택과목 기준으로 출력되는 문제가 있습니다.</li>\
    <li>\
        유효하지 않은 표준점수를 입력하면 결과가 "X"로 나옵니다.<br>\
        <span style="color:blue">\
            *** 유효한 표준점수란? ***<br>\
            1) 국어, 수학: 0부터 200까지의 정수<br>\
            2) 탐구: 0부터 100까지의 정수<br>\
        </span>\
    </li>\
    <li>\
        입력된 표준점수가 유효하지만 해당 시험에 없는 표준점수일 경우에는 결과에 "N/A"가 출력됩니다.<br>\
        <span style="color:#888888">예) 어떤 과목 만점자의 표준점수가 141인데, 이 과목 표준점수를 142로 입력하면 N/A 출력<br></span>\
    </li>\
    <li>\
        국어, 수학에서 선택과목 원점수는 입력하지 않아도 되지만, 입력하지 않으면(또는 유효하지 않은 값을 입력하면) <strong>가능한 원점수의 전체 범위</strong>가 출력됩니다. \
        정확한 점수를 알고 싶다면 선택과목 원점수를 대략적으로라도 예상해서 입력하시기 바랍니다.<br>\
        <span style="color:blue">\
            *** 유효한 선택과목 원점수란? ***<br>\
            1) 국어: 0부터 24까지의 정수 <span style="color:red">(1과 23은 유효하지 않음)</span><br>\
            2) 수학: 0부터 26까지의 정수 <span style="color:red">(1과 25는 유효하지 않음)</span><br>\
        </span>\
    </li>\
    <li>\
        국어, 수학에서 결과로 출력된 원점수는 <strong>공통과목 원점수와 선택과목 원점수가 합산</strong>된 값입니다.<br>\
    </li>\
    <li>\
        국어, 수학에서 표준점수와 선택과목 원점수를 유효하게 입력했지만, 이에 대응되는 공통과목 원점수가 존재하지 않으면 "N/A"가 출력됩니다.<br> \
        <span style="color:#888888">예) 공통과목 <strong>만점</strong> + 선택과목 18점을 표준점수로 환산하면 132점이 되는 과목이 있다고 가정했을 때, 이 과목의 표준점수를 133으로 입력하고 선택과목 원점수를 18로 입력하면 N/A 출력<br></style>\
    </li>\
</ul>\
';