let currentExam = null;
let currentStudent = null;
let currentExamState = null;
let examQuestions = [];

let timerInterval = null;
let remainingSeconds = 0;
let isSubmitting = false;

document.addEventListener("DOMContentLoaded", function () {
  initializeExamPage();
});

function initializeExamPage() {
  const currentUser = getCurrent("currentUser");
  currentExamState = getCurrent("currentExam");

  if (!currentUser || currentUser.role !== "student") {
    window.location.href = "../login.html";
    return;
  }

  if (!currentExamState || !currentExamState.examId) {
    window.location.href = "exams.html";
    return;
  }

  currentStudent = getUserById(currentUser.id);

  if (!currentStudent) {
    window.location.href = "../login.html";
    return;
  }

  if (
    hasStudentTakenExam(
      currentStudent.id,
      currentExamState.examId
    )
  ) {
    alert("You have already taken this exam.");
    window.location.href = "exams.html";
    return;
  }

  currentExam = getExamById(currentExamState.examId);

  if (!currentExam || currentExam.status !== "active") {
    showExamMessage("This exam is not available.");
    return;
  }

  examQuestions = getQuestionsByExam(currentExam.id);

  if (examQuestions.length === 0) {
    showExamMessage(
      "This exam does not contain any questions."
    );
    return;
  }

  renderStudentData();
  renderExamInformation();
  renderQuestions();
  renderQuestionNavigation();
  restoreSavedAnswers();
  updateExamProgress();
  observeQuestionCards();
  startExamTimer();

  const examForm = document.getElementById("examForm");

  examForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitExam(false);
  });

  const helpButton =
    document.getElementById("examHelpButton");

  if (helpButton) {
    helpButton.addEventListener("click", function () {
      alert(
        "Answer the questions and submit the exam before the timer reaches zero."
      );
    });
  }
}

function renderStudentData() {
  const studentAvatar =
    document.getElementById("studentAvatar");

  const firstLetter = currentStudent.fullName
    ? currentStudent.fullName.charAt(0).toUpperCase()
    : "S";

  studentAvatar.textContent = firstLetter;
}

function renderExamInformation() {
  const examTitle =
    document.getElementById("examTitle");

  const examDetails =
    document.getElementById("examDetails");

  const examActions =
    document.getElementById("examActions");

  const duration =
    Number(currentExam.duration) || 30;

  examTitle.textContent = currentExam.title;

  examDetails.textContent =
    `${examQuestions.length} Questions • ${duration} Minutes`;

  examActions.classList.remove("d-none");
}

function renderQuestions() {
  const questionsContainer =
    document.getElementById("questionsContainer");

  questionsContainer.innerHTML = "";

  examQuestions.forEach(function (question, index) {
    const questionCard =
      document.createElement("article");

    questionCard.className =
      `question-card question-card--${question.type}`;

    questionCard.id =
      `question-${question.id}`;

    questionCard.dataset.questionId =
      question.id;

    questionCard.innerHTML = `
      <div class="question-card__header">

        <span class="question-number">
          Question ${index + 1}
        </span>

        <span class="question-points">
          ${Number(question.points) || 0} Points
        </span>

      </div>

      <h2 class="question-text">
        ${escapeHTML(question.text)}
      </h2>

      <div class="question-answer-area">
        ${createAnswerField(question)}
      </div>
    `;

    questionsContainer.appendChild(questionCard);
  });

  const answerFields =
    document.querySelectorAll(".exam-answer");

  answerFields.forEach(function (field) {
    field.addEventListener(
      "change",
      handleAnswerChange
    );

    field.addEventListener(
      "input",
      handleAnswerChange
    );
  });
}

function createAnswerField(question) {
  if (
    question.type === "mcq" ||
    question.type === "trueFalse"
  ) {
    return question.options
      .map(function (option, index) {
        return `
          <label class="question-option">

            <input
              type="radio"
              name="question_${question.id}"
              value="${index}"
              class="exam-answer"
            >

            <span class="option-letter">
              ${String.fromCharCode(65 + index)}
            </span>

            <span class="option-text">
              ${escapeHTML(option)}
            </span>

          </label>
        `;
      })
      .join("");
  }

  if (
    question.type === "shortAnswer" ||
    question.type === "numerical"
  ) {
    return `
      <input
        type="text"
        name="question_${question.id}"
        class="short-answer-input exam-answer"
        placeholder="Enter your answer"
        autocomplete="off"
      >
    `;
  }

  return `
    <p class="unsupported-question">
      Unsupported question type.
    </p>
  `;
}

