document.addEventListener("DOMContentLoaded", () => {

    requireRole("teacher");

    const current = getCurrent("currentUser");
    const teacher = getUserById(current.id);

    let students = getStudents();
    let filteredStudents = [...students];

    const searchInput = document.getElementById("searchStudent");

    const tbody = document.getElementById("studentsTableBody");
    const pagination = document.getElementById("pagination");
    const studentsCount = document.getElementById("studentsCount");
    const studentModal = document.getElementById("studentModal");
    const closeModal = document.getElementById("closeModal");
    const deleteStudentBtn = document.getElementById("deleteStudentBtn");
    let selectedStudentId = null;

    const modalName = document.getElementById("modalName");
    const modalFullName = document.getElementById("modalFullName");
    const modalGender = document.getElementById("modalGender");
    const modalNationalId = document.getElementById("modalNationalId");
    const modalPhone = document.getElementById("modalPhone");
    const modalUsername = document.getElementById("modalUsername");
    const modalPassword = document.getElementById("modalPassword");
    const studentAvatar = document.getElementById("studentAvatar");

    const pageSize = 5;
    let currentPage = 1;

    renderPage(currentPage);

    function renderPage(page) {

        tbody.innerHTML = "";

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const pageStudents = filteredStudents.slice(start, end);

        pageStudents.forEach(student => {

            const initials = student.fullName
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
            console.log(student.id);

            tbody.innerHTML += `
                <tr>

                    <td>

                        <div class="student-cell">

                            <div class="student-avatar">

                                ${initials}

                            </div>

                            <span>${student.fullName}</span>

                        </div>

                    </td>

                    <td>${student.gender}</td>

                    <td>${student.nationalId}</td>

                    <td>${student.username}</td>

                    <td class="text-end">

                        <button
                            class="btn-view"
                            data-id="${student.id}"
                        >
                            View More
                        </button>

                    </td>

                </tr>
            `;

        });

        studentsCount.textContent =
            `Showing ${filteredStudents.length === 0 ? 0 : start + 1} - ${Math.min(end, filteredStudents.length)} of ${filteredStudents.length} students`;
        renderPagination();

    }

    function renderPagination() {

        pagination.innerHTML = "";

        const pages = Math.ceil(filteredStudents.length / pageSize);
        /* Previous */

        const prev = document.createElement("button");

        prev.className = "page-btn";

        prev.innerHTML = `<i class="bi bi-chevron-left"></i>`;

        prev.disabled = currentPage === 1;

        prev.onclick = () => {

            currentPage--;

            renderPage(currentPage);

        };

        pagination.appendChild(prev);

        /* Numbers */

        for (let i = 1; i <= pages; i++) {

            const btn = document.createElement("button");

            btn.className = "page-btn";

            if (i === currentPage)
                btn.classList.add("active");

            btn.textContent = i;

            btn.onclick = () => {

                currentPage = i;

                renderPage(currentPage);

            };

            pagination.appendChild(btn);

        }

        /* Next */

        const next = document.createElement("button");

        next.className = "page-btn";

        next.innerHTML = `<i class="bi bi-chevron-right"></i>`;

        next.disabled = currentPage === pages;

        next.onclick = () => {

            currentPage++;

            renderPage(currentPage);

        };

        pagination.appendChild(next);

    }

    /* ==========================
       View Student
    =========================== */
    tbody.addEventListener("click", (e) => {

        const button = e.target.closest(".btn-view");

        if (!button) return;

        const id = button.dataset.id;
        console.log("ID:", id);

        const student = getUserById(id);

        console.log(student);

        if (!student) {
            console.error("Student not found");
            return;
        }

        openStudentModal(student);

    });

    /* ==========================
       Add Student
    =========================== */

    document.getElementById("addStudentBtn")
        .addEventListener("click", () => {
            window.location.href = "add-student.html";

        });
    searchInput.addEventListener("input", function () {

        const keyword = this.value.trim().toLowerCase();

        filteredStudents = students.filter(student =>

            student.fullName.toLowerCase().includes(keyword) ||

            student.username.toLowerCase().includes(keyword) ||

            student.nationalId.includes(keyword)

        );

        currentPage = 1;

        renderPage(currentPage);

    });
    deleteStudentBtn.addEventListener("click", () => {

        Swal.fire({
            title: "Delete Student?",
            text: "This action cannot be undone.",
            icon: "warning",
            target: document.body,

            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel"
        }).then((result) => {

            if (!result.isConfirmed) return;

            const success = deleteStudent(selectedStudentId);

            if (!success) {

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to delete student."
                });

                return;
            }

            studentModal.classList.remove("show");

            students = getStudents();
            filteredStudents = [...students];

            if (currentPage > Math.ceil(filteredStudents.length / pageSize)) {
                currentPage = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
            }

            renderPage(currentPage);

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Student deleted successfully.",
                timer: 1800,
                showConfirmButton: false
            });

        });

    });
    function openStudentModal(student) {
        selectedStudentId = student.id;

        modalName.textContent = student.fullName;

        modalFullName.textContent = student.fullName;
        modalGender.textContent = student.gender;
        modalNationalId.textContent = student.nationalId;
        modalPhone.textContent = student.phone;
        modalUsername.textContent = student.username;
        modalPassword.textContent = student.password;

        const names = student.fullName.trim().split(" ");

        let initials = names[0][0];

        if (names.length > 1) {
            initials += names[1][0];
        }

        studentAvatar.textContent = initials.toUpperCase();

        studentModal.classList.add("show");
    }
    closeModal.addEventListener("click", () => {

        studentModal.classList.remove("show");

    });

    studentModal.addEventListener("click", (e) => {

        if (e.target === studentModal) {

            studentModal.classList.remove("show");

        }

    });

});

