/* ============================================================
   dashboard.js
   Renders the stat cards and the "Coming up" deadline strip.
   ============================================================ */

(function () {
  "use strict";

  App.renderStats = function () {
    var tasks = App.tasks;
    var pending = tasks.filter(function (t) { return t.status !== "Completed"; }).length;
    var completed = tasks.filter(function (t) { return t.status === "Completed"; }).length;
    var high = tasks.filter(function (t) { return t.priority === "High" && t.status !== "Completed"; }).length;
    var upcoming = tasks.filter(function (t) { return t.status !== "Completed" && App.daysUntil(t.deadline) <= 3; }).length;
    document.getElementById("stat-courses").textContent = App.courses.length;
    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-completed").textContent = completed;
    document.getElementById("stat-high").textContent = high;
    document.getElementById("stat-upcoming").textContent = upcoming;
  };

  App.renderDeadlineStrip = function () {
    var wrap = document.getElementById("deadline-strip-wrap");
    var upcoming = App.tasks
      .filter(function (t) { return t.status !== "Completed"; })
      .sort(function (a, b) { return App.daysUntil(a.deadline) - App.daysUntil(b.deadline); })
      .slice(0, 6);

    if (upcoming.length === 0) {
      wrap.innerHTML = '<div class="empty-state">Nothing due. Add a task to get started.</div>';
      return;
    }

    var priorityColor = { High: "#E8604C", Medium: "#E0A94E", Low: "#6B9080" };
    var html = '<div class="deadline-strip">';
    upcoming.forEach(function (t) {
      var overdue = App.daysUntil(t.deadline) < 0;
      var dotColor = overdue ? "#1B2340" : priorityColor[t.priority];
      var c = App.courseById(t.course);
      html += '<div class="deadline-item">' +
        '<div class="deadline-dot" style="background:' + dotColor + '"></div>' +
        '<div class="deadline-card">' +
          '<div class="deadline-tag" style="color:' + dotColor + '">' + App.deadlineLabel(t.deadline) + '</div>' +
          '<div class="deadline-title">' + App.escapeHtml(t.title) + '</div>' +
          '<div class="deadline-course">' + (c ? c.code : "") + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    wrap.innerHTML = html;
  };
})();
