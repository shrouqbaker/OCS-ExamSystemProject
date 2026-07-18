document.addEventListener("DOMContentLoaded", () => {

    requireRole("teacher");

    const current = getCurrent("currentUser");
    const teacher = getUserById(current.id);

    document.getElementById("teacherName").textContent = teacher.fullName;

    /* ======================
       Statistics
    ======================= */

    const students = getStudents();
    document.getElementById("totalStudents").textContent = students.length;

    const exams = getExamsByTeacher(current.id);

    const activeExamList = exams.filter(exam => exam.status === "active");

    document.getElementById("activeExams").textContent =
        activeExamList.length;

    const results = getResults();

    if (results.length > 0) {

        const average =
            results.reduce((sum, result) => sum + result.score, 0) /
            results.length;

        document.getElementById("averageGrade").textContent =
            Math.round(average) + "%";

        const highest = Math.max(...results.map(result => result.score));

        document.getElementById("highestScore").textContent =
            highest + "%";
    }

    /* ======================
       Recent Students
    ======================= */

    const tbody = document.getElementById("recentStudents");

    students
        .slice(0,3)
        .reverse()
        .forEach(student => {

            tbody.innerHTML += `
                <tr>
                    <td>${student.fullName}</td>
                    <td>${student.gender}</td>
                    <td>${student.nationalId}</td>
                    <td>${student.username}</td>
                </tr>
            `;

        });

    /* ======================
       Recent Results
    ======================= */

    const recentResults = document.getElementById("recentResults");

    results
        .slice(0,4)
        .reverse()
        .forEach(result => {

            const student = getUserById(result.studentId);
            const exam = getExamById(result.examId);

            recentResults.innerHTML += `
                <div class="result-item">

                    <div>

                        <h5>${exam.title}</h5>

                        <small>${student.fullName}</small>

                    </div>

                    <strong>${result.score}%</strong>

                </div>
            `;

        });

    /* ======================
       Upcoming Exams
    ======================= */

    const upcomingExams = document.getElementById("upcomingExams");

    activeExamList.slice(0,4)
        .reverse()
        .forEach(exam => {

        upcomingExams.innerHTML += `
            <div class="exam-item">

                <div class="exam-icon">
                    <i class="bi bi-journal-text"></i>
                </div>

                <div>

                    <h5>${exam.title}</h5>

                    <small>${exam.dateTime}</small>

                </div>

            </div>
        `;

    });

});