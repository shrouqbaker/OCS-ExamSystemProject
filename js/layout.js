document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const topbar = document.getElementById("topbar");

  const role = document.body.dataset.role;
  const currentPage = document.body.dataset.page;
  const pageTitles = {
    student: {
      dashboard: "Dashboard",
      exams: "Available Exams",
      history: "Exam History",
      profile: "Profile"
    },

    teacher: {
      dashboard: "Dashboard",
      students: "Students",
      exams: "Exams",
      results: "Results",
      profile: "Profile"
    }
  };


  if (sidebar && role === "student") {
    sidebar.innerHTML = `
      <div class="offcanvas-header d-lg-none">
        <h2 class="offcanvas-title">ScienceNest</h2>

        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div class="offcanvas-body p-0">
        <div class="sidebar-content student-sidebar">

          <a href="dashboard.html" class="sidebar-logo">
            <span class="logo-icon">
              <i class="bi bi-rocket-takeoff-fill"></i>
            </span>

            <span>ScienceNest</span>
          </a>

          <nav class="sidebar-nav">

            <a
              href="dashboard.html"
              class="sidebar-link ${currentPage === "dashboard" ? "active" : ""}"
            >
              <i class="bi bi-grid-fill"></i>
              <span>Dashboard</span>
            </a>

            <a
              href="exams.html"
              class="sidebar-link ${currentPage === "exams" ? "active" : ""}"
            >
              <i class="bi bi-clipboard2-check-fill"></i>
              <span>Available Exams</span>
            </a>

           

            <a
              href="history.html"
              class="sidebar-link ${currentPage === "history" ? "active" : ""}"
            >
              <i class="bi bi-clock-history"></i>
              <span>Exam History</span>
            </a>

          </nav>

          <div class="sidebar-bottom">

            <a
              href="profile.html"
              class="sidebar-link ${currentPage === "profile" ? "active" : ""}"
            >
              <i class="bi bi-person"></i>
              <span>Profile</span>
            </a>

            <a href="../login.html" class="sidebar-link logout-link">
              <i class="bi bi-box-arrow-left"></i>
              <span>Logout</span>
            </a>

          </div>

        </div>
      </div>
    `;
  }
  else if (sidebar && role === "teacher") {

    sidebar.innerHTML = `
      <div class="offcanvas-header d-lg-none">
        <h2 class="offcanvas-title">ScienceNest</h2>

        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close">
        </button>
      </div>

      <div class="offcanvas-body p-0">

        <div class="sidebar-content teacher-sidebar">

          <a href="dashboard.html" class="sidebar-logo">

            <span class="logo-icon">
              <i class="bi bi-rocket-takeoff-fill"></i>
            </span>

            <span>ScienceNest</span>

          </a>

          <nav class="sidebar-nav">

            <a
              href="dashboard.html"
              class="sidebar-link ${currentPage === "dashboard" ? "active" : ""}">
              <i class="bi bi-grid-fill"></i>
              <span>Dashboard</span>
            </a>

            <a
              href="students.html"
              class="sidebar-link ${currentPage === "students" ? "active" : ""}">
              <i class="bi bi-people"></i>
              <span>Students</span>
            </a>

            <a
              href="exams.html"
              class="sidebar-link ${currentPage === "exams" ? "active" : ""}">
              <i class="bi bi-clipboard2-check-fill"></i>
              <span>Exams</span>
            </a>

            <a
              href="results.html"
              class="sidebar-link ${currentPage === "results" ? "active" : ""}">
              <i class="bi bi-bar-chart"></i>
              <span>Results</span>
            </a>

          </nav>

          <div class="sidebar-bottom">

            <a
              href="profile.html"
              class="sidebar-link ${currentPage === "profile" ? "active" : ""}">
              <i class="bi bi-person"></i>
              <span>Profile</span>
            </a>

            <a href="../login.html" class="sidebar-link logout-link">
              <i class="bi bi-box-arrow-left"></i>
              <span>Logout</span>
            </a>

          </div>

        </div>

      </div>
    `;
  };

  if (topbar) {
    topbar.innerHTML = `
      <div class="dashboard-topbar">

        <div class="dashboard-topbar__left">

          <button
            class="mobile-menu-button d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
            aria-controls="sidebar"
          >
            <i class="bi bi-list"></i>
          </button>

          <h1 class="dashboard-topbar__title">
              ${pageTitles[role]?.[currentPage] || "ScienceNest"}
          </h1>

        </div>

        <button
          class="dashboard-topbar__notification"
          aria-label="Notifications"
        >
          <i class="bi bi-bell"></i>
        </button>

      </div>
    `;
  }
});