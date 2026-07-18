document.addEventListener("DOMContentLoaded", () => {

    requireRole("teacher");

    const form = document.getElementById("studentForm");

    const fullName = document.getElementById("fullName");
    const nationalId = document.getElementById("nationalId");
    const gender = document.getElementById("gender");
    const phone = document.getElementById("phone");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    /* ==========================
       Validation Helpers
    ========================== */

    function setValid(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }

    function setInvalid(input) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
    }

    function validateField(field) {

        switch (field.id) {

            case "fullName":

                if (field.value.trim().length < 3 && field.value.trim().length!=0 ) {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

            case "nationalId":

                if (!/^\d{10}$/.test(field.value.trim()) && field.value.trim().length!=0) {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

            case "gender":

                if (field.value === "") {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

            case "phone":

                if (!/^07[789]\d{7}$/.test(field.value.trim())&& field.value.trim().length!=0) {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

            case "username":

                if (field.value.trim().length < 4 && field.value.trim().length!=0) {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

            case "password":

                if (field.value.length < 6 && field.value.trim().length!=0) {

                    setInvalid(field);
                    return false;

                }

                setValid(field);
                return true;

        }

        return true;
    }

    function validateForm() {

        let valid = true;

        valid = validateField(fullName) && valid;
        valid = validateField(nationalId) && valid;
        valid = validateField(gender) && valid;
        valid = validateField(phone) && valid;
        valid = validateField(username) && valid;
        valid = validateField(password) && valid;

        return valid;
    }

    /* ==========================
       Live Validation
    ========================== */

    fullName.addEventListener("input", () => validateField(fullName));

    nationalId.addEventListener("input", () => validateField(nationalId));

    gender.addEventListener("change", () => validateField(gender));

    phone.addEventListener("input", () => validateField(phone));

    username.addEventListener("input", () => validateField(username));

    password.addEventListener("input", () => validateField(password));

    /* ==========================
       Cancel
    ========================== */

    document.getElementById("cancelBtn").addEventListener("click", () => {

        window.location.href = "students.html";

    });

    /* ==========================
       Submit
    ========================== */

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        if (!validateForm()) {

            alert("Please correct the highlighted fields.");

            return;

        }

        if (isUsernameTaken(username.value.trim())) {

            setInvalid(username);

            alert("Username already exists.");

            return;

        }

        const student = addStudent(

            fullName.value.trim(),
            gender.value,
            nationalId.value.trim(),
            phone.value.trim(),
            username.value.trim(),
            password.value

        );

        if (!student) {

            alert("Unable to add student.");

            return;

        }

        alert("Student enrolled successfully!");

        form.reset();

        document.querySelectorAll(".is-valid, .is-invalid").forEach(input => {

            input.classList.remove("is-valid");
            input.classList.remove("is-invalid");

        });

        window.location.href = "students.html";

    });

});