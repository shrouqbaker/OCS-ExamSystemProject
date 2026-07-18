const nameC = document.getElementById("breadcrumbStudentName")
const params = new URLSearchParams(window.location.search);
const resultId = params.get("resultId");
const ans = getAnswerReview(resultId)
const users = getUsers()
const exams = getExams()
const results = getResults()
const ansWithStudents = oneToMany(ans,users,"studentId","id","studentInfo")
const ansWithExsmd = oneToMany(ansWithStudents,exams,"examId","id","examInfo")
const result = oneToMany(ansWithExsmd,results,"resultId","id","resultInfo")
const feedbackbtn = document.getElementById("saveFeedbackBtn")
console.log(ans)
console.log(result[0]);

document.addEventListener("DOMContentLoaded", function () {
    requireRole('teacher')
    !resultId ? window.location.href = "results.html" : null

    const studentInfo=result[0].studentInfo[0]
    const examInfo=result[0].examInfo[0]
    const resultInfo=result[0].resultInfo[0]
    nameC.innerHTML=`${studentInfo.fullName}`

    stuCard(studentInfo.fullName , examInfo.title , examInfo.dateTime , examInfo.duration , resultInfo.score, resultInfo.grade)

    countCard()

    result.forEach(element => {
        if (element.type === "mcq")
            mcp(element.order ,element.isCorrect, element.text,element.options,element.correctAnswer,element.studentAnswer)
        if (element.type === "multiAnswer")
            multiAnswer(element.order ,element.isCorrect, element.text,element.options,element.correctAnswer,element.studentAnswer)
        if (element.type === "trueFalse")
            trueFalse(element.order ,element.isCorrect, element.text,element.correctAnswer,element.studentAnswer)
        if (element.type === "shortAnswer")
            shortAnswer(element.order ,element.isCorrect, element.text,element.correctAnswer,element.studentAnswer)
    });

    feedbackbtn.addEventListener("click",function(){
        const feedbacktxt = document.getElementById("feedbackTextarea").value
        console.log(feedbacktxt)
        updateResultFeedback(resultId,feedbacktxt)

        const savedMsg = document.getElementById("feedbackSavedMsg")
        savedMsg.classList.add("exam-review-question__feedback-saved--visible")
    })

    loadTrivia()
});

async function loadTrivia(){
    const triviaText = document.querySelector('.exam-review__trivia-text')
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
        const data = await response.json()
        triviaText.innerHTML = data.text
        console.log(data.text);
        
    } catch (error) {
        console.log('Trivia API unavailable, showing default fact')
    }
}


