//DB

    //low-level

function getTable(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setTable(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getCurrent(key) {
  return JSON.parse(sessionStorage.getItem(key) || 'null');
}

function setCurrent(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

function clearCurrent(key) {
  sessionStorage.removeItem(key);
}


    //Relations and Joins

function oneToMany (parents,children,fk,resultKey){
    return parents.map(parent =>({
        ... parent,
        [resultKey]: children.filter(child => child[fk] === parent.id) 
    }))
}

        //fk == forignKey

function manyToMany(parent,junction,child,fk1,fk2,resultKey){
    const joinedTable = oneToMany(parent,junction,fk1,'joinedRows')

    return joinedTable.map(table => {
        const ids = table.joinedRows.map(row => row[fk2])
        const results = child.filter(b => ids.includes(b.id))
        const {joinedRows, ...rest} = table
        return {...rest, [resultKey]:results}
    })
}

    //Templates 

function userTemplate() {
  return {
    role: '',
    fullName: '',
    gender: '',
    nationalId: '',
    phone: '',
    username: '',
    password: '',
    about: '',
    yearsOfExp: 0
  };
}

function examTemplate() {
  return {
    title: '',
    subject: '',
    dateTime: '',
    duration: '',
    numQuestions: 0,
    status: 'inactive',
    createdBy: ''
  };
}
 
function questionTemplate() {
  return {
    examId: '',
    type: 'mcq',
    text: '',
    options: [],
    correctAnswer: null,
    points: 10,
    order: 1
  };
}
 
function resultTemplate() {
  return {
    studentId: '',
    examId: '',
    answers: [],
    score: 0,
    grade: '',
    passed: false,
    feedback: ''
  };
}

function currentTemplate(){
    return {
        id:'',
        role:''
    }
}


//Creating , reading Tables 

 
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
 
function getUsers() {
  return getTable('users');
}
 
function getUserById(id) {
  return getUsers().find(user => user.id === id) || null;
}
 
function addUser(role, fullName, gender, nationalId, phone, username, password, about, yearsOfExp) {
  const users = getTable('users');
 
  const user = { ...userTemplate(), id: generateId('u'), createdAt: new Date().toISOString() };
 
  user.role = role;
  user.fullName = fullName;
  user.gender = gender;
  user.nationalId = nationalId;
  user.phone = phone;
  user.username = username;
  user.password = password;
  user.about = about;
  user.yearsOfExp = yearsOfExp;
 
  users.push(user);
  setTable('users', users);
  return user;
}
 
function getExams() {
  return getTable('exams');
}
 
function getExamById(id) {
  return getExams().find(exam => exam.id === id) || null;
}
 
function addExam(title, subject, dateTime, duration, numQuestions, status, createdBy) {
  const exams = getTable('exams');
 
  const exam = { ...examTemplate(), id: generateId('e'), createdAt: new Date().toISOString() };
 
  exam.title = title;
  exam.subject = subject;
  exam.dateTime = dateTime;
  exam.duration = duration;
  exam.numQuestions = numQuestions;
  exam.status = status;
  exam.createdBy = createdBy;
 
  exams.push(exam);
  setTable('exams', exams);
  return exam;
}
 
function getQuestions() {
  return getTable('questions');
}
 
function getQuestionById(id) {
  return getQuestions().find(question => question.id === id) || null;
}
 
function addQuestion(examId, type, text, options, correctAnswer, points, order) {
  const questions = getTable('questions');
 
  const question = { ...questionTemplate(), id: generateId('q') };
 
  question.examId = examId;
  question.type = type;
  question.text = text;
  question.options = options;
  question.correctAnswer = correctAnswer;
  question.points = points;
  question.order = order;
 
  questions.push(question);
  setTable('questions', questions);
  return question;
}
 
function getResults() {
  return getTable('results');
}
 
function getResultById(id) {
  return getResults().find(result => result.id === id) || null;
}
 
function addResult(studentId, examId, answers, score, grade, passed, feedback) {
  const results = getTable('results');
 
  const result = { ...resultTemplate(), id: generateId('r'), submittedAt: new Date().toISOString() };
 
  result.studentId = studentId;
  result.examId = examId;
  result.answers = answers;
  result.score = score;
  result.grade = grade;
  result.passed = passed;
  result.feedback = feedback;
 
  results.push(result);
  setTable('results', results);
  return result;
}


//Backend
function seedDatabase(){

    if (getUsers().length > 0) return;

    const teacher = addUser(
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

    /* Students - 20 total, generated in a loop */
    const students = [];
    for (let i = 1; i <= 20; i++) {
        students.push(addStudent(
            `Student ${i}`,
            i % 2 === 0 ? "Female" : "Male",
            `20${String(i).padStart(2, '0')}0000001`,
            `07900000${String(i).padStart(2, '0')}`,
            `student${i}`,
            "123456"
        ));
    }

    /* Exam - just 1 */
    const exam = addExam(
        "Molecular Biology Quiz",
        "Biology",
        "2026-10-24T09:00",
        60,
        20,
        "active",
        teacher.id
    );

    function buildOptions(texts) {
        return texts.map(function (text, idx) {
            const key = "o" + (idx + 1);
            const obj = {};
            obj[key] = text;
            return obj;
        });
    }

    const questions = [];

    /* 5 Multiple Choice */
    const mcqData = [
        { text: "What is the basic unit of life?", options: ["Atom", "Cell", "Molecule", "Tissue"], correct: 1 },
        { text: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correct: 2 },
        { text: "DNA stands for:", options: ["Deoxyribonucleic acid", "Dioxyribose nucleic acid", "Deoxyribose nuclear acid", "Dual nucleic acid"], correct: 0 },
        { text: "What are the building blocks of proteins?", options: ["Nucleotides", "Amino acids", "Fatty acids", "Monosaccharides"], correct: 1 },
        { text: "What is the primary energy currency of the cell?", options: ["Glucose", "ATP", "NADH", "Protein"], correct: 1 }
    ];
    mcqData.forEach(function (q, i) {
        const opts = buildOptions(q.options);
        const correctKey = "o" + (q.correct + 1);
        questions.push(addQuestion(exam.id, "mcq", q.text, opts, correctKey, 5, i + 1));
    });

    /* 5 True/False */
    const tfData = [
        { text: "The mitochondria is the powerhouse of the cell.", correct: true },
        { text: "DNA replication occurs during the S phase of the cell cycle.", correct: true },
        { text: "Ribosomes are only found in eukaryotic cells.", correct: false },
        { text: "RNA contains uracil instead of thymine.", correct: true },
        { text: "Animal cells have a cell wall.", correct: false }
    ];
    tfData.forEach(function (q, i) {
        questions.push(addQuestion(exam.id, "trueFalse", q.text, [], q.correct, 5, i + 6));
    });

    /* 5 Multiple Answers (select all that apply) */
    const maData = [
        { text: "Which of the following are nitrogenous bases found in DNA? (Select all that apply)", options: ["Adenine", "Uracil", "Thymine", "Guanine"], correctIndexes: [0, 2, 3] },
        { text: "Which of the following are organelles found in a eukaryotic cell? (Select all that apply)", options: ["Nucleus", "Mitochondria", "Ribosome", "Cell Wall"], correctIndexes: [0, 1, 2] },
        { text: "Which of these processes occur during protein synthesis? (Select all that apply)", options: ["Transcription", "Translation", "Replication", "Splicing"], correctIndexes: [0, 1, 3] },
        { text: "Which of these are types of RNA? (Select all that apply)", options: ["mRNA", "tRNA", "rRNA", "gDNA"], correctIndexes: [0, 1, 2] },
        { text: "Which of these are functions of the cell membrane? (Select all that apply)", options: ["Selective permeability", "Protein synthesis", "Cell communication", "DNA replication"], correctIndexes: [0, 2] }
    ];
    maData.forEach(function (q, i) {
        const opts = buildOptions(q.options);
        const correctKeys = q.correctIndexes.map(function (idx) { return "o" + (idx + 1); });
        questions.push(addQuestion(exam.id, "multiAnswer", q.text, opts, correctKeys, 5, i + 11));
    });

    /* 5 Short Answer (numeric only) */
    const saData = [
        { text: "How many chromosomes are in a normal human somatic cell?", correct: 46 },
        { text: "How many chambers does the human heart have?", correct: 4 },
        { text: "How many nucleotide bases make up a single DNA codon?", correct: 3 },
        { text: "How many strands make up a DNA double helix?", correct: 2 },
        { text: "How many amino acids are commonly found in human proteins?", correct: 20 }
    ];
    saData.forEach(function (q, i) {
        questions.push(addQuestion(exam.id, "shortAnswer", q.text, [], q.correct, 5, i + 16));
    });

    // Builds a genuinely wrong answer in the right shape for each question type
    function wrongAnswerFor(question) {
        if (question.type === "mcq") {
            const correctIndex = Number(question.correctAnswer.slice(1)) - 1;
            const wrongIndex = (correctIndex + 1) % question.options.length;
            return "o" + (wrongIndex + 1);
        }
        if (question.type === "trueFalse") {
            return !question.correctAnswer;
        }
        if (question.type === "multiAnswer") {
            // drop one correct option and add one wrong one - a believable near-miss
            const correct = question.correctAnswer;
            const allKeys = question.options.map(function (o) { return Object.keys(o)[0]; });
            const wrongKey = allKeys.find(function (k) { return !correct.includes(k); });
            const partial = correct.slice(0, -1);
            return wrongKey ? partial.concat([wrongKey]) : partial;
        }
        // shortAnswer
        return question.correctAnswer + 1;
    }

    /* Results - only the first 10 students (half) have submitted, with a
       genuinely varied number of wrong answers per student so scores spread
       across a believable range, not one uniform formula. */
    const wrongCountPerStudent = [0, 1, 2, 3, 4, 5, 7, 9, 11, 14];

    for (let i = 0; i < 10; i++) {
        const wrongCount = wrongCountPerStudent[i];

        const wrongIndexes = new Set();
        for (let w = 0; w < wrongCount; w++) {
            wrongIndexes.add((w * 3 + i) % questions.length);
        }

        const answers = questions.map(function (q, idx) {
            if (wrongIndexes.has(idx)) {
                return { questionId: q.id, studentAnswer: wrongAnswerFor(q) };
            }
            return { questionId: q.id, studentAnswer: q.correctAnswer };
        });

        const correctCount = questions.length - wrongIndexes.size;
        const score = Math.round((correctCount / questions.length) * 100);
        const grade = gradeCalc(score);

        addResult(students[i].id, exam.id, answers, score, grade, score >= 50, "");
    }
}

seedDatabase()

    //AUTHENTICATION

function login(username, password) {
    const user = getUserByUsername(username)
    if (!user) return false;
    if (user.password !== password) return false;

    const curr = currentTemplate();
    curr.id = user.id;
    curr.role = user.role;
    setCurrent('currentUser', curr);
    return true;
}

function logout() {
    clearCurrent('currentUser');
}


function isUsernameTaken(username) {
    return getUserByUsername(username) !== null;
}

function addStudent(fullName, gender, nationalId, phone, username, password) {
    if (isUsernameTaken(username)) return null;
 
    return addUser('student', fullName, gender, nationalId, phone, username, password, '', 0);
}

function deleteStudent(studentId){
    const users = getUsers();
    const filtered = users.filter(u => u.id !== studentId);
    if (filtered.length === users.length) return false;

    setTable('users', filtered);

    const results = getResults();
    const filteredResults = results.filter(r => r.studentId !== studentId);
    setTable('results', filteredResults);

    return true;
}

    //AUTHORIZATION
function requireRole(role) {
    const curr = getCurrent('currentUser');
    if (!curr || curr.role !== role) {
        window.location.href = '/login.html';
    }
}


    //quick lookup
function getUserByUsername(username) {
    return getUsers().find(u => u.username === username) || null;
}
function getQuestionsByExam(examId){
    return getQuestions()
        .filter(question => question.examId === examId)
        .sort((a, b) => a.order - b.order);
}

    //teacher/dashboard.html 
    //teacher/students.html
function getStudents(){
    return getUsers().filter(user => user.role === "student") 
}

    //teacher/exams.html
function getExamsByTeacher(teacherId){
    return getExams().filter(exam => exam.createdBy === teacherId)
}

    //student/dashboard.html
    //student/exams.html
function getActiveExams(){
    return getExams().filter(exam => exam.status === "active")
}

    //student/history.html
    //student/dashboard.html
function getResultsByStudent(studentId){
    return getResults().filter(result => result.studentId === studentId)
}

    //Teacher/dashboard.html
function getResultsByExam(examId){
    return getResults().filter(result => result.examId === examId)
}

    //student/exams.html
    //student/take-exam.html
function hasStudentTakenExam(studentId, examId){
    const flags = getResults().map(result => result.studentId === studentId && result.examId === examId)
    
    return flags.some(flag => flag === true)
}
    //teacher/exams.html
function updateExamStatus(examId, status){
    const exams = getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return null;
    exam.status = status;
    setTable('exams', exams);
    return exam;
}
    //student/dashboard.html
    //student/exams.html
function getAvailableExamsForStudent(studentId){
    const active = getActiveExams()
    const available = []
    active.filter(exam => !hasStudentTakenExam(studentId,exam.id) ? available.push(exam) : null)
    return available
}


function compareQuestionAnswers(studentAnswer, correctAnswer) {
  if (Array.isArray(correctAnswer)) {
    const studentAnswers = Array.isArray(studentAnswer)
      ? studentAnswer.map(String).sort()
      : [];

    const correctAnswers = correctAnswer
      .map(String)
      .sort();

    return (
      studentAnswers.length === correctAnswers.length &&
      correctAnswers.every(function (answer, index) {
        return answer === studentAnswers[index];
      })
    );
  }

  if (typeof correctAnswer === "boolean") {
    return studentAnswer === correctAnswer;
  }

  if (typeof correctAnswer === "number") {
    return (
      studentAnswer !== "" &&
      studentAnswer !== null &&
      Number(studentAnswer) === correctAnswer
    );
  }

  return (
    String(studentAnswer ?? "")
      .trim()
      .toLowerCase() ===
    String(correctAnswer ?? "")
      .trim()
      .toLowerCase()
  );
}

function getAnswerReview(resultId) {
  const result = getResultById(resultId);

  if (!result) {
    return [];
  }

  const questions = getQuestionsByExam(result.examId);
  const answers = Array.isArray(result.answers)
    ? result.answers
    : [];

  return questions.map(function (question) {
    const submittedAnswer = answers.find(function (answer) {
      return answer.questionId === question.id;
    });

    const studentAnswer = submittedAnswer
      ? submittedAnswer.studentAnswer
      : "";

    return {
      ...question,
      resultId: resultId,
      studentId: result.studentId,
      studentAnswer: studentAnswer,
      isCorrect: compareQuestionAnswers(
        studentAnswer,
        question.correctAnswer
      )
    };
  });
}
function updateResultFeedback(resultId, feedback) {
  const results = getResults();

  const result = results.find(function (item) {
    return item.id === resultId;
  });

  if (!result) {
    return null;
  }

  result.feedback = feedback;
  setTable("results", results);

  return result;
}

function gradeTier(grade) {
  const letter = String(grade || "")[0];

  if (letter === "A") {
    return "high";
  }

  if (letter === "B" || letter === "C") {
    return "mid";
  }

  return "low";
}

function gradeCalc(score) {
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
      duration: 30,
      numQuestions: 5,
      status: "active"
    },
    {
      title: "Human Body Basics",
      subject: "Science",
      dateTime: "2026-07-21T11:00",
      duration: 30,
      numQuestions: 5,
      status: "active"
    },
    {
      title: "Matter and Materials",
      subject: "Science",
      dateTime: "2026-07-22T12:00",
      duration: 30,
      numQuestions: 5,
      status: "active"
    },
    {
      title: "Plants and Photosynthesis",
      subject: "Science",
      dateTime: "2026-07-23T09:00",
      duration: 30,
      numQuestions: 5,
      status: "active"
    }
  ];

  const testQuestions = [
    /* =====================================
       The Solar System
    ===================================== */

    {
      examTitle: "The Solar System",
      type: "mcq",
      text: "Which planet is closest to the Sun?",
      options: [
        { o1: "Earth" },
        { o2: "Mercury" },
        { o3: "Mars" },
        { o4: "Jupiter" }
      ],
      correctAnswer: "o2",
      points: 10,
      order: 1
    },
    {
      examTitle: "The Solar System",
      type: "trueFalse",
      text: "The Sun is a star.",
      options: [],
      correctAnswer: true,
      points: 10,
      order: 2
    },
    {
      examTitle: "The Solar System",
      type: "multiAnswer",
      text: "Choose all the rocky planets.",
      options: [
        { o1: "Mercury" },
        { o2: "Earth" },
        { o3: "Jupiter" },
        { o4: "Mars" }
      ],
      correctAnswer: ["o1", "o2", "o4"],
      points: 10,
      order: 3
    },
    {
      examTitle: "The Solar System",
      type: "numerical",
      text: "How many planets are in the Solar System?",
      options: [],
      correctAnswer: 8,
      points: 10,
      order: 4
    },
    {
      examTitle: "The Solar System",
      type: "mcq",
      text: "Which planet is famous for its rings?",
      options: [
        { o1: "Mercury" },
        { o2: "Earth" },
        { o3: "Saturn" },
        { o4: "Mars" }
      ],
      correctAnswer: "o3",
      points: 10,
      order: 5
    },

    /* =====================================
       Human Body Basics
    ===================================== */

    {
      examTitle: "Human Body Basics",
      type: "mcq",
      text: "Which organ pumps blood around the body?",
      options: [
        { o1: "Brain" },
        { o2: "Heart" },
        { o3: "Lungs" },
        { o4: "Stomach" }
      ],
      correctAnswer: "o2",
      points: 10,
      order: 1
    },
    {
      examTitle: "Human Body Basics",
      type: "trueFalse",
      text: "Humans normally have two lungs.",
      options: [],
      correctAnswer: true,
      points: 10,
      order: 2
    },
    {
      examTitle: "Human Body Basics",
      type: "multiAnswer",
      text: "Choose the parts involved in breathing.",
      options: [
        { o1: "Lungs" },
        { o2: "Trachea" },
        { o3: "Stomach" },
        { o4: "Kidneys" }
      ],
      correctAnswer: ["o1", "o2"],
      points: 10,
      order: 3
    },
    {
      examTitle: "Human Body Basics",
      type: "numerical",
      text: "How many chambers does the human heart have?",
      options: [],
      correctAnswer: 4,
      points: 10,
      order: 4
    },
    {
      examTitle: "Human Body Basics",
      type: "mcq",
      text: "Which part of the body protects the brain?",
      options: [
        { o1: "Ribs" },
        { o2: "Skull" },
        { o3: "Spine" },
        { o4: "Muscles" }
      ],
      correctAnswer: "o2",
      points: 10,
      order: 5
    },

    /* =====================================
       Matter and Materials
    ===================================== */

    {
      examTitle: "Matter and Materials",
      type: "mcq",
      text: "Which of the following is a state of matter?",
      options: [
        { o1: "Solid" },
        { o2: "Light" },
        { o3: "Sound" },
        { o4: "Heat" }
      ],
      correctAnswer: "o1",
      points: 10,
      order: 1
    },
    {
      examTitle: "Matter and Materials",
      type: "trueFalse",
      text: "Water can exist as a solid.",
      options: [],
      correctAnswer: true,
      points: 10,
      order: 2
    },
    {
      examTitle: "Matter and Materials",
      type: "multiAnswer",
      text: "Choose the three common states of matter.",
      options: [
        { o1: "Solid" },
        { o2: "Liquid" },
        { o3: "Gas" },
        { o4: "Light" }
      ],
      correctAnswer: ["o1", "o2", "o3"],
      points: 10,
      order: 3
    },
    {
      examTitle: "Matter and Materials",
      type: "numerical",
      text: "How many common states of matter are there?",
      options: [],
      correctAnswer: 3,
      points: 10,
      order: 4
    },
    {
      examTitle: "Matter and Materials",
      type: "mcq",
      text: "Steam is an example of which state of matter?",
      options: [
        { o1: "Solid" },
        { o2: "Liquid" },
        { o3: "Gas" },
        { o4: "Metal" }
      ],
      correctAnswer: "o3",
      points: 10,
      order: 5
    },

    /* =====================================
       Plants and Photosynthesis
    ===================================== */

    {
      examTitle: "Plants and Photosynthesis",
      type: "mcq",
      text: "Which part of a plant absorbs water from the soil?",
      options: [
        { o1: "Flower" },
        { o2: "Roots" },
        { o3: "Fruit" },
        { o4: "Leaves" }
      ],
      correctAnswer: "o2",
      points: 10,
      order: 1
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "trueFalse",
      text: "Plants need sunlight to make food.",
      options: [],
      correctAnswer: true,
      points: 10,
      order: 2
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "multiAnswer",
      text: "Choose what plants need for photosynthesis.",
      options: [
        { o1: "Sunlight" },
        { o2: "Water" },
        { o3: "Carbon dioxide" },
        { o4: "Plastic" }
      ],
      correctAnswer: ["o1", "o2", "o3"],
      points: 10,
      order: 3
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "shortAnswer",
      text: "Which gas do plants absorb from the air?",
      options: [],
      correctAnswer: "Carbon dioxide",
      points: 10,
      order: 4
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "mcq",
      text: "Which pigment gives leaves their green color?",
      options: [
        { o1: "Chlorophyll" },
        { o2: "Oxygen" },
        { o3: "Protein" },
        { o4: "Calcium" }
      ],
      correctAnswer: "o1",
      points: 10,
      order: 5
    }
  ];

  const exams = getExams();
  const questions = getQuestions();

  testExams.forEach(function (examData) {
    let exam = exams.find(function (storedExam) {
      return storedExam.title === examData.title;
    });

    if (!exam) {
      exam = {
        ...examTemplate(),
        id: generateId("e"),
        createdAt: new Date().toISOString(),
        title: examData.title,
        subject: examData.subject,
        dateTime: examData.dateTime,
        duration: examData.duration,
        numQuestions: examData.numQuestions,
        status: examData.status,
        createdBy: teacher.id
      };

      exams.push(exam);
    } else {
      exam.subject = examData.subject;
      exam.dateTime = examData.dateTime;
      exam.duration = examData.duration;
      exam.numQuestions = examData.numQuestions;
      exam.status = examData.status;
      exam.createdBy = teacher.id;
    }
  });

  testQuestions.forEach(function (questionData) {
    const exam = exams.find(function (storedExam) {
      return storedExam.title === questionData.examTitle;
    });

    if (!exam) {
      return;
    }

    let question = questions.find(function (storedQuestion) {
      return (
        storedQuestion.examId === exam.id &&
        storedQuestion.text === questionData.text
      );
    });

    if (!question) {
      question = {
        ...questionTemplate(),
        id: generateId("q"),
        examId: exam.id
      };

      questions.push(question);
    }

    question.type = questionData.type;
    question.text = questionData.text;
    question.options = questionData.options;
    question.correctAnswer = questionData.correctAnswer;
    question.points = questionData.points;
    question.order = questionData.order;
  });

  setTable("exams", exams);
  setTable("questions", questions);
}

seedAvailableExamsTestData();