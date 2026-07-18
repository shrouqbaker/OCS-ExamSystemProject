const avg = document.getElementById("statAverageScore")
const countd = document.getElementById("statExamsCompleted")
const subject = document.getElementById("statTopSubject")
const reviews = document.getElementById("statPendingReviews")
const table = document.getElementById("resultsTableBody")
const countt = document.getElementById("resultsCountLabel")
const prevBtn = document.getElementById("prevPageBtn")
const nextBtn = document.getElementById("nextPageBtn")

const params = new URLSearchParams(window.location.search);
const examId = params.get("examId");

const results = getResults()
const exams = getExams()
const users = getUsers()

const PAGE_SIZE = 4
let currentPage = 0

document.addEventListener("DOMContentLoaded", function () {
    requireRole('teacher')
    getAvg()
    getCount()
    getSubject()
    getReviews()
    renderPage(currentPage)
});

prevBtn.addEventListener("click", function(){
    if (currentPage > 0) {
        currentPage--
        renderPage(currentPage)
    }
})

nextBtn.addEventListener("click", function(){
    const maxPage = Math.ceil(results.length / PAGE_SIZE) - 1
    if (currentPage < maxPage) {
        currentPage++
        renderPage(currentPage)
    }
})

function renderPage(page){
    table.innerHTML = ""

    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    const pageResults = results.slice(start, end)

    pageResults.forEach(element => {
        let name = users.find(user => user.id === element.studentId).fullName
        let title = exams.find(exam => exam.id === element.examId).title
        addToTable(name, title, element.submittedAt.slice(0,10), element.score, element.grade, element.id)
    });

    countt.innerHTML = `Showing ${pageResults.length} of ${results.length} results`

    prevBtn.disabled = currentPage === 0
    nextBtn.disabled = end >= results.length
}

function getAvg(){
    let sum = 0
    let count = 0
    results.forEach(element => {
       sum += element.score
       count++
    });
    avg.innerHTML=`${sum/count}`
    
}
function getCount(){
    const obj = {}
    results.forEach(element => {
        if(obj[element.examId])
            obj[element.examId]++
        else
            obj[element.examId]=1
    });
    
    countd.innerHTML=`${Object.keys(obj).length}`
}
function getSubject(){
    const obj = {}
    exams.forEach(element => {
        if(obj[element.subject])
            obj[element.subject]++
        else
            obj[element.subject]=1
    });
    
    subject.innerHTML=`${Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)}`
}
function getReviews(){
    const pending = results.filter(r => !r.feedback || r.feedback.trim() === '').length;
    reviews.innerHTML = `${pending}`;
}
function addToTable(name,title,date,score,grade,resultId){
    const tier = gradeTier(grade);

    const row = document.createElement("tr")
    row.innerHTML=`
  <td>
    <div class="results-table__student">
      <img src="assets/images/avatar-placeholder.png" alt="" class="results-table__avatar">
      <span class="results-table__student-name">${name}</span>
    </div>
  </td>

  <td>
    <div class="results-table__exam">
      <i class="fa-solid fa-dna icon"></i>
      <span>${title}</span>
    </div>
  </td>

  <td>${date}</td>

  <td>
    <div class="results-table__score">
      <span class="results-table__score-value results-table__score-value--${tier}">${score}%</span>
      <div class="results-table__score-bar-track">
        <div class="results-table__score-bar-fill results-table__score-bar-fill--${tier}" style="width: ${score}%;"></div>
      </div>
    </div>
  </td>

  <td>
    <span class="results-table__grade-badge results-table__grade-badge--${tier}">${grade}</span>
  </td>

  <td>
    <a href="exam-review.html?resultId=${resultId}" class="results-table__action-btn">Review Answers</a>
  </td>
`
table.appendChild(row)
}