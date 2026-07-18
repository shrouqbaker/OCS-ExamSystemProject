document.addEventListener("DOMContentLoaded", () => {

    requireRole("teacher");

    const current = getCurrent("currentUser");
    const teacher = getUserById(current.id);

    const students = getStudents();

    const tbody = document.getElementById("studentsTableBody");
    const pagination = document.getElementById("pagination");
    const studentsCount = document.getElementById("studentsCount");

    const pageSize = 5;
    let currentPage = 1;

    renderPage(currentPage);

    function renderPage(page) {

        tbody.innerHTML = "";

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const pageStudents = students.slice(start, end);

        pageStudents.forEach(student => {

            const initials = student.fullName
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

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
            `Showing ${start + 1} - ${Math.min(end, students.length)} of ${students.length} students`;

        renderPagination();

    }

    function renderPagination() {

        pagination.innerHTML = "";

        const pages = Math.ceil(students.length / pageSize);

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

    tbody.addEventListener("click", e => {

        if (!e.target.classList.contains("btn-view")) return;

        const id = e.target.dataset.id;

        sessionStorage.setItem("selectedStudent", id);

        // لاحقًا عند إنشاء صفحة التفاصيل
        // window.location.href = "student-details.html";

        console.log(getUserById(id));

    });

    /* ==========================
       Add Student
    =========================== */

    document.getElementById("addStudentBtn")
        .addEventListener("click", () => {

            // عدل الرابط حسب مشروعك

            window.location.href = "add-student.html";

        });

});