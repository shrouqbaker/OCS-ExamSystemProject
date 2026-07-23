const scienceFacts = [
    {
        category: "Space",
        title: "A Very Long Day",
        text: "One day on Venus is longer than one full year on Venus."
    },
    {
        category: "Animals",
        title: "Three Hearts!",
        text: "An octopus has three hearts and blue blood."
    },
    {
        category: "Human Body",
        title: "Your Amazing Skeleton",
        text: "An adult human body normally contains 206 bones."
    },
    {
        category: "Earth",
        title: "Frozen Water Grows",
        text: "Water expands when it freezes, which is why ice floats."
    },
    {
        category: "Physics",
        title: "Speedy Sound",
        text: "Sound travels faster through water than through air."
    },
    {
        category: "Plants",
        title: "Natural Food Makers",
        text: "Plants use sunlight to make food through photosynthesis."
    },
    {
        category: "Animals",
        title: "The Biggest Animal",
        text: "The blue whale is the largest animal known to have lived on Earth."
    },
    {
        category: "Chemistry",
        title: "A Liquid Metal",
        text: "Mercury is a metal that stays liquid at room temperature."
    },
    {
        category: "Space",
        title: "Jupiter Is Huge",
        text: "More than 1,300 Earths could fit inside Jupiter."
    },
    {
        category: "Human Body",
        title: "A Powerful Brain",
        text: "Your brain controls movement, memory, senses, and emotions."
    }
];

document.addEventListener("DOMContentLoaded", function () {
    requireRole("student");

    const current = getCurrent("currentUser");

    if (!current || current.role !== "student") {
        return;
    }

    const student = getUserById(current.id);

    if (!student) {
        window.location.href = "../login.html";
        return;
    }

    // ================= Welcome =================

    const studentName =
        document.getElementById("studentName");

    if (studentName) {
        studentName.textContent = student.fullName;
    }

    // ================= Data =================

    const results =
        getResultsByStudent(student.id);

    const availableExams =
        getAvailableExamsForStudent(student.id);

    // ================= Statistics =================

    const completedExamsElement =
        document.getElementById("completedExams");

    const availableExamsElement =
        document.getElementById("availableExams");

    const averageScoreElement =
        document.getElementById("averageScore");

    if (completedExamsElement) {
        completedExamsElement.textContent = results.length;
    }

    if (availableExamsElement) {
        availableExamsElement.textContent =
            availableExams.length;
    }

    let average = 0;

    if (results.length > 0) {
        const total = results.reduce(function (sum, result) {
            return sum + Number(result.score || 0);
        }, 0);

        average = Math.round(total / results.length);
    }

    if (averageScoreElement) {
        averageScoreElement.textContent =
            average + "%";
    }

    // ================= Available Exams =================

    const examContainer =
        document.getElementById("availableExamList");

    if (examContainer) {
        examContainer.innerHTML = "";

        if (availableExams.length === 0) {
            examContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-success">
                        No available exams.
                    </div>
                </div>
            `;
        } else {
            availableExams
                .slice(0, 3)
                .forEach(function (exam) {
                    const teacher =
                        getUserById(exam.createdBy);

                    const teacherName = teacher
                        ? teacher.fullName
                        : "Science Teacher";

                    examContainer.innerHTML += `
                        <div class="col-lg-4 col-md-6">

                            <article class="exam-card">

                                <div class="exam-card__image-wrapper">

                                    <img
                                        src="../images/science.jpg"
                                        alt="${exam.title}"
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
                                        <span>${exam.dateTime}</span>
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

            const startButtons =
                document.querySelectorAll(
                    ".exam-card__button"
                );

            startButtons.forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        startExam(
                            this.dataset.examId
                        );
                    }
                );
            });
        }
    }

    // ================= Recent Results =================

    const table =
        document.getElementById("resultsTableBody");

    if (table) {
        table.innerHTML = "";

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
                .slice()
                .sort(function (firstResult, secondResult) {
                    return (
                        new Date(secondResult.submittedAt) -
                        new Date(firstResult.submittedAt)
                    );
                })
                .slice(0, 5)
                .forEach(function (result) {
                    const exam =
                        getExamById(result.examId);

                    if (!exam) {
                        return;
                    }

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
                                <span
                                    class="status ${
                                        result.passed
                                            ? "pass"
                                            : "fail"
                                    }"
                                >
                                    ${
                                        result.passed
                                            ? "Passed"
                                            : "Failed"
                                    }
                                </span>
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="review-btn"
                                    data-result-id="${result.id}"
                                >
                                    Review
                                </button>
                            </td>

                        </tr>
                    `;
                });

            const reviewButtons =
                document.querySelectorAll(".review-btn");

            reviewButtons.forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        const resultId =
                            this.dataset.resultId;

                        setCurrent("currentResult", {
                            resultId: resultId
                        });

                        window.location.href =
                            "review-exam.html";
                    }
                );
            });
        }
    }

    // ================= Science Fact =================

    showRandomScienceFact();

    const factButton =
        document.getElementById(
            "newScienceFactButton"
        );

    if (factButton) {
        factButton.addEventListener(
            "click",
            showRandomScienceFact
        );
    }
});

// ================= Start Exam =================

function startExam(examId) {
    const currentUser =
        getCurrent("currentUser");

    if (
        !currentUser ||
        currentUser.role !== "student"
    ) {
        window.location.href = "../login.html";
        return;
    }

    const exam =
        getExamById(examId);

    if (!exam || exam.status !== "active") {
        alert("This exam is not available.");
        return;
    }

    if (
        hasStudentTakenExam(
            currentUser.id,
            examId
        )
    ) {
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

// ================= Science Fact =================

function showRandomScienceFact() {
    const category =
        document.getElementById(
            "scienceFactCategory"
        );

    const title =
        document.getElementById(
            "scienceFactTitle"
        );

    const text =
        document.getElementById(
            "scienceFactText"
        );

    if (!category || !title || !text) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() * scienceFacts.length
        );

    const fact =
        scienceFacts[randomIndex];

    category.textContent =
        fact.category;

    title.textContent =
        fact.title;

    text.textContent =
        fact.text;
}