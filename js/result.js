document.addEventListener("DOMContentLoaded", function () {
  loadExamResult();
});

function loadExamResult() {
  const currentUser = getCurrent("currentUser");
  const currentResultData = getCurrent("currentResult");

  if (!currentUser || currentUser.role !== "student") {
    window.location.href = "../login.html";
    return;
  }

  if (
    !currentResultData ||
    !currentResultData.resultId
  ) {
    window.location.href = "dashboard.html";
    return;
  }

  const student = getUserById(currentUser.id);
  const result = getResultById(
    currentResultData.resultId
  );

  if (
    !student ||
    !result ||
    result.studentId !== student.id
  ) {
    window.location.href = "dashboard.html";
    return;
  }

  const exam = getExamById(result.examId);
  const questions = getQuestionsByExam(result.examId);

  if (!exam) {
    window.location.href = "dashboard.html";
    return;
  }

  const correctAnswersCount =
    calculateCorrectAnswers(
      questions,
      result.answers
    );

  renderStudentInformation(student);

  renderResultInformation(
    student,
    exam,
    result,
    questions.length,
    correctAnswersCount,
    currentResultData
  );
}

function renderStudentInformation(student) {
  const studentName =
    document.getElementById("studentName");

  const studentAvatar =
    document.getElementById("studentAvatar");

  studentName.textContent = student.fullName;

  studentAvatar.textContent =
    student.fullName
      ? student.fullName.charAt(0).toUpperCase()
      : "S";
}

function renderResultInformation(
  student,
  exam,
  result,
  totalQuestions,
  correctAnswersCount,
  currentResultData
) {
  const resultPage =
    document.getElementById("resultPage");

  const resultFaceIcon =
    document.getElementById("resultFaceIcon");

  const resultStatusLabel =
    document.getElementById("resultStatusLabel");

  const resultHeading =
    document.getElementById("resultHeading");

  const resultSubheading =
    document.getElementById("resultSubheading");

  const resultDescription =
    document.getElementById("resultDescription");

  const finalScore =
    document.getElementById("finalScore");

  const scoreProgressFill =
    document.getElementById("scoreProgressFill");

  const timeTaken =
    document.getElementById("timeTaken");

  const correctAnswers =
    document.getElementById("correctAnswers");

  const resultGrade =
    document.getElementById("resultGrade");

  const firstName =
    student.fullName
      ? student.fullName.split(" ")[0]
      : "Student";

  finalScore.textContent = result.score;

  scoreProgressFill.style.width =
    `${Math.min(Math.max(result.score, 0), 100)}%`;

  timeTaken.textContent =
    formatTime(
      Number(currentResultData.timeTakenSeconds) || 0
    );

  correctAnswers.textContent =
    `${correctAnswersCount}/${totalQuestions}`;

  resultGrade.textContent = result.grade;

  const timedOut =
    currentResultData.timedOut === true;

  if (timedOut) {
    resultPage.classList.add("result-page--timeout");

    resultFaceIcon.className =
      "bi bi-emoji-frown-fill";

    resultStatusLabel.textContent =
      "Exam time finished";

    resultHeading.textContent =
      "Time's up!";

    resultSubheading.textContent =
      `${exam.title} was submitted automatically.`;

    resultDescription.textContent =
      "Your saved answers were submitted when the timer reached zero.";

    return;
  }

  if (result.passed) {
    resultPage.classList.add("result-page--passed");

    resultFaceIcon.className =
      "bi bi-emoji-smile-fill";

    resultStatusLabel.textContent =
      "Mission completed";

    resultHeading.textContent =
      `Great job, ${firstName}!`;

    resultSubheading.textContent =
      `You passed ${exam.title}!`;

    resultDescription.textContent =
      "Your understanding is impressive. You are ready for your next science mission.";

    return;
  }

  resultPage.classList.add("result-page--failed");

  resultFaceIcon.className =
    "bi bi-emoji-frown-fill";

  resultStatusLabel.textContent =
    "Mission needs another try";

  resultHeading.textContent =
    `Keep going, ${firstName}!`;

  resultSubheading.textContent =
    `You did not pass ${exam.title} this time.`;

  resultDescription.textContent =
    "Review your answers, practice the topics, and keep learning.";
}

function calculateCorrectAnswers(
  questions,
  answers
) {
  let correctCount = 0;

  questions.forEach(function (question) {
    const answer = answers.find(function (item) {
      return item.questionId === question.id;
    });

    if (!answer) {
      return;
    }

    const studentAnswer =
      normalizeAnswer(answer.studentAnswer);

    const correctAnswer =
      normalizeAnswer(question.correctAnswer);

    if (studentAnswer === correctAnswer) {
      correctCount++;
    }
  });

  return correctCount;
}

function normalizeAnswer(answer) {
  return String(answer ?? "")
    .trim()
    .toLowerCase();
}

function formatTime(totalSeconds) {
  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}