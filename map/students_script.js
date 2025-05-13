// students_script.js

// const studentsData = [ ... ]; // 이 줄을 삭제하거나 주석 처리합니다.

const propertyKeys = ["성별", "안경", "통학", "방과후수업"];
const propertyValues = {
    "성별": ["남성", "여성"],
    "안경": ["착용", "미착용"],
    "통학": ["도보", "도보 아님"],
    "방과후수업": ["수업들음", "안들음"]
};

let loadedStudentsData = []; // 로드된 학생 데이터를 저장할 변수
let allStudents = []; 
let displayStudents = []; 
let quizStudentsPool = []; 

let currentQuizTarget = null;
let hiddenPropertyKey = '';
let correctAnswer = '';
let score = 0;
let currentQuestionNum = 0;
const totalQuestions = 10;
const passScore = 8;

// HTML Elements
const studentsTableBody = document.getElementById('students-table-body');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const scoreEl = document.getElementById('score');
const quizQuestionTextEl = document.getElementById('quiz-question-text');
const knownInfoEl = document.getElementById('known-info');
const answerOptionsEl = document.getElementById('answer-options');
const feedbackEl = document.getElementById('feedback');
const gameResultEl = document.getElementById('game-result');
const finalScoreMessageEl = document.getElementById('final-score-message');
const resultMessageEl = document.getElementById('result-message');
const restartButton = document.getElementById('restart-button');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function populateStudentTable() {
    studentsTableBody.innerHTML = ''; 
    displayStudents.forEach(student => {
        const row = studentsTableBody.insertRow();
        propertyKeys.forEach(key => {
            const cell = row.insertCell();
            cell.textContent = student[key];
        });
    });
}

function updateGameInfo() {
    currentQuestionEl.textContent = currentQuestionNum;
    totalQuestionsEl.textContent = totalQuestions;
    scoreEl.textContent = score;
}

function generateQuiz() {
    if (currentQuestionNum >= totalQuestions || quizStudentsPool.length === 0) {
        endGame();
        return;
    }

    currentQuestionNum++;
    feedbackEl.textContent = '';
    feedbackEl.className = '';

    currentQuizTarget = quizStudentsPool.pop(); 
    
    const tempPropertyKeys = [...propertyKeys]; 
    shuffleArray(tempPropertyKeys); 
    hiddenPropertyKey = tempPropertyKeys.pop(); 
    correctAnswer = currentQuizTarget[hiddenPropertyKey];

    quizQuestionTextEl.textContent = `다음 학생의 '${hiddenPropertyKey}'은(는) 무엇일까요? (ID: ${currentQuizTarget.id} 학생)`;
    
    knownInfoEl.innerHTML = '';
    tempPropertyKeys.forEach(key => { 
        const p = document.createElement('p');
        p.innerHTML = `<strong>${key}:</strong> ${currentQuizTarget[key]}`;
        knownInfoEl.appendChild(p);
    });

    answerOptionsEl.innerHTML = '';
    const options = [...propertyValues[hiddenPropertyKey]]; // 복사본 사용
    shuffleArray(options); 
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        answerOptionsEl.appendChild(button);
    });

    updateGameInfo();
}

function checkAnswer(selectedAnswer) {
    const buttons = answerOptionsEl.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.disabled = true;
    }

    if (selectedAnswer === correctAnswer) {
        feedbackEl.textContent = "정답입니다!";
        feedbackEl.className = 'correct';
        score++;
    } else {
        feedbackEl.textContent = `오답입니다. 정답은 '${correctAnswer}' 입니다.`;
        feedbackEl.className = 'incorrect';
    }
    updateGameInfo();

    setTimeout(() => {
        generateQuiz();
    }, 2000); 
}

// startGame 함수는 이제 로드된 데이터를 기반으로 게임을 설정합니다.
function startGameWithData(data) {
    score = 0;
    currentQuestionNum = 0;
    
    allStudents = [...data]; // 로드된 데이터를 사용
    displayStudents = allStudents; 
    quizStudentsPool = [...allStudents]; 
    shuffleArray(quizStudentsPool); 

    populateStudentTable(); 
    
    gameResultEl.style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';

    generateQuiz(); 
}

function endGame() {
    document.getElementById('quiz-area').style.display = 'none';
    gameResultEl.style.display = 'block';
    finalScoreMessageEl.textContent = `최종 점수: ${score} / ${totalQuestions}`;
    if (score >= passScore) {
        resultMessageEl.textContent = "축하합니다! 통과하셨습니다.";
        resultMessageEl.className = 'correct';
    } else {
        resultMessageEl.textContent = "아쉽지만, 통과하지 못했습니다. 다시 도전해보세요!";
        resultMessageEl.className = 'incorrect';
    }
}

restartButton.addEventListener('click', () => {
    // 다시 시작할 때는 이미 로드된 데이터를 사용합니다.
    if (loadedStudentsData.length > 0) {
        startGameWithData(loadedStudentsData);
    } else {
        // 데이터가 아직 로드되지 않은 경우 (이론적으로는 발생하기 어려움)
        console.error("학생 데이터가 로드되지 않아 게임을 다시 시작할 수 없습니다.");
        // 또는 initGame()을 다시 호출할 수도 있습니다.
    }
});

// 게임 초기화 및 데이터 로딩 함수
async function initGame() {
    try {
        // 'students_data.json' 파일의 경로를 정확히 지정해야 합니다.
        // HTML 파일과 같은 위치에 있다면 'students_data.json'으로 충분합니다.
        // 만약 'data' 폴더 안에 있다면 'data/students_data.json'처럼 경로를 수정합니다.
        const response = await fetch('students_data.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        loadedStudentsData = await response.json(); // 로드된 데이터를 변수에 저장
        
        if (loadedStudentsData && loadedStudentsData.length > 0) {
            startGameWithData(loadedStudentsData); // 데이터 로딩 후 게임 시작
        } else {
            console.error("JSON 데이터가 비어있거나 형식이 잘못되었습니다.");
            document.body.innerHTML = "<p>게임 데이터를 불러오는 데 실패했습니다. (데이터 형식 오류)</p>";
        }

    } catch (error) {
        console.error("JSON 데이터 로딩 실패:", error);
        // 사용자에게 오류 메시지 표시
        document.body.innerHTML = "<p>게임 데이터를 불러오는 데 실패했습니다. 파일을 확인하거나 페이지를 새로고침 해주세요.</p>";
    }
}

// 게임 초기화 함수 호출
initGame();