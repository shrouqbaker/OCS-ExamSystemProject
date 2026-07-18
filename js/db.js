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

    if(getUsers().length > 1) return;

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


    /* Students */

    const s1 = addStudent(
        "Alex Rivera",
        "Male",
        "2001123123123",
        "0791111111",
        "alex",
        "123456"
    );

    const s2 = addStudent(
        "Sara Ali",
        "Female",
        "2002456456456",
        "0792222222",
        "sara",
        "123456"
    );

    const s3 = addStudent(
        "John Smith",
        "Male",
        "2003567567567",
        "0793333333",
        "john",
        "123456"
    );

    const s4 = addStudent(
        "Lina Omar",
        "Female",
        "2004678678678",
        "0794444444",
        "lina",
        "123456"
    );

    const s5 = addStudent(
        "Mohammad Ahmad",
        "Male",
        "2005789789789",
        "0795555555",
        "mohammad",
        "123456"
    );

    /* Exams */

    const e1 = addExam(
        "Molecular Biology Quiz",
        "Biology",
        "2026-10-24",
        60,
        20,
        "active",
        teacher.id
    );

    const e2 = addExam(
        "Chemical Bonding Final",
        "Chemistry",
        "2026-10-27T11:30",
        90,
        25,
        "active",
        teacher.id
    );

    const e3 = addExam(
        "Cell Structure",
        "Biology",
        "2026-11-02T10:00",
        45,
        15,
        "inactive",
        teacher.id
    );

    /* Results */

    addResult(s1.id,e1.id,[],92,"A",true,"Excellent");
    addResult(s2.id,e1.id,[],87,"B+",true,"Good");
    addResult(s3.id,e1.id,[],78,"B",true,"");
    addResult(s4.id,e2.id,[],95,"A+",true,"Excellent");
    addResult(s5.id,e2.id,[],66,"C",true,"Needs improvement");

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

    return questions.map( question => {
        const studentAnswer = result.answers.find(a => a.questionId == question.id)?.studentAnswer;
        return{
        ...question , 
        "studentAnswer": studentAnswer,
        'isCorrect': studentAnswer === question.correctAnswer,}
    })
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
    {
      examTitle: "The Solar System",
      type: "mcq",
      text: "Which planet is closest to the Sun?",
      options: ["Earth", "Mercury", "Mars", "Jupiter"],
      correctAnswer: "Mercury",
      points: 10,
      order: 1
    },
    {
      examTitle: "The Solar System",
      type: "trueFalse",
      text: "The Sun is a star.",
      options: ["True", "False"],
      correctAnswer: "True",
      points: 10,
      order: 2
    },
    {
      examTitle: "The Solar System",
      type: "mcq",
      text: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Saturn", "Neptune"],
      correctAnswer: "Mars",
      points: 10,
      order: 3
    },
    {
      examTitle: "The Solar System",
      type: "shortAnswer",
      text: "How many planets are in the Solar System?",
      options: [],
      correctAnswer: "8",
      points: 10,
      order: 4
    },
    {
      examTitle: "The Solar System",
      type: "mcq",
      text: "Which planet has rings?",
      options: ["Mercury", "Earth", "Saturn", "Mars"],
      correctAnswer: "Saturn",
      points: 10,
      order: 5
    },

    {
      examTitle: "Human Body Basics",
      type: "mcq",
      text: "Which organ pumps blood?",
      options: ["Brain", "Heart", "Lungs", "Stomach"],
      correctAnswer: "Heart",
      points: 10,
      order: 1
    },
    {
      examTitle: "Human Body Basics",
      type: "trueFalse",
      text: "Humans have two lungs.",
      options: ["True", "False"],
      correctAnswer: "True",
      points: 10,
      order: 2
    },
    {
      examTitle: "Human Body Basics",
      type: "mcq",
      text: "Which organ helps us breathe?",
      options: ["Lungs", "Kidneys", "Skin", "Bones"],
      correctAnswer: "Lungs",
      points: 10,
      order: 3
    },
    {
      examTitle: "Human Body Basics",
      type: "shortAnswer",
      text: "How many chambers does the heart have?",
      options: [],
      correctAnswer: "4",
      points: 10,
      order: 4
    },
    {
      examTitle: "Human Body Basics",
      type: "mcq",
      text: "Which part protects the brain?",
      options: ["Ribs", "Skull", "Spine", "Muscles"],
      correctAnswer: "Skull",
      points: 10,
      order: 5
    },

    {
      examTitle: "Matter and Materials",
      type: "mcq",
      text: "Which is a state of matter?",
      options: ["Solid", "Light", "Sound", "Heat"],
      correctAnswer: "Solid",
      points: 10,
      order: 1
    },
    {
      examTitle: "Matter and Materials",
      type: "trueFalse",
      text: "Water can exist as a solid.",
      options: ["True", "False"],
      correctAnswer: "True",
      points: 10,
      order: 2
    },
    {
      examTitle: "Matter and Materials",
      type: "mcq",
      text: "Ice is an example of:",
      options: ["Gas", "Liquid", "Solid", "Plasma"],
      correctAnswer: "Solid",
      points: 10,
      order: 3
    },
    {
      examTitle: "Matter and Materials",
      type: "shortAnswer",
      text: "How many common states of matter are there?",
      options: [],
      correctAnswer: "3",
      points: 10,
      order: 4
    },
    {
      examTitle: "Matter and Materials",
      type: "mcq",
      text: "Steam is a:",
      options: ["Solid", "Liquid", "Gas", "Metal"],
      correctAnswer: "Gas",
      points: 10,
      order: 5
    },

    {
      examTitle: "Plants and Photosynthesis",
      type: "mcq",
      text: "Which part absorbs water?",
      options: ["Flower", "Roots", "Fruit", "Leaves"],
      correctAnswer: "Roots",
      points: 10,
      order: 1
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "trueFalse",
      text: "Plants need sunlight to make food.",
      options: ["True", "False"],
      correctAnswer: "True",
      points: 10,
      order: 2
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "mcq",
      text: "Photosynthesis mainly happens in:",
      options: ["Roots", "Stem", "Leaves", "Flowers"],
      correctAnswer: "Leaves",
      points: 10,
      order: 3
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "shortAnswer",
      text: "Which gas do plants absorb?",
      options: [],
      correctAnswer: "Carbon dioxide",
      points: 10,
      order: 4
    },
    {
      examTitle: "Plants and Photosynthesis",
      type: "mcq",
      text: "Which pigment makes leaves green?",
      options: ["Chlorophyll", "Oxygen", "Protein", "Calcium"],
      correctAnswer: "Chlorophyll",
      points: 10,
      order: 5
    }
  ];

  testExams.forEach(function (examData) {
    const existingExam = getExams().find(function (exam) {
      return exam.title === examData.title;
    });

    if (!existingExam) {
      addExam(
        examData.title,
        examData.subject,
        examData.dateTime,
        examData.duration,
        examData.numQuestions,
        examData.status,
        teacher.id
      );
    }
  });

  testQuestions.forEach(function (questionData) {
    const exam = getExams().find(function (storedExam) {
      return storedExam.title === questionData.examTitle;
    });

    if (!exam) {
      return;
    }

    const questionAlreadyExists =
      getQuestionsByExam(exam.id).some(function (storedQuestion) {
        return storedQuestion.text === questionData.text;
      });

    if (questionAlreadyExists) {
      return;
    }

    addQuestion(
      exam.id,
      questionData.type,
      questionData.text,
      questionData.options,
      questionData.correctAnswer,
      questionData.points,
      questionData.order
    );
  });
}

seedAvailableExamsTestData();