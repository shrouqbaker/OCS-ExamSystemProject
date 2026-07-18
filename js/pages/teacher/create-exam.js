const list = document.getElementById("questionsList")
const pbtn = document.getElementById("publishExamBtn")
let questionCount = 1

list.addEventListener("click", function(event) {
    const deleteBtn = event.target.closest(".question-card__delete");
    if (deleteBtn) {
        questionCount--
        deleteBtn.closest(".question-card").remove();
        return;
    }

    const tfBtn = event.target.closest(".question-card__tf-btn");
    if (tfBtn) {
        const group = tfBtn.closest(".question-card__truefalse");
        const hiddenInput = tfBtn.closest("form").querySelector('input[name="correct"]');

        group.querySelectorAll(".question-card__tf-btn").forEach(b => b.classList.remove("question-card__tf-btn--active"));
        tfBtn.classList.add("question-card__tf-btn--active");
        hiddenInput.value = tfBtn.dataset.value;
    }
});


document.addEventListener("DOMContentLoaded", function () {
    cardQuestion()
    requireRole('teacher')
    
});

pbtn.addEventListener("click",function(){
    const basicForm = document.getElementById("basicDetailsForm");
    const basicData = new FormData(basicForm);

    if (!basicData.get("title") || basicData.get("title").trim() === "") {
        alert("Please enter an exam title before publishing.");
        return;
    }

    const forms = document.querySelectorAll("form")
    let exam
    let count = 1
    forms.forEach(element => {
        const data = new FormData(element);

        if(element.id === "basicDetailsForm") {
            exam = addExam(data.get("title"),"Science",data.get("date"),data.get("duration"),questionCount-1,data.get("status")?"active":"inactive",getCurrent("currentUser").id)
        }
        else if (element.dataset.type === "mcq" || element.dataset.type === "multiAnswer"){
            const opt=element.querySelectorAll(".question-card__option")
            const options=[]
            opt.forEach(element => {
                const value = element.querySelector('input[type="radio"], input[type="checkbox"]').value;
                const text = element.querySelector('.question-card__option-input').value;
                options.push({[value]: text});
            });

            let correctAnswer;
            if (element.dataset.type === "multiAnswer") {
                correctAnswer = data.getAll("correct");
            } else {
                correctAnswer = data.get("correct");
            }

            addQuestion(exam.id, element.dataset.type, data.get("text"), options, correctAnswer, Number(data.get("points")), count++)
        }
        else if (element.dataset.type === "trueFalse") {
            addQuestion(exam.id, element.dataset.type, data.get("text"), [], data.get("correct") === "true", Number(data.get("points")), count++)
        }
        else if (element.dataset.type === "shortAnswer") {
            addQuestion(exam.id, element.dataset.type, data.get("text"), [], Number(data.get("correct")), Number(data.get("points")), count++)
        }
    });

    window.location.href = "exams.html";
})


login("dr.ahmad","password123")

function cardQuestion(){
const modal=document.getElementById("questionTypeModal")
    const qTypes = modal.querySelectorAll("button")
    
    qTypes.forEach(element => {
        element.addEventListener("click",function (){
            if(element.id === "mcp")
                mcpQuestion()
            if(element.id === "ma")
                maQuestion()
            if(element.id === "tf")
                tfQuestion()
            if(element.id === "num")
                numQuestion()
            questionCount++
        })
    });
}
function mcpQuestion(){
    const div = document.createElement("div")
    div.innerHTML=`<form class="question-card question-card--purple" data-type="mcq">
  <div class="question-card__header">
    <div class="question-card__type">
      <i class="fa-solid fa-circle-dot icon"></i>
      <div>
        <span class="question-card__type-label">Multiple Choice</span>
        <span class="question-card__number">Question ${questionCount}</span>
      </div>
    </div>
    <button type="button" class="question-card__delete" aria-label="Delete question">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>

  <input type="text" name="text" placeholder="Enter your question here..." class="inp w-100 question-card__text">

  <div class="row g-3 question-card__options">
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="radio" name="correct" value="o1">
        <input type="text" class="question-card__option-input" placeholder="Option A">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="radio" name="correct" value="o2">
        <input type="text" class="question-card__option-input" placeholder="Option B">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="radio" name="correct" value="o3">
        <input type="text" class="question-card__option-input" placeholder="Option C">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="radio" name="correct" value="o4">
        <input type="text" class="question-card__option-input" placeholder="Option D">
      </label>
    </div>
  </div>

  <label>Question Weight</label>
  <input type="number" name="points" placeholder="Enter your question Points..." class="inp w-100">
</form>`
    list.appendChild(div.firstElementChild)
}

