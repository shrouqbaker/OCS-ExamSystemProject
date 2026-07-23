const avg = document.getElementById("statAverageScore")
const countd = document.getElementById("statExamsCompleted")
const reviews = document.getElementById("statPendingReviews")
const table = document.getElementById("resultsTableBody")
const countt = document.getElementById("resultsCountLabel")
const pagination = document.getElementById("pagination")
const searchInput = document.getElementById("searchResult")

const params = new URLSearchParams(window.location.search);
const examId = params.get("examId");

const rawResults = getResults()
const exams = getExams()
const users = getUsers()

const results = examId ? rawResults.filter(r => r.examId === examId) : rawResults;
let filteredResults = [...results];

const PAGE_SIZE = 5
let currentPage = 1

document.addEventListener("DOMContentLoaded", function () {
    requireRole('teacher')
    getAvg()
    getCount()
    getReviews()
    renderPage(currentPage)

    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            const query = e.target.value.trim().toLowerCase();
            filteredResults = results.filter(r => {
                const student = users.find(u => u.id === r.studentId);
                const exam = exams.find(ex => ex.id === r.examId);
                const name = (student ? student.fullName : "").toLowerCase();
                const title = (exam ? exam.title : "").toLowerCase();
                const grade = (r.grade || "").toLowerCase();

                return name.includes(query) || title.includes(query) || grade.includes(query);
            });
            currentPage = 1;
            renderPage(currentPage);
        });
    }
});

function renderPage(page){
    table.innerHTML = ""

    if (filteredResults.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No submissions found.</td></tr>`
        countt.textContent = "Showing 0 results"
        if (pagination) pagination.innerHTML = "";
        return;
    }

    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    const pageResults = filteredResults.slice(start, end)

    pageResults.forEach(element => {
        let student = users.find(user => user.id === element.studentId)
        let exam = exams.find(ex => ex.id === element.examId)
        
        let name = student ? student.fullName : "Unknown Student"
        let title = exam ? exam.title : "Unknown Exam"
        
        addToTable(name, title, element.submittedAt.slice(0,10), element.score, element.grade, element.id)
    });

    countt.textContent = `Showing ${filteredResults.length === 0 ? 0 : start + 1} - ${Math.min(end, filteredResults.length)} of ${filteredResults.length} results`
    renderPagination()
}

function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = "";

    const pages = Math.ceil(filteredResults.length / PAGE_SIZE);

    /* Previous */
    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.innerHTML = `<i class="bi bi-chevron-left"></i>`;
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    };
    pagination.appendChild(prev);

    /* Numbers */
    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        if (i === currentPage) btn.classList.add("active");
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderPage(currentPage);
        };
        pagination.appendChild(btn);
    }

    /* Next */
    const next = document.createElement("button");
    next.className = "page-btn";
    next.innerHTML = `<i class="bi bi-chevron-right"></i>`;
    next.disabled = currentPage === pages || pages === 0;
    next.onclick = () => {
        if (currentPage < pages) {
            currentPage++;
            renderPage(currentPage);
        }
    };
    pagination.appendChild(next);
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
    <div class="student-cell">
      <div class="student-avatar">${initials}</div>
      <span>${name}</span>
    </div>
  </td>

  <td>
    <div class="results-table__exam">
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

  <td class="text-end">
    <a href="exam-review.html?resultId=${resultId}" class="btn-view">Review Answers</a>
  </td>
`
table.appendChild(row)
}