function renderQuestionNavigation() {
  const navigation =
    document.getElementById("questionNavigation");

  navigation.innerHTML = "";

  examQuestions.forEach(function (question, index) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "question-nav-button";
    button.textContent = index + 1;
    button.dataset.questionId = question.id;

    if (index === 0) {
      button.classList.add("active");
    }

    button.addEventListener("click", function () {
      const questionCard =
        document.getElementById(
          `question-${question.id}`
        );

      if (!questionCard) {
        return;
      }

      questionCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      setActiveQuestion(question.id);
    });

    navigation.appendChild(button);
  });
}

function handleAnswerChange() {
  updateExamProgress();
  saveAnswersToSession();
}

function updateExamProgress() {
  let answeredQuestions = 0;

  examQuestions.forEach(function (question) {
    const studentAnswer =
      getStudentAnswer(question);

    const isAnswered =
      studentAnswer !== null &&
      String(studentAnswer).trim() !== "";

    if (isAnswered) {
      answeredQuestions++;
    }

    updateNavigationButton(
      question.id,
      isAnswered
    );
  });

  const percentage =
    examQuestions.length === 0
      ? 0
      : Math.round(
          (answeredQuestions / examQuestions.length) *
            100
        );

  document
    .getElementById("progressText")
    .textContent =
      `${answeredQuestions} of ${examQuestions.length} answered`;

  document
    .getElementById("examProgressBar")
    .style.width = `${percentage}%`;
}

function getStudentAnswer(question) {
  const selectedRadio =
    document.querySelector(
      `[name="question_${question.id}"]:checked`
    );

  if (selectedRadio) {
    const optionIndex =
      Number(selectedRadio.value);

    return question.options[optionIndex] ?? "";
  }

  const textInput =
    document.querySelector(
      `[name="question_${question.id}"]:not([type="radio"])`
    );

  if (textInput) {
    return textInput.value.trim();
  }

  return null;
}

function updateNavigationButton(
  questionId,
  isAnswered
) {
  const button =
    document.querySelector(
      `.question-nav-button[data-question-id="${questionId}"]`
    );

  if (!button) {
    return;
  }

  button.classList.toggle(
    "answered",
    isAnswered
  );
}

function setActiveQuestion(questionId) {
  const navigationButtons =
    document.querySelectorAll(
      ".question-nav-button"
    );

  navigationButtons.forEach(function (button) {
    button.classList.remove("active");

    if (
      button.dataset.questionId === questionId
    ) {
      button.classList.add("active");
    }
  });
}

function observeQuestionCards() {
  const questionCards =
    document.querySelectorAll(".question-card");

  const observer =
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveQuestion(
              entry.target.dataset.questionId
            );
          }
        });
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: 0
      }
    );

  questionCards.forEach(function (card) {
    observer.observe(card);
  });
}

function collectStudentAnswers() {
  return examQuestions.map(function (question) {
    return {
      questionId: question.id,
      studentAnswer:
        getStudentAnswer(question) || ""
    };
  });
}

function saveAnswersToSession() {
  currentExamState.answers =
    collectStudentAnswers();

  setCurrent(
    "currentExam",
    currentExamState
  );
}

function restoreSavedAnswers() {
  const savedAnswers =
    currentExamState.answers || [];

  savedAnswers.forEach(function (savedAnswer) {
    const question =
      examQuestions.find(function (item) {
        return item.id === savedAnswer.questionId;
      });

    if (!question) {
      return;
    }

    if (
      question.type === "mcq" ||
      question.type === "trueFalse"
    ) {
      const optionIndex =
        question.options.findIndex(
          function (option) {
            return (
              normalizeAnswer(option) ===
              normalizeAnswer(
                savedAnswer.studentAnswer
              )
            );
          }
        );

      if (optionIndex === -1) {
        return;
      }

      const radio =
        document.querySelector(
          `[name="question_${question.id}"][value="${optionIndex}"]`
        );

      if (radio) {
        radio.checked = true;
      }

      return;
    }

    const input =
      document.querySelector(
        `[name="question_${question.id}"]`
      );

    if (input) {
      input.value =
        savedAnswer.studentAnswer || "";
    }
  });
}

