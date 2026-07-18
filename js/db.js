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

function oneToMany (parents,children,pk,fk,resultKey){
    return parents.map(parent =>({
        ... parent,
        [resultKey]: children.filter(child => child[fk] === parent[pk]) 
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

function seedDatabase() {

    if (getExams().some(function (e) { return e.title === "Fun with Science"; })) {
        console.log("Graded exams test data already exists - skipping to avoid duplicates.");
        return;
    }

    const teacher = addUser(
        "teacher",
        "Dr. Layla Mansour",
        "Female",
        "2000998877",
        "0791112222",
        "dr.layla",
        "password123",
        "Teaching Science",
        8
    );

    const amir = addStudent("Amir Khalil", "Male", "2001111111", "0791111111", "amir.khalil", "pass123");
    const lina = addStudent("Lina Farouk", "Female", "2002222222", "0792222222", "lina.farouk", "pass123");
    const omar = addStudent("Omar Nasser", "Male", "2003333333", "0793333333", "omar.nasser", "pass123");

    /* Exam A - "finished": all 3 students have already submitted */
    const examA = addExam(
        "The Amazing World of Science",
        "Science",
        "2026-07-10T09:00",
        30,
        8,
        "inactive",
        teacher.id
    );

    /* Exam B - "still available": active, nobody has taken it yet */
    const examB = addExam(
        "Fun with Science",
        "Science",
        "2026-07-25T09:00",
        30,
        8,
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

    function addFullQuestionSet(examId, data) {
        const questions = [];

        data.mcq.forEach(function (q, i) {
            const opts = buildOptions(q.options);
            const correctKey = "o" + (q.correct + 1);
            questions.push(addQuestion(examId, "mcq", q.text, opts, correctKey, 10, i + 1));
        });

        data.trueFalse.forEach(function (q, i) {
            questions.push(addQuestion(examId, "trueFalse", q.text, [], q.correct, 10, i + 3));
        });

        data.multiAnswer.forEach(function (q, i) {
            const opts = buildOptions(q.options);
            const correctKeys = q.correctIndexes.map(function (idx) { return "o" + (idx + 1); });
            questions.push(addQuestion(examId, "multiAnswer", q.text, opts, correctKeys, 10, i + 5));
        });

        data.shortAnswer.forEach(function (q, i) {
            questions.push(addQuestion(examId, "shortAnswer", q.text, [], q.correct, 10, i + 7));
        });

        return questions;
    }

    const examAQuestions = addFullQuestionSet(examA.id, {
        mcq: [
            { text: "What do plants need to grow?", options: ["Sunlight and water", "Only darkness", "Ice only", "Nothing at all"], correct: 0 },
            { text: "Which planet do we live on?", options: ["Mars", "Earth", "Jupiter", "Venus"], correct: 1 }
        ],
        trueFalse: [
            { text: "The Sun is a star.", correct: true },
            { text: "Fish can breathe air the same way humans do.", correct: false }
        ],
        multiAnswer: [
            { text: "Which of these are living things? (Select all that apply)", options: ["Dog", "Rock", "Tree", "Chair"], correctIndexes: [0, 2] },
            { text: "Which of these are weather conditions? (Select all that apply)", options: ["Rain", "Snow", "Homework", "Sunshine"], correctIndexes: [0, 1, 3] }
        ],
        shortAnswer: [
            { text: "How many legs does a spider have?", correct: 8 },
            { text: "How many days are there in one week?", correct: 7 }
        ]
    });

    addFullQuestionSet(examB.id, {
        mcq: [
            { text: "What do we call frozen water?", options: ["Steam", "Ice", "Juice", "Sand"], correct: 1 },
            { text: "Which sense do we use to hear sounds?", options: ["Sight", "Smell", "Hearing", "Taste"], correct: 2 }
        ],
        trueFalse: [
            { text: "The Earth orbits around the Sun.", correct: true },
            { text: "All insects have exactly four legs.", correct: false }
        ],
        multiAnswer: [
            { text: "Which of these are sources of light? (Select all that apply)", options: ["Sun", "Flashlight", "Rock", "Candle"], correctIndexes: [0, 1, 3] },
            { text: "Which of these are parts of a plant? (Select all that apply)", options: ["Roots", "Leaves", "Wheels", "Stem"], correctIndexes: [0, 1, 3] }
        ],
        shortAnswer: [
            { text: "How many colors are in a rainbow?", correct: 7 },
            { text: "How many seasons are there in a year?", correct: 4 }
        ]
    });

    // Produces a genuinely wrong answer in the right shape for each type
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
            const correct = question.correctAnswer;
            const allKeys = question.options.map(function (o) { return Object.keys(o)[0]; });
            const wrongKey = allKeys.find(function (k) { return !correct.includes(k); });
            const partial = correct.slice(0, -1);
            return wrongKey ? partial.concat([wrongKey]) : partial;
        }
        // shortAnswer
        return question.correctAnswer + 1;
    }

    // Builds a result with a real, computed score/grade based on which
    // question indexes (0-7) should be answered wrong.
    function buildResult(studentId, examId, questions, wrongIndexSet) {
        let earnedPoints = 0;
        let totalPoints = 0;

        const answers = questions.map(function (q, idx) {
            const points = Number(q.points) || 0;
            totalPoints += points;

            if (wrongIndexSet.has(idx)) {
                return { questionId: q.id, studentAnswer: wrongAnswerFor(q) };
            }
            earnedPoints += points;
            return { questionId: q.id, studentAnswer: q.correctAnswer };
        });

        const score = Math.round((earnedPoints / totalPoints) * 100);
        const grade = gradeCalc(score);

        return addResult(studentId, examId, answers, score, grade, score >= 50, "");
    }

    // Amir - all 8 correct -> should land as an A
    buildResult(amir.id, examA.id, examAQuestions, new Set());

    // Lina - 1 wrong out of 8 (7/8 = 87.5% -> 88%) -> should land as a B
    buildResult(lina.id, examA.id, examAQuestions, new Set([4]));

    // Omar - 5 wrong out of 8 (3/8 = 37.5% -> 38%) -> should land as an F
    buildResult(omar.id, examA.id, examAQuestions, new Set([0, 1, 2, 5, 6]));

    // Exam B intentionally gets ZERO results - it's the "still available" one
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