function maQuestion(){
const div = document.createElement("div")
    div.innerHTML=`<form class="question-card question-card--red" data-type="multiAnswer">
  <div class="question-card__header">
    <div class="question-card__type">
      <i class="fa-solid fa-square-check icon"></i>
      <div>
        <span class="question-card__type-label">Multiple Answers</span>
        <span class="question-card__number">Question ${questionCount}</span>
      </div>
    </div>
    <button type="button" class="question-card__delete" aria-label="Delete question">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>

  <input type="text" name="text" placeholder="Enter your question here..." class="inp w-100 question-card__text">

  <div class="row g-3 question-card__options">
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="checkbox" name="correct" value="o1">
        <input type="text" class="question-card__option-input" placeholder="Option A">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="checkbox" name="correct" value="o2">
        <input type="text" class="question-card__option-input" placeholder="Option B">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="checkbox" name="correct" value="o3">
        <input type="text" class="question-card__option-input" placeholder="Option C">
      </label>
    </div>
    <div class="col-md-6">
      <label class="question-card__option">
        <input type="checkbox" name="correct" value="o4">
        <input type="text" class="question-card__option-input" placeholder="Option D">
      </label>
    </div>
  </div>

  <label>Question Weight</label>
  <input type="number" name="points" placeholder="Enter your question Points..." class="inp w-100">
</form>`
    list.appendChild(div.firstElementChild)
}
function tfQuestion(){
const div = document.createElement("div")
    div.innerHTML=`<form class="question-card question-card--green" data-type="trueFalse">
  <div class="question-card__header">
    <div class="question-card__type">
      <span class="toggle toggle--small">
        <input type="checkbox" checked disabled>
        <span class="toggle__track"></span>
      </span>
      <div>
        <span class="question-card__type-label">True or False</span>
        <span class="question-card__number">Question ${questionCount}</span>
      </div>
    </div>
    <button type="button" class="question-card__delete" aria-label="Delete question">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>

  <input type="text" name="text" placeholder="Enter your statement here..." class="inp w-100 question-card__text">

  <div class="question-card__truefalse">
    <button type="button" class="question-card__tf-btn question-card__tf-btn--active" data-value="true">TRUE</button>
    <button type="button" class="question-card__tf-btn" data-value="false">FALSE</button>
  </div>
  <input type="hidden" name="correct" value="true">

  <label>Question Weight</label>
  <input type="number" name="points" placeholder="Enter your question Points..." class="inp w-100">
</form>`
    list.appendChild(div.firstElementChild)
}
function numQuestion(){
const div = document.createElement("div")
    div.innerHTML=`<form class="question-card question-card--gray" data-type="shortAnswer">
  <div class="question-card__header">
    <div class="question-card__type">
      <span class="question-card__numeric-icon">123</span>
      <div>
        <span class="question-card__type-label">Numeric Entry</span>
        <span class="question-card__number">Question ${questionCount}</span>
      </div>
    </div>
    <button type="button" class="question-card__delete" aria-label="Delete question">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>

  <input type="text" name="text" placeholder="Enter your question here..." class="inp w-100 question-card__text">

  <label>Answer</label>
  <input type="number" name="correct" placeholder="0.00" class="inp w-100 question-card__answer">

  <label>Question Weight</label>
  <input type="number" name="points" placeholder="Enter your question Points..." class="inp w-100">
</form>`
    list.appendChild(div.firstElementChild)
}