function startExamTimer() {
  const duration =
    Number(currentExam.duration) || 30;

  let startedAt =
    new Date(
      currentExamState.startedAt
    ).getTime();

  if (Number.isNaN(startedAt)) {
    startedAt = Date.now();

    currentExamState.startedAt =
      new Date(startedAt).toISOString();

    setCurrent(
      "currentExam",
      currentExamState
    );
  }

  const elapsedSeconds =
    Math.floor(
      (Date.now() - startedAt) / 1000
    );

  remainingSeconds =
    Math.max(
      duration * 60 - elapsedSeconds,
      0
    );

  updateTimerDisplay();

  if (remainingSeconds === 0) {
    submitExam(true);
    return;
  }

  timerInterval = setInterval(function () {
    remainingSeconds--;

    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      submitExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes =
    Math.floor(remainingSeconds / 60);

  const seconds =
    remainingSeconds % 60;

  document
    .getElementById("timer")
    .textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeAnswer(answer) {
  return String(answer ?? "")
    .trim()
    .toLowerCase();
}

function calculateExamResult(answers) {
  let earnedPoints = 0;
  let totalPoints = 0;

  examQuestions.forEach(function (question) {
    const questionPoints =
      Number(question.points) || 0;

    totalPoints += questionPoints;

    const answer =
      answers.find(function (item) {
        return item.questionId === question.id;
      });

    const studentAnswer =
      answer ? answer.studentAnswer : "";

    const isCorrect =
      normalizeAnswer(studentAnswer) ===
      normalizeAnswer(
        question.correctAnswer
      );

    if (isCorrect) {
      earnedPoints += questionPoints;
    }
  });

  const score =
    totalPoints === 0
      ? 0
      : Math.round(
          (earnedPoints / totalPoints) * 100
        );

  return {
    score: score,
    passed: score >= 50,
    grade: calculateGrade(score)
  };
}

function calculateGrade(score) {
  if (score >= 90) {
    return "A";
  }

  if (score >= 80) {
    return "B";
  }

  if (score >= 70) {
    return "C";
  }

  if (score >= 60) {
    return "D";
  }

  return "F";
}

function submitExam(isTimeFinished = false) {
  if (isSubmitting) {
    return;
  }

  const currentUser =
    getCurrent("currentUser");

  if (
    !currentUser ||
    currentUser.role !== "student"
  ) {
    window.location.href = "../login.html";
    return;
  }

  if (
    hasStudentTakenExam(
      currentUser.id,
      currentExam.id
    )
  ) {
    alert(
      "This exam has already been submitted."
    );

    window.location.href = "exams.html";
    return;
  }

  if (!isTimeFinished) {
    const confirmed =
      confirm(
        "Are you sure you want to submit your exam?"
      );

    if (!confirmed) {
      return;
    }
  }

  isSubmitting = true;

  clearInterval(timerInterval);

  const answers =
    collectStudentAnswers();

  const examResult =
    calculateExamResult(answers);

  const totalDurationSeconds =
    (Number(currentExam.duration) || 30) * 60;

  const timeTakenSeconds =
    isTimeFinished
      ? totalDurationSeconds
      : Math.min(
          totalDurationSeconds,
          Math.max(
            0,
            totalDurationSeconds -
              remainingSeconds
          )
        );

  let feedback = "";

  if (isTimeFinished) {
    feedback =
      "Time ended and the exam was submitted automatically.";
  } else if (examResult.passed) {
    feedback =
      "Great job! Keep exploring science.";
  } else {
    feedback =
      "Keep practicing and continue learning.";
  }

  const result = addResult(
    currentUser.id,
    currentExam.id,
    answers,
    examResult.score,
    examResult.grade,
    examResult.passed,
    feedback
  );

  if (!result) {
    alert(
      "The exam result could not be saved."
    );

    isSubmitting = false;
    return;
  }

  setCurrent("currentResult", {
    resultId: result.id,
    timeTakenSeconds: timeTakenSeconds,
    timedOut: isTimeFinished
  });

  clearCurrent("currentExam");

  window.location.href = "result.html";
}

function showExamMessage(message) {
  const examMessage =
    document.getElementById("examMessage");

  if (!examMessage) {
    return;
  }

  examMessage.textContent = message;
  examMessage.classList.remove("d-none");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}