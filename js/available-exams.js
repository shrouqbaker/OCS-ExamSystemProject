function seedAvailableExamsTestData() {
  let teacher = getUserByUsername("dr.ahmad");

if (!teacher) {
  teacher = addUser(
    "teacher",
    "Dr. Ahmad",
    "Male",
    "2000312489",
    "0791231231",
    "dr.ahmad",
    "password123",
    "Teaching Science",
    10
  );
}

  let student = getUserByUsername("rama.student");

  if (!student) {
    student = addStudent(
      "Rama Student",
      "Female",
      "2004123456",
      "0790000000",
      "rama.student",
      "password123"
    );
  }

  const testExams = [
    {
      title: "The Solar System",
      subject: "Science",
      dateTime: "2026-07-20T10:00",
      questions: [
        {
          type: "mcq",
          text: "Which planet is closest to the Sun?",
          options: ["Earth", "Mercury", "Mars", "Jupiter"],
          correctAnswer: "Mercury"
        },
        {
          type: "trueFalse",
          text: "The Sun is a star.",
          options: ["True", "False"],
          correctAnswer: "True"
        },
        {
          type: "mcq",
          text: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Saturn", "Neptune"],
          correctAnswer: "Mars"
        },
        {
          type: "shortAnswer",
          text: "How many planets are in the Solar System?",
          options: [],
          correctAnswer: "8"
        },
        {
          type: "mcq",
          text: "Which planet has rings?",
          options: ["Mercury", "Earth", "Saturn", "Mars"],
          correctAnswer: "Saturn"
        }
      ]
    },

    {
      title: "Human Body Basics",
      subject: "Science",
      dateTime: "2026-07-21T11:00",
      questions: [
        {
          type: "mcq",
          text: "Which organ pumps blood?",
          options: ["Brain", "Heart", "Lungs", "Stomach"],
          correctAnswer: "Heart"
        },
        {
          type: "trueFalse",
          text: "Humans have two lungs.",
          options: ["True", "False"],
          correctAnswer: "True"
        },
        {
          type: "mcq",
          text: "Which organ helps us breathe?",
          options: ["Lungs", "Kidneys", "Skin", "Bones"],
          correctAnswer: "Lungs"
        },
        {
          type: "shortAnswer",
          text: "How many chambers does the heart have?",
          options: [],
          correctAnswer: "4"
        },
        {
          type: "mcq",
          text: "Which part protects the brain?",
          options: ["Ribs", "Skull", "Spine", "Muscles"],
          correctAnswer: "Skull"
        }
      ]
    },

    {
      title: "Matter and Materials",
      subject: "Science",
      dateTime: "2026-07-22T12:00",
      questions: [
        {
          type: "mcq",
          text: "Which is a state of matter?",
          options: ["Solid", "Light", "Sound", "Heat"],
          correctAnswer: "Solid"
        },
        {
          type: "trueFalse",
          text: "Water can exist as a solid.",
          options: ["True", "False"],
          correctAnswer: "True"
        },
        {
          type: "mcq",
          text: "Ice is an example of:",
          options: ["Gas", "Liquid", "Solid", "Plasma"],
          correctAnswer: "Solid"
        },
        {
          type: "shortAnswer",
          text: "How many common states of matter are there?",
          options: [],
          correctAnswer: "3"
        },
        {
          type: "mcq",
          text: "Steam is a:",
          options: ["Solid", "Liquid", "Gas", "Metal"],
          correctAnswer: "Gas"
        }
      ]
    },

    {
      title: "Plants and Photosynthesis",
      subject: "Science",
      dateTime: "2026-07-23T09:00",
      questions: [
        {
          type: "mcq",
          text: "Which part absorbs water?",
          options: ["Flower", "Roots", "Fruit", "Leaves"],
          correctAnswer: "Roots"
        },
        {
          type: "trueFalse",
          text: "Plants need sunlight to make food.",
          options: ["True", "False"],
          correctAnswer: "True"
        },
        {
          type: "mcq",
          text: "Photosynthesis mainly happens in:",
          options: ["Roots", "Stem", "Leaves", "Flowers"],
          correctAnswer: "Leaves"
        },
        {
          type: "shortAnswer",
          text: "Which gas do plants absorb?",
          options: [],
          correctAnswer: "Carbon dioxide"
        },
        {
          type: "mcq",
          text: "Which pigment makes leaves green?",
          options: ["Chlorophyll", "Oxygen", "Protein", "Calcium"],
          correctAnswer: "Chlorophyll"
        }
      ]
    }
  ];

  testExams.forEach(function (examData) {
    const examAlreadyExists = getExams().some(function (exam) {
      return exam.title === examData.title;
    });

    if (examAlreadyExists) {
      return;
    }

    const exam = addExam(
      examData.title,
      examData.subject,
      examData.dateTime,
      30,
      examData.questions.length,
      "active",
      teacher.id
    );

    examData.questions.forEach(function (question, index) {
      addQuestion(
        exam.id,
        question.type,
        question.text,
        question.options,
        question.correctAnswer,
        10,
        index + 1
      );
    });
  });

  setCurrent("currentUser", {
    id: student.id,
    role: "student"
  });
}

seedAvailableExamsTestData();

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