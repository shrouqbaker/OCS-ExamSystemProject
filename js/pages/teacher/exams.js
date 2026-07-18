

login("dr.ahmad","password123")

document.addEventListener("DOMContentLoaded", function () {
  loadExams();

  const toggle = document.querySelectorAll(".tog")
    toggle.forEach(element => {
        element.addEventListener("change",function(){
            console.log(element.dataset.id,element.checked);
            
            updateExamStatus(element.dataset.id,element.checked?"active":"inactive")
        })
    });
});


function loadExams(){
    requireRole('teacher')

    const id = getCurrent("currentUser").id
    const exams = getExamsByTeacher(id)
    const list = document.getElementById("examsList")

    console.log(exams);

    exams.forEach(element => {
        const container = document.createElement("div")
        container.className="col-lg-4 col-md-6 col-12"
        card(container,element.title,element.dateTime ,element.status , element.id)
        list.appendChild(container)

    });
    
    
}

function card(container1 , title,dateTime , status , id){
    const container = document.createElement("div")
    const top = document.createElement("div")
    const icon = document.createElement("i")
    const label = document.createElement("label")
    const toggle = document.createElement("input")
    const span = document.createElement("span")
    const titled = document.createElement("h3")
    const close_container = document.createElement("div")
    const close_title = document.createElement("p")
    const date = document.createElement("p")
    const btn = document.createElement("a")

    icon.classList.add("exam-card__icon")
    icon.classList.add("fa-solid")
    icon.classList.add("fa-flask")
    toggle.className="tog"
    toggle.type = "checkbox";
    toggle.checked = status === "active"
    toggle.dataset.id=id
    top.className="exam-card__header"
    label.className="toggle"
    span.className="toggle__track"
    container.className="exam-card"
    
    btn.className="btn--secondary"
    btn.innerHTML="View Results"
    btn.href = `results.html?examId=${id}`
    titled.className="exam-card__title"
    titled.innerHTML=`${title}`
    close_container.className="exam-card__closing"
    close_title.className="exam-card__closing-label"
    close_title.innerHTML=`CLOSING`
    date.className="exam-card__closing-date"
    date.innerHTML=formatExamDate(dateTime)
    
    label.appendChild(toggle)
    label.appendChild(span)
    top.appendChild(icon)
    top.appendChild(label)
    container.append(top)

    close_container.appendChild(close_title)
    close_container.appendChild(date)
    container.appendChild(titled)
    container.appendChild(close_container)
    container.appendChild(btn)
    container1.appendChild(container)

}


function formatExamDate(dateTimeString) {
    const examDate = new Date(dateTimeString);

    const closingDate = new Date(examDate);
    closingDate.setHours(closingDate.getHours() + 24);

    const now = new Date();

    const isToday = closingDate.toDateString() === now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = closingDate.toDateString() === tomorrow.toDateString();

    const time = closingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;

    return closingDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`;
}