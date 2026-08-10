/* ============================================================
   tasks.js
   Renders the task list (with search + filters), handles status
   cycling and deletion, and the "New task" modal.
   ============================================================ */

(function () {
  "use strict";

  App.renderTasks = function () {
    var search = document.getElementById("task-search").value.toLowerCase();
    var fp = document.getElementById("filter-priority").value;
    var fs = document.getElementById("filter-status").value;

    var filtered = App.tasks
      .filter(function (t) { return t.title.toLowerCase().indexOf(search) !== -1; })
      .filter(function (t) { return fp === "All" || t.priority === fp; })
      .filter(function (t) { return fs === "All" || t.status === fs; })
      .sort(function (a, b) { return App.daysUntil(a.deadline) - App.daysUntil(b.deadline); });

    document.getElementById("task-count-sub").textContent = App.tasks.length + " total · click status to update";

    var list = document.getElementById("task-list");
    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state">No tasks match your filters.</div>';
      return;
    }

    list.innerHTML = filtered.map(function (t) {
      var c = App.courseById(t.course);
      var overdue = App.daysUntil(t.deadline) < 0 && t.status !== "Completed";
      var statusClass = "status-" + t.status.replace(" ", "-");
      return '<div class="task-row">' +
        '<button class="status-pill ' + statusClass + '" data-task-id="' + t.id + '">' + t.status + '</button>' +
        '<div class="task-main">' +
          '<div class="task-title' + (t.status === "Completed" ? " done" : "") + '">' + App.escapeHtml(t.title) + '</div>' +
          '<div class="task-course">' + (c ? c.code : "No course") + '</div>' +
        '</div>' +
        '<span class="priority-tag prio-' + t.priority + '">' + t.priority + '</span>' +
        '<span class="task-deadline' + (overdue ? " overdue" : "") + '">' + App.deadlineLabel(t.deadline) + '</span>' +
        '<button class="task-del" data-del-id="' + t.id + '">🗑</button>' +
      '</div>';
    }).join("");

    list.querySelectorAll(".status-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-task-id");
        var task = App.tasks.find(function (t) { return t.id === id; });
        var idx = App.STATUS_ORDER.indexOf(task.status);
        task.status = App.STATUS_ORDER[(idx + 1) % App.STATUS_ORDER.length];
        App.saveUserData();
        App.renderAll();
      });
    });
    list.querySelectorAll(".task-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-del-id");
        App.tasks = App.tasks.filter(function (t) { return t.id !== id; });
        App.saveUserData();
        App.renderAll();
      });
    });
  };

  ["task-search", "filter-priority", "filter-status"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", App.renderTasks);
    document.getElementById(id).addEventListener("change", App.renderTasks);
  });

  /* Task modal */
  document.getElementById("open-task-form").addEventListener("click", function () {
    var sel = document.getElementById("task-course");
    sel.innerHTML = App.courses.map(function (c) {
      return '<option value="' + c.id + '">' + c.code + ' — ' + App.escapeHtml(c.name) + '</option>';
    }).join("");
    document.getElementById("task-deadline").value = App.inDays(3);
    document.getElementById("task-title").value = "";
    App.openModal("task-modal");
  });
  document.getElementById("task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = document.getElementById("task-title").value.trim();
    if (!title) return;
    App.tasks.push({
      id: App.uid("t"),
      title: title,
      course: document.getElementById("task-course").value,
      priority: document.getElementById("task-priority").value,
      status: "Pending",
      deadline: document.getElementById("task-deadline").value
    });
    App.saveUserData();
    App.closeModal("task-modal");
    App.renderAll();
  });
})();
