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

function getAnswerReview(resultId){
    const result = getResultById(resultId);
    const questions = getQuestionsByExam(result.examId);

    return questions.map(question => {
        const studentAnswer = result.answers.find(a => a.questionId == question.id)?.studentAnswer;

        let isCorrect;
        if (question.type === "multiAnswer") {
            const sa = studentAnswer || [];
            isCorrect = sa.length === question.correctAnswer.length && question.correctAnswer.every(id => sa.includes(id));
        } else {
            isCorrect = studentAnswer === question.correctAnswer;
        }

        return {
            ...question,
            resultId: resultId,
            studentId: result.studentId,
            studentAnswer: studentAnswer,
            isCorrect: isCorrect
        };
    });
}

function updateResultFeedback (resultId,feedback){
    const results = getResults();
    const result = results.find(e => e.id === resultId);
    if (!result) return null;
    result.feedback = feedback;
    setTable('results', results);
    return result;
}

function gradeTier(grade){
    const letter = grade[0]
    if (letter === 'A') return 'high'
    if (letter === 'B' || letter === 'C') return 'mid'
    return 'low'
}

function gradeCalc(score){
  let grade
  if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else if (score >= 50) grade = 'F';
  return grade
}
