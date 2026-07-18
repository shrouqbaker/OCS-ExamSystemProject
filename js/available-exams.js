
document.addEventListener("DOMContentLoaded", function () {
  loadAvailableExams();
});
document.addEventListener("DOMContentLoaded", function () {
  loadAvailableExams();
});

function loadAvailableExams() {
  const currentUser = getCurrent("currentUser");

  if (!currentUser || currentUser.role !== "student") {
    window.location.href = "../login.html";
    return;
  }

  const student = getUserById(currentUser.id);

  if (!student) {
    window.location.href = "../login.html";
    return;
  }

  const availableExams = getAvailableExamsForStudent(student.id);

  const examsContainer = document.getElementById("examsContainer");
  const emptyExamsMessage = document.getElementById("emptyExamsMessage");
  const activeExamsCount = document.getElementById("activeExamsCount");

  examsContainer.innerHTML = "";

  activeExamsCount.textContent =
    availableExams.length === 1
      ? "1 Available Exam"
      : `${availableExams.length} Available Exams`;

  if (availableExams.length === 0) {
    emptyExamsMessage.classList.remove("d-none");
    return;
  }

  emptyExamsMessage.classList.add("d-none");

  availableExams.forEach(function (exam) {
    const examCard = createExamCard(exam);
    examsContainer.appendChild(examCard);
  });

  addStartExamEvents();
}

function createExamCard(exam) {
  const teacher = getUserById(exam.createdBy);

  const teacherName = teacher
    ? teacher.fullName
    : "Science Teacher";

  const examDuration = exam.duration || 30;
  const questionsCount = exam.numQuestions || 0;

  const cardColumn = document.createElement("div");

  cardColumn.className = "col-12 col-md-6 col-xl-4";

  cardColumn.innerHTML = `
    <article class="exam-card">

      <div class="exam-card__image-wrapper">

        <img
          src="../images/science.jpg"
          alt="Science exam"
          class="exam-card__image"
        >

        <span class="exam-card__time">
          <i class="bi bi-clock"></i>
          ${examDuration} mins
        </span>

      </div>

      <div class="exam-card__body">

        <div class="exam-card__meta">
          <span>
            <i class="bi bi-ui-checks"></i>
            ${questionsCount} Questions
          </span>
        </div>

        <h2 class="exam-card__title">
          ${exam.title}
        </h2>

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
  `;

  return cardColumn;
}

function addStartExamEvents() {
  const startButtons = document.querySelectorAll("[data-exam-id]");

  startButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const examId = button.dataset.examId;
      startExam(examId);
    });
  });
}

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