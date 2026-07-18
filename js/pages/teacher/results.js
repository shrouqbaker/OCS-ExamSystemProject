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

const rawResults = getResults()
const exams = getExams()
const users = getUsers()

const results = examId ? rawResults.filter(r => r.examId === examId) : rawResults;

const PAGE_SIZE = 4
let currentPage = 0

document.addEventListener("DOMContentLoaded", function () {
    requireRole('teacher')
    getAvg()
    getCount()
    // getSubject()
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

    // Handle edge case: if no results exist for a filtered exam
    if (results.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No submissions found for this exam.</td></tr>`
        countt.innerHTML = "Showing 0 of 0 results"
        prevBtn.disabled = true
        nextBtn.disabled = true
        return;
    }

    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    const pageResults = results.slice(start, end)

    pageResults.forEach(element => {
        let student = users.find(user => user.id === element.studentId)
        let exam = exams.find(ex => ex.id === element.examId)
        
        let name = student ? student.fullName : "Unknown Student"
        let title = exam ? exam.title : "Unknown Exam"
        
        addToTable(name, title, element.submittedAt.slice(0,10), element.score, element.grade, element.id)
    });

    countt.innerHTML = `Showing ${pageResults.length} of ${results.length} results`

    prevBtn.disabled = currentPage === 0
    nextBtn.disabled = end >= results.length
}

function getAvg(){
    if (results.length === 0) {
        avg.innerHTML = "0.00"
        return;
    }
    let sum = 0
    results.forEach(element => {
       sum += element.score
    });
    avg.innerHTML=`${(sum / results.length).toFixed(2)}`
}

function getCount(){
    const obj = {}
    results.forEach(element => {
        obj[element.examId] = (obj[element.examId] || 0) + 1
    });
    countd.innerHTML=`${Object.keys(obj).length}`
}

// function getSubject(){
//     if (results.length === 0 || exams.length === 0) {
//         subject.innerHTML = "--"
//         return;
//     }

//     // Identify which subject is being reviewed based on current results scope
//     const obj = {}
//     results.forEach(res => {
//         const exam = exams.find(e => e.id === res.examId);
//         if (exam) {
//             obj[exam.subject] = (obj[exam.subject] || 0) + 1;
//         }
//     });

//     const activeSubjects = Object.keys(obj);
//     if (activeSubjects.length === 0) {
//         subject.innerHTML = "--";
//         return;
//     }

//     subject.innerHTML=`${activeSubjects.reduce((a, b) => obj[a] > obj[b] ? a : b)}`
// }

function getReviews(){
    const pending = results.filter(r => !r.feedback || r.feedback.trim() === '').length;
    reviews.innerHTML = `${pending}`;
}

function addToTable(name,title,date,score,grade,resultId){
    const tier = gradeTier(grade);
    const initials = name
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
                
    const row = document.createElement("tr")
    row.innerHTML=`
  <td>
    <div class="results-table__student">
        <div class="student-avatar results-table__avatar">${initials}</div>
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
