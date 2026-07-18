document.addEventListener("DOMContentLoaded", function () {
  loadExamHistory();
});

function loadExamHistory() {
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

  const studentResults = getResultsByStudent(student.id)
    .slice()
    .sort(function (firstResult, secondResult) {
      return (
        new Date(secondResult.submittedAt) -
        new Date(firstResult.submittedAt)
      );
    });

  const historyList =
    document.getElementById("historyList");

  const emptyMessage =
    document.getElementById("emptyHistoryMessage");

  const missionsCount =
    document.getElementById("missionsCount");

  historyList.innerHTML = "";
  missionsCount.textContent = studentResults.length;

  if (studentResults.length === 0) {
    emptyMessage.classList.remove("d-none");
    return;
  }

  emptyMessage.classList.add("d-none");

  studentResults.forEach(function (result) {
    const exam = getExamById(result.examId);

    if (!exam) {
      return;
    }

    const review = getAnswerReview(result.id);

    const correctAnswers = review.filter(function (question) {
      return question.isCorrect === true;
    }).length;

    const teacher = getUserById(exam.createdBy);

    const teacherName = teacher
      ? teacher.fullName
      : "Science Teacher";

    const status = getResultStatus(result);

    const historyCard = document.createElement("article");

    historyCard.className =
      `history-card history-card--${status.className}`;

    historyCard.innerHTML = `
      <div class="history-card__icon">

        <i class="bi ${getExamIcon(result.score)}"></i>

      </div>

      <div class="history-card__content">

        <div class="history-card__heading">

          <div>

            <h2>
              ${escapeHTML(exam.title)}
            </h2>

            <div class="history-card__meta">

              <span>
                <i class="bi bi-calendar3"></i>
                ${formatDate(result.submittedAt)}
              </span>

              <span>
                <i class="bi bi-ui-checks"></i>
                ${correctAnswers}/${review.length}
                (${result.score}%)
              </span>

              <span class="history-status">
                ${status.label}
              </span>

            </div>

          </div>

          <span class="history-grade">
            ${escapeHTML(result.grade)}
          </span>

        </div>

        <blockquote class="history-feedback">

          <p>
            “${escapeHTML(
              result.feedback || "Keep exploring and learning science."
            )}”
          </p>

          <cite>
            — ${escapeHTML(teacherName)}
          </cite>

        </blockquote>

      </div>

      <button
        type="button"
        class="history-review-button"
        data-result-id="${result.id}"
      >
        <i class="bi bi-eye-fill"></i>
        Review Report
      </button>
    `;

    historyList.appendChild(historyCard);
  });

  addReviewButtonEvents();
}

function addReviewButtonEvents() {
  const reviewButtons =
    document.querySelectorAll("[data-result-id]");

  reviewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const resultId = button.dataset.resultId;

      setCurrent("currentResult", {
        resultId: resultId
      });

      window.location.href = "review-exam.html";
    });
  });
}

function getResultStatus(result) {
  if (Number(result.score) === 100) {
    return {
      label: "Perfect Score",
      className: "perfect"
    };
  }

  if (Number(result.score) >= 80) {
    return {
      label: "Mastered",
      className: "mastered"
    };
  }

  if (result.passed) {
    return {
      label: "Completed",
      className: "completed"
    };
  }

  return {
    label: "Needs Practice",
    className: "failed"
  };
}

function getExamIcon(score) {
  if (Number(score) === 100) {
    return "bi-trophy-fill";
  }

  if (Number(score) >= 80) {
    return "bi-rocket-takeoff-fill";
  }

  if (Number(score) >= 50) {
    return "bi-flask-fill";
  }

  return "bi-book-fill";
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}