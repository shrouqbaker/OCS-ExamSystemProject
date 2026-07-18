document.addEventListener("DOMContentLoaded", () => {

    requireRole("teacher");

    const current = getCurrent("currentUser");

    const teacher = getUserById(current.id);

    document.getElementById("teacherName").textContent =
        teacher.fullName;

    document.getElementById("fullName").textContent =
        teacher.fullName;

    document.getElementById("username").textContent =
        teacher.username;

    document.getElementById("phone").textContent =
        teacher.phone;

    document.getElementById("experience").textContent =
        teacher.yearsOfExp + " Years";

    document.getElementById("about").textContent =
        teacher.about || "No description available.";

    /* Avatar */

    const initials = teacher.fullName
        .split(" ")
        .map(word => word[0])
        .join("")
        .substring(0,2)
        .toUpperCase();

    document.getElementById("profileAvatar").textContent =
        initials;

});