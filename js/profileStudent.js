document.addEventListener("DOMContentLoaded", () => {

    requireRole("student");

    const current = getCurrent("currentUser");

    const student = getUserById(current.id);

    if (!student) return;
    document.getElementById("studentImage").src =
        student.gender === "Female" ? "../assets/images/female.jpg" : "../assets/images/male.jpg";

    //================ Student Information ================

    document.getElementById("studentName").textContent = student.fullName;

    document.getElementById("studentNationalId").textContent = student.nationalId;

    document.getElementById("studentUsername").textContent = student.username;

    document.getElementById("studentPhone").textContent = student.phone;

    document.getElementById("studentGender").textContent = student.gender;

    //================ Statistics ================

    const results = getResultsByStudent(student.id);

    document.getElementById("completedExams").textContent = results.length;

    let average = 0;

    if (results.length > 0) {

        const total = results.reduce((sum, item) => sum + item.score, 0);

        average = Math.round(total / results.length);

    }

    document.getElementById("averageScore").textContent =
        average + "%";

});