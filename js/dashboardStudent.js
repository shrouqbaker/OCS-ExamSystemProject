document.addEventListener("DOMContentLoaded", () => {

    requireRole("student");

    const current = getCurrent("currentUser");
    const student = getUserById(current.id);

    // ================= Welcome =================

    document.getElementById("studentName").textContent =
        student.fullName;

    // ================= Data =================

    const results = getResultsByStudent(student.id);
    const availableExams = getAvailableExamsForStudent(student.id);

    // ================= Statistics =================

    document.getElementById("completedExams").textContent =
        results.length;

    document.getElementById("availableExams").textContent =
        availableExams.length;

    let average = 0;

    if (results.length > 0) {
        const total = results.reduce((sum, r) => sum + r.score, 0);
        average = Math.round(total / results.length);
    }

    document.getElementById("averageScore").textContent =
        average + "%";

    // ================= Available Exams =================

    const examContainer =
        document.getElementById("availableExamList");

    if (availableExams.length === 0) {

        examContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-success">
                    No available exams.
                </div>
            </div>
        `;

    } else {

        availableExams.slice(0, 3).forEach(exam => {

            examContainer.innerHTML += `

        <div class="col-lg-4 col-md-6">

            <div class="exam-card">

                <img
                    src="../assets/images/dash-exam.png"
                    class="exam-image"
                    alt="${exam.title}"
                >

                <div class="exam-body">


                    <h5 class="exam-title">
                        ${exam.title}
                    </h5>

                    <div class="exam-info">

                        <span>
                            <i class="bi bi-calendar-event"></i>
                            ${exam.dateTime}
                        </span>
                    </div>
                    <div class="exam-info">
                        <span>
                            <i class="bi bi-clock"></i>
                            ${exam.duration} Minutes
                        </span>

                        <span>
                            <i class="bi bi-question-circle"></i>
                            ${exam.numQuestions} Questions
                        </span>

                    </div>

                    <a href="take-exam.html?id=${exam.id}">
                      <button class="start-btn">
                        Start Exam
                        </button>
                    </a>

                </div>

            </div>

        </div>

    `;

        });
    }

    // ================= Recent Results =================

    const table =
        document.getElementById("resultsTableBody");

    if (results.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No completed exams yet.
                </td>
            </tr>
        `;

    } else {
        results
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5)
            .forEach(result => {

                const exam = getExamById(result.examId);

                table.innerHTML += `

            <tr>

                <td>
                    ${exam.title}
                </td>

                <td class="score">
                    ${result.score}%
                </td>

                <td>
                    ${result.grade}
                </td>

                <td>

                    <span class="status ${result.passed ? "pass" : "fail"}">

                        ${result.passed ? "Passed" : "Failed"}

                    </span>

                </td>

                <td>

                    <a href="history.html"
                       class="review-btn">

                        Review

                    </a>

                </td>

            </tr>

        `;

            });
    }

});