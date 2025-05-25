const STUDENT_COUNT = 10;
const MAX_TRIES = 5;

let boxesContent = []; // 상자 안의 숫자 배열 (1-10, 0-indexed for array, value is 1-10)
let currentStudent; // 현재 학생 번호 (1-10)
let triesLeft;
let studentResults; // 각 학생의 결과 ('pending', 'success', 'fail')
let gameOver;
let boxesOpenedThisTurn; // 현재 턴에 열어본 상자들 (인덱스)

const gameInfoEl = document.getElementById('game-info');
const currentStudentInfoEl = document.getElementById('current-student-info');
const triesLeftInfoEl = document.getElementById('tries-left-info');
const boxesContainerEl = document.getElementById('boxes-container');
const studentsStatusContainerEl = document.getElementById('students-status-container');
const startGameButtonEl = document.getElementById('start-game-button');
const resultMessageEl = document.getElementById('result-message');

// --- Utility Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCycleLengths(permutation) {
    // permutation은 0-indexed 배열, 값은 1-10.
    // 예: permutation[0] = 3 이면, 1번 상자(index 0)에 숫자 3이 들어있음.
    // 다음으로 열어볼 상자는 3번 상자 (index 2).
    const n = permutation.length;
    const visited = new Array(n).fill(false);
    const cycles = [];

    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            let current = i;
            let cycleLength = 0;
            while (!visited[current]) {
                visited[current] = true;
                // permutation 값은 1-10이므로, 다음 인덱스를 찾기 위해 -1
                current = permutation[current] - 1; 
                cycleLength++;
            }
            cycles.push(cycleLength);
        }
    }
    return cycles;
}

function generatePermutationWithMaxCycle(count, maxCycleLength) {
    let permutation;
    let isValid = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000; // 무한루프 방지

    while (!isValid && attempts < MAX_ATTEMPTS) {
        permutation = Array.from({ length: count }, (_, i) => i + 1);
        shuffleArray(permutation);
        const cycleLengths = getCycleLengths(permutation);
        if (Math.max(...cycleLengths) <= maxCycleLength) {
            isValid = true;
        }
        attempts++;
    }
    if (!isValid) {
        console.warn(`Max cycle constraint (${maxCycleLength}) not met after ${MAX_ATTEMPTS} attempts. Using last generated permutation.`);
        // 실전에서는 이 경우 에러 처리 또는 다른 방식을 고려해야 할 수 있음
    }
    return permutation;
}


// --- Game Logic Functions ---
function initializeGame() {
    currentStudent = 1;
    triesLeft = MAX_TRIES;
    studentResults = new Array(STUDENT_COUNT).fill('pending');
    gameOver = false;
    boxesOpenedThisTurn = [];

    boxesContent = generatePermutationWithMaxCycle(STUDENT_COUNT, MAX_TRIES);
    // console.log("Generated boxes:", boxesContent); // For debugging
    // console.log("Cycle lengths:", getCycleLengths([...boxesContent])); // For debugging

    renderBoxes();
    renderStudentStatusIndicators();
    updateGameInfo();
    resultMessageEl.textContent = '';
    startGameButtonEl.textContent = '게임 재시작';
}

function renderBoxes() {
    boxesContainerEl.innerHTML = '';
    for (let i = 0; i < STUDENT_COUNT; i++) {
        const boxEl = document.createElement('div');
        boxEl.classList.add('box');
        boxEl.dataset.boxId = i + 1; // 상자 번호 (1-10)

        const boxFront = document.createElement('div');
        boxFront.classList.add('box-front');
        boxFront.textContent = `상자${i + 1}`;

        const boxBack = document.createElement('div');
        boxBack.classList.add('box-back');
        // boxBack will be filled with number on open

        boxEl.appendChild(boxFront);
        boxEl.appendChild(boxBack);

        boxEl.addEventListener('click', () => handleBoxClick(i));
        boxesContainerEl.appendChild(boxEl);
    }
}

function renderStudentStatusIndicators() {
    studentsStatusContainerEl.innerHTML = '';
    for (let i = 0; i < STUDENT_COUNT; i++) {
        const statusEl = document.createElement('div');
        statusEl.classList.add('student-status');
        statusEl.textContent = `학생${i + 1}`;
        studentsStatusContainerEl.appendChild(statusEl);
    }
    updateStudentStatusUI();
}

function updateGameInfo() {
    currentStudentInfoEl.textContent = `학생 ${currentStudent}의 차례`;
    triesLeftInfoEl.textContent = `남은 시도: ${triesLeft}`;
}

function updateStudentStatusUI() {
    const statusEls = studentsStatusContainerEl.children;
    for (let i = 0; i < STUDENT_COUNT; i++) {
        statusEls[i].classList.remove('active', 'success', 'fail');
        if (studentResults[i] === 'success') {
            statusEls[i].classList.add('success');
        } else if (studentResults[i] === 'fail') {
            statusEls[i].classList.add('fail');
        } else if (i + 1 === currentStudent && !gameOver) {
            statusEls[i].classList.add('active');
        }
    }
}

