document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const error =
            document.getElementById("loginError");

        error.textContent = "";

        const success = login(username, password);

        if (!success) {

            error.textContent =
                "Invalid username or password.";

            return;
        }

        const current = getCurrent("currentUser");

        if (current.role === "teacher") {

            window.location.href =
                "teacher/dashboard.html";

        } else {

            window.location.href =
                "student/dashboard.html";

        }

    });

});