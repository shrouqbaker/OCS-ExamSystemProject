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
            const teacher = getUserById(exam.createdBy);

            const teacherName = teacher
                ? teacher.fullName
                : "Science Teacher";

            examContainer.innerHTML += `

        <div class="col-lg-4 col-md-6">
        
    <article class="exam-card">

      <div class="exam-card__image-wrapper">

        <img
          src="../images/science.jpg"
          alt="Science exam"
          class="exam-card__image"
        >

        <span class="exam-card__time">
          <i class="bi bi-clock"></i>
          ${exam.duration} mins
        </span>

      </div>

      <div class="exam-card__body">

        <div class="exam-card__meta">
          <span>
            <i class="bi bi-ui-checks"></i>
             ${exam.numQuestions} Questions
          </span>
        </div>

        <h2 class="exam-card__title">
          ${exam.title}
        </h2>
        <div class="exam-card__teacher">
         
                            <i class="bi bi-calendar-event"></i>
                            ${exam.dateTime}
                        
                        </div>
        

        <div class="exam-card__teacher">
        
          <i class="bi bi-person-circle"></i>
          <span>${teacherName}</span>
        </div>

        <button
          type="button"
          class="exam-card__button"
          data-exam-id="${exam.id}"
        >
          Start Exam
        </button>

      </div>

    </article>
  

           

        </div>

    `;

        });
        // ================= Start Exam =================

        document.querySelectorAll(".exam-card__button").forEach(button => {

            button.addEventListener("click", function () {

                const examId = this.dataset.examId;

                startExam(examId);

            });

        });
        function startExam(examId) {
            const currentUser = getCurrent("currentUser");

            if (!currentUser || currentUser.role !== "student") {
                window.location.href = "../login.html";
                return;
            }

            const exam = getExamById(examId);

            if (!exam || exam.status !== "active") {
                alert("This exam is not available.");
                return;
            }

            if (hasStudentTakenExam(currentUser.id, examId)) {
                alert("You have already taken this exam.");
                return;
            }

            setCurrent("currentExam", {
                examId: exam.id,
                studentId: currentUser.id,
                startedAt: new Date().toISOString(),
                answers: []
            });

            window.location.href = "take-exam.html";
        }
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

    <button
        type="button"
        class="review-btn"
        data-result-id="${result.id}">
        Review
    </button>

</td>

            </tr>

        `;

            });
        document.querySelectorAll(".review-btn").forEach(button => {

            button.addEventListener("click", function () {

                const resultId = this.dataset.resultId;

                setCurrent("currentResult", {
                    resultId: resultId
                });

                window.location.href = "review-exam.html";

            });

        });
    }


});