function handleBoxClick(boxIndex) { // boxIndex는 0-9
    if (gameOver || boxesOpenedThisTurn.includes(boxIndex)) {
        return; // 이미 게임이 끝났거나 이번 턴에 이미 연 상자면 무시
    }

    const boxEl = boxesContainerEl.children[boxIndex];
    const revealedNumber = boxesContent[boxIndex]; // 상자 안의 실제 숫자 (1-10)
    
    // Update back of the box with the revealed number
    const boxBack = boxEl.querySelector('.box-back');
    if (boxBack) {
        boxBack.textContent = revealedNumber;
    }
    
    boxEl.classList.add('opened'); // This will trigger the flip animation
    boxesOpenedThisTurn.push(boxIndex);

    triesLeft--;

    if (revealedNumber === currentStudent) { // 자신의 번호를 찾음!
        boxEl.classList.add('success'); 
        studentResults[currentStudent - 1] = 'success';
        resultMessageEl.textContent = `학생 ${currentStudent} 성공!`;
        resultMessageEl.style.color = '#2ecc71'; // Green for success message
        updateStudentStatusUI();

        // 모든 학생이 성공했는지 확인
        if (studentResults.every(status => status === 'success')) {
            endGame(true); // 모든 학생 성공
        } else {
            // 현재 학생이 성공했고, 아직 모든 학생이 성공하지 않았으므로 상자를 다시 섞습니다.
            // cycle의 최대 길이는 MAX_TRIES (5)로 제한됩니다.
            boxesContent = generatePermutationWithMaxCycle(STUDENT_COUNT, MAX_TRIES);
            // console.log(`Boxes reshuffled after student ${currentStudent} success. New cycle lengths:`, getCycleLengths([...boxesContent])); // For debugging
            
            // 바로 다음 학생으로 (잠시 후)
            setTimeout(() => {
                nextStudent();
            }, 1000); 
        }
    } else { // 못 찾음
        boxEl.classList.add('incorrect');
        if (triesLeft === 0) { // 시도 횟수 소진
            studentResults[currentStudent - 1] = 'fail';
            updateStudentStatusUI();
            endGame(false); // 한 명이라도 실패하면 선생님 승리
        } else {
            // 계속 시도 가능
            updateGameInfo();
        }
    }
    if (!gameOver) updateGameInfo(); // 게임오버가 아니면 정보 업데이트
}

function nextStudent() {
    if (gameOver) return;

    currentStudent++;
    if (currentStudent > STUDENT_COUNT) {
        // 이 경우는 모든 학생이 성공했을 때만 발생 (위에서 처리됨)
        // 만약의 경우를 대비해 endGame(true) 호출할 수 있으나, 로직상 불필요.
        return;
    }
    triesLeft = MAX_TRIES;
    boxesOpenedThisTurn = [];
    resetBoxDisplays();
    updateGameInfo();
    updateStudentStatusUI();
    resultMessageEl.textContent = '';
}

function resetBoxDisplays() {
    const boxEls = boxesContainerEl.children;
    for (let i = 0; i < boxEls.length; i++) {
        const boxEl = boxEls[i];
        const boxFront = boxEl.querySelector('.box-front');
        const boxBack = boxEl.querySelector('.box-back');

        if (boxFront) {
            boxFront.textContent = `상자${i + 1}`;
        }
        if (boxBack) {
            boxBack.textContent = ''; // Clear revealed number
        }
        boxEl.classList.remove('opened', 'success', 'incorrect');
    }
}

function endGame(didStudentsWin) {
    gameOver = true;
    if (didStudentsWin) {
        resultMessageEl.textContent = '모든 학생 성공! 학생들 승리! 🎉';
        resultMessageEl.style.color = '#2ecc71'; // Consistent green
    } else {
        resultMessageEl.textContent = `학생 ${currentStudent} 실패! 선생님 승리! 😥`;
        resultMessageEl.style.color = '#e74c3c'; // Consistent red
        // 실패한 학생을 빨갛게 표시 (이미 fail로 처리됨)
        const failedStudentIndicator = studentsStatusContainerEl.children[currentStudent - 1];
        if (failedStudentIndicator) {
            failedStudentIndicator.classList.add('fail');
        }
    }
    // 모든 상자 내용 공개 (선택적)
    // for (let i = 0; i < STUDENT_COUNT; i++) {
    //     boxesContainerEl.children[i].textContent = boxesContent[i];
    //     boxesContainerEl.children[i].classList.add('opened');
    // }
}


// --- Event Listeners ---
startGameButtonEl.addEventListener('click', initializeGame);

// --- Initial Setup (Optional, if you want to show something before game starts) ---
// renderStudentStatusIndicators(); // 학생 상태 먼저 보여주기
// resultMessageEl.textContent = "게임을 시작하세요.";
