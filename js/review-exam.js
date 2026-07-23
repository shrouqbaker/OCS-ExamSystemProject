document.addEventListener("DOMContentLoaded", function () {
  loadExamReview();
});

function loadExamReview() {
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
    window.location.href = "history.html";
    return;
  }

  const result = getResultById(
    currentResultData.resultId
  );

  if (
    !result ||
    result.studentId !== currentUser.id
  ) {
    window.location.href = "history.html";
    return;
  }

  const exam = getExamById(result.examId);

  if (!exam) {
    showReviewMessage(
      "The exam could not be found."
    );
    return;
  }

  const answerReview = getAnswerReview(result.id);

  if (
    !Array.isArray(answerReview) ||
    answerReview.length === 0
  ) {
    showReviewMessage(
      "No answers were found for this exam."
    );
    return;
  }

  renderReviewSummary(
    exam,
    result,
    answerReview
  );

  renderReviewQuestions(answerReview);
}

function renderReviewSummary(
  exam,
  result,
  answerReview
) {
  const correctCount = answerReview.filter(
    function (question) {
      return question.isCorrect === true;
    }
  ).length;

  document
    .getElementById("reviewExamTitle")
    .textContent = exam.title;

  document
    .getElementById("reviewExamDetails")
    .textContent =
      `${correctCount} correct out of ${answerReview.length} questions`;

  document
    .getElementById("reviewScore")
    .textContent = `${result.score}%`;
}

function renderReviewQuestions(answerReview) {
  const questionsContainer =
    document.getElementById("reviewQuestions");

  questionsContainer.innerHTML = "";

  answerReview.forEach(function (question, index) {
    const questionCard =
      document.createElement("article");

    const questionStatusClass =
      question.isCorrect
        ? "review-question--correct"
        : "review-question--incorrect";

   questionCard.className =
  `review-question ${questionStatusClass} review-question--${question.type}`;

    questionCard.innerHTML = `
      <div class="review-question__header">

        <span class="review-question__number">
          ${index + 1}
        </span>

        <div class="review-question__heading">

          <h2>
            ${escapeHTML(question.text)}
          </h2>
${
  question.type === "multiAnswer"
    ? `
      <span class="multiple-answer-badge">
        <i class="bi bi-check2-square"></i>
        Multiple answers
      </span>
    `
    : ""
}
          <span class="review-question__status">
            ${
              question.isCorrect
                ? "Correct"
                : "Incorrect"
            }
          </span>

        </div>

      </div>

      <div class="review-question__content">
        ${createReviewContent(question)}
      </div>
    `;

    questionsContainer.appendChild(questionCard);
  });
}
function getOptionKey(option) {
  if (
    typeof option === "object" &&
    option !== null &&
    !Array.isArray(option)
  ) {
    return Object.keys(option)[0];
  }

  return String(option);
}

function getOptionValue(option) {
  if (
    typeof option === "object" &&
    option !== null &&
    !Array.isArray(option)
  ) {
    return Object.values(option)[0];
  }

  return String(option);
}
function createReviewContent(question) {
  if (
    question.type === "mcq" ||
    question.type === "multiAnswer"
  ) {
    return createOptionsReview(question);
  }

  if (question.type === "trueFalse") {
    return createOptionsReview({
      ...question,
      options: [
        { true: "True" },
        { false: "False" }
      ]
    });
  }

  if (
    question.type === "shortAnswer" ||
    question.type === "numerical"
  ) {
    return createShortAnswerReview(question);
  }

  return `
    <p class="review-unsupported">
      Unsupported question type.
    </p>
  `;
}

function createOptionsReview(question) {
  const options = Array.isArray(question.options)
    ? question.options
    : [];

  const correctAnswers = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.map(String)
    : [String(question.correctAnswer)];

  const studentAnswers = Array.isArray(question.studentAnswer)
    ? question.studentAnswer.map(String)
    : [String(question.studentAnswer)];

  return `
    <div class="review-options-grid">

      ${options
        .map(function (option, index) {
          const optionKey = getOptionKey(option);
          const optionValue = getOptionValue(option);

          const isCorrectOption =
            correctAnswers.includes(String(optionKey));

          const isStudentAnswer =
            studentAnswers.includes(String(optionKey));

          let optionClass = "";
          let optionIcon =
            `<i class="bi bi-circle"></i>`;

          if (isCorrectOption) {
            optionClass = "review-option--correct";
            optionIcon =
              `<i class="bi bi-check-circle-fill"></i>`;
          }

          if (
            isStudentAnswer &&
            !isCorrectOption
          ) {
            optionClass = "review-option--incorrect";
            optionIcon =
              `<i class="bi bi-x-circle-fill"></i>`;
          }

          return `
            <div class="review-option ${optionClass}">

              <span class="review-option__letter">
                ${String.fromCharCode(65 + index)}
              </span>

              <span class="review-option__text">
                ${escapeHTML(optionValue)}
              </span>

              <span class="review-option__icon">
                ${optionIcon}
              </span>

              ${
                isStudentAnswer
                  ? `
                    <span class="student-answer-badge">
                      Your answer
                    </span>
                  `
                  : ""
              }

            </div>
          `;
        })
        .join("")}

    </div>
  `;
}

function createShortAnswerReview(question) {
  const studentAnswer =
    question.studentAnswer === "" ||
    question.studentAnswer === null ||
    question.studentAnswer === undefined
      ? "No answer"
      : question.studentAnswer;

  const correctAnswer =
    question.correctAnswer === null ||
    question.correctAnswer === undefined
      ? "Not provided"
      : question.correctAnswer;

  if (question.isCorrect) {
    return `
      <div class="short-review-grid short-review-grid--single">

        <div class="short-review-group">

          <span class="short-review-label">
            Your Answer
          </span>

          <div class="short-review-answer short-review-answer--correct">

            <span>
              ${escapeHTML(studentAnswer)}
            </span>

            <i class="bi bi-check-circle-fill"></i>

          </div>

        </div>

      </div>
    `;
  }

  return `
    <div class="short-review-grid">

      <div class="short-review-group">

        <span class="short-review-label">
          Your Answer
        </span>

        <div class="short-review-answer short-review-answer--incorrect">

          <span>
            ${escapeHTML(studentAnswer)}
          </span>

          <i class="bi bi-x-circle-fill"></i>

        </div>

      </div>

      <div class="short-review-group">

        <span class="short-review-label">
          Correct Answer
        </span>

        <div class="short-review-answer short-review-answer--correct">

          <span>
            ${escapeHTML(correctAnswer)}
          </span>

          <i class="bi bi-check-circle-fill"></i>

        </div>

      </div>

    </div>
  `;
}

function normalizeAnswer(answer) {
  return String(answer ?? "")
    .trim()
    .toLowerCase();
}

function showReviewMessage(message) {
  const reviewMessage =
    document.getElementById("reviewMessage");

  reviewMessage.textContent = message;
  reviewMessage.classList.remove("d-none");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}