function stuCard(name, title, date, duration, score, grade){
    const tier = gradeTier(grade)

    document.getElementById("studentInfoCard").innerHTML = `<img src="../assets/images/avatar-placeholder.png" alt="" class="exam-review__avatar">

<div>
  <h2 class="exam-review__student-name">${name}</h2>
  <p class="exam-review__exam-title">
    <i class="fa-solid fa-flask icon"></i> ${title}
  </p>
  <div class="exam-review__meta">
    <span class="exam-review__meta-pill">
      <i class="fa-solid fa-calendar"></i> ${date.slice(0,10)}
    </span>
    <span class="exam-review__meta-pill">
      <i class="fa-solid fa-clock"></i> ${duration} min
    </span>
  </div>
</div>

<div class="exam-review__divider"></div>

<div class="exam-review__score-circle exam-review__score-circle--${tier}">
  <span class="exam-review__score-value exam-review__score-value--${tier}">${score}%</span>
  <span class="exam-review__score-label">SCORE</span>
</div>`;
}
function countCard(){
    document.getElementById("questionsStatCard").innerHTML=`<span class="exam-review__stat-label">QUESTIONS</span>
<span class="exam-review__stat-value">${result.length} Total</span>`
}
function mcp(order, isCorrect, text, options, correctAnswer, studentAnswer){
    const div = document.createElement("div")
    div.innerHTML=`<div class="exam-review-question">
  <div class="exam-review-question__header">
    <span class="exam-review-question__type-badge exam-review-question__type-badge--purple">
      Question ${order} &bull; Multiple Choice
    </span>
    <span class="exam-review-question__status exam-review-question__status--${isCorrect ? 'correct' : 'incorrect'}">
      <i class="fa-solid ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${isCorrect ? 'Correct' : 'Incorrect'}
    </span>
  </div>

  <p class="exam-review-question__text">${text}</p>

  <div class="exam-review-question__options">
    ${options.map(opt => {
        const id = Object.keys(opt)[0]
        const text = opt[id]
        const stateClass = id === correctAnswer ? 'exam-review-question__option--correct' : (id === studentAnswer ? 'exam-review-question__option--selected-wrong' : '')
        return `<div class="exam-review-question__option ${stateClass}">${text} ${id === correctAnswer ? '<i class="fa-solid fa-check-circle"></i>' : ''}</div>`
    }).join("")}
  </div>
</div>`
    questionsReview.appendChild(div.firstElementChild)
}
function multiAnswer(order, isCorrect, title, options, correctAnswer, studentAnswer){
    const div = document.createElement("div")
    div.innerHTML=`<div class="exam-review-question">
  <div class="exam-review-question__header">
    <span class="exam-review-question__type-badge exam-review-question__type-badge--purple">
      Question ${order} &bull; Multiple Answers
    </span>
    <span class="exam-review-question__status exam-review-question__status--${isCorrect ? 'correct' : 'incorrect'}">
      <i class="fa-solid ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${isCorrect ? 'Correct' : 'Incorrect'}
    </span>
  </div>

  <p class="exam-review-question__text">${title}</p>

  <div class="exam-review-question__options">
    ${options.map(opt => {
        const id = Object.keys(opt)[0]
        const text = opt[id]
        const isCorrectOption = correctAnswer.includes(id)
        const wasSelected = studentAnswer.includes(id)

        let stateClass = ''
        let icon = ''
        let tag = ''

        if (isCorrectOption && wasSelected) {
            stateClass = 'exam-review-question__option--correct'
            icon = '<i class="fa-solid fa-check-circle"></i>'
        } else if (isCorrectOption && !wasSelected) {
            stateClass = 'exam-review-question__option--missed'
            tag = '<span class="exam-review-question__option-tag">Correct answer, not selected</span>'
        } else if (!isCorrectOption && wasSelected) {
            stateClass = 'exam-review-question__option--selected-wrong'
            icon = '<i class="fa-solid fa-times-circle"></i>'
            tag = '<span class="exam-review-question__option-tag">Student picked this</span>'
        }

        return `<div class="exam-review-question__option ${stateClass}">
            <span>${text}</span>
            <span class="d-flex align-items-center gap-2">${tag}${icon}</span>
        </div>`
    }).join("")}
  </div>
</div>`
    questionsReview.appendChild(div.firstElementChild)
}

function trueFalse(order, isCorrect, text, correctAnswer, studentAnswer){
    const div = document.createElement("div")
    div.innerHTML=`<div class="exam-review-question">
  <div class="exam-review-question__header">
    <span class="exam-review-question__type-badge exam-review-question__type-badge--green">
      Question ${order} &bull; True/False
    </span>
    <span class="exam-review-question__status exam-review-question__status--${isCorrect ? 'correct' : 'incorrect'}">
      <i class="fa-solid ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${isCorrect ? 'Correct' : 'Incorrect'}
    </span>
  </div>

  <p class="exam-review-question__text">${text}</p>

  <div class="exam-review-question__truefalse">
    <div class="exam-review-question__option ${correctAnswer === true ? 'exam-review-question__option--correct' : (studentAnswer === true ? 'exam-review-question__option--selected-wrong' : '')}">
      <i class="fa-solid ${studentAnswer === true ? 'fa-dot-circle' : 'fa-circle'}"></i> True
    </div>
    <div class="exam-review-question__option ${correctAnswer === false ? 'exam-review-question__option--correct' : (studentAnswer === false ? 'exam-review-question__option--selected-wrong' : '')}">
      <i class="fa-solid ${studentAnswer === false ? 'fa-dot-circle' : 'fa-circle'}"></i> False
    </div>
  </div>
</div>`
    questionsReview.appendChild(div.firstElementChild)
}
function shortAnswer(order, isCorrect, text, correctAnswer, studentAnswer){
    const div = document.createElement("div")
    div.innerHTML=`<div class="exam-review-question">
  <div class="exam-review-question__header">
    <span class="exam-review-question__type-badge exam-review-question__type-badge--gray">
      Question ${order} &bull; Short Answer
    </span>
    <span class="exam-review-question__status exam-review-question__status--${isCorrect ? 'correct' : 'incorrect'}">
      <i class="fa-solid ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${isCorrect ? 'Correct' : 'Incorrect'}
    </span>
  </div>

  <p class="exam-review-question__text">${text}</p>

  <div class="exam-review-question__answer-box">
    "${studentAnswer ?? ''}"
  </div>

  ${!isCorrect ? `<div class="exam-review-question__answer-box">Correct answer: "${correctAnswer}"</div>` : ''}
</div>`
    questionsReview.appendChild(div.firstElementChild)
}