/* ============================================================
   tasks.js
   Renders the task list (with search + filters), handles status
   cycling and deletion, and the "New task" modal.
   ============================================================ */

(function () {
  "use strict";
  var activeAssignmentId = null;

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
          '<div class="task-course">' + (c ? App.escapeHtml(c.code) : "No course") + ' · ' + t.progress + '% complete</div>' +
          '<input class="progress-slider" type="range" min="0" max="100" step="5" value="' + t.progress + '" aria-label="Progress for ' + App.escapeHtml(t.title) + '" data-progress-id="' + t.id + '">' +
        '</div>' +
        '<span class="priority-tag prio-' + t.priority + '">' + t.priority + '</span>' +
        '<span class="task-deadline' + (overdue ? " overdue" : "") + '">' + App.deadlineLabel(t.deadline) + '</span>' +
        '<button class="task-action" data-submit-id="' + t.id + '">Submit</button>' +
        '<button class="task-action" data-remind-id="' + t.id + '">Remind</button>' +
        '<button class="task-del" data-del-id="' + t.id + '">🗑</button>' +
      '</div>';
    }).join("");

    list.querySelectorAll(".status-pill").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-task-id");
        var task = App.tasks.find(function (t) { return t.id === id; });
        var idx = App.STATUS_ORDER.indexOf(task.status);
        var nextStatus = App.STATUS_ORDER[(idx + 1) % App.STATUS_ORDER.length];
        try {
          await App.apiRequest("/assignments/" + id, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus })
          });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to update task status.");
        }
      });
    });
    list.querySelectorAll(".task-del").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-del-id");
        try {
          await App.apiRequest("/assignments/" + id, { method: "DELETE" });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to delete task.");
        }
      });
    });
    list.querySelectorAll(".progress-slider").forEach(function (slider) {
      slider.addEventListener("change", async function () {
        try {
          await App.apiRequest("/assignments/" + slider.dataset.progressId, {
            method: "PATCH",
            body: JSON.stringify({ progress: Number(slider.value) })
          });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to update progress.");
        }
      });
    });
    list.querySelectorAll("[data-submit-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeAssignmentId = btn.dataset.submitId;
        var task = App.tasks.find(function (item) { return item.id === activeAssignmentId; });
        document.getElementById("submission-assignment-title").textContent = task.title;
        document.getElementById("submission-url").value = "";
        document.getElementById("submission-text").value = "";
        App.openModal("submission-modal");
      });
    });
    list.querySelectorAll("[data-remind-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeAssignmentId = btn.dataset.remindId;
        var task = App.tasks.find(function (item) { return item.id === activeAssignmentId; });
        document.getElementById("reminder-assignment-title").textContent = task.title;
        var remindAt = new Date(Date.now() + 60 * 60 * 1000);
        remindAt.setMinutes(remindAt.getMinutes() - remindAt.getTimezoneOffset());
        document.getElementById("reminder-time").value = remindAt.toISOString().slice(0, 16);
        var minimum = new Date(Date.now() + 60 * 1000);
        minimum.setMinutes(minimum.getMinutes() - minimum.getTimezoneOffset());
        document.getElementById("reminder-time").min = minimum.toISOString().slice(0, 16);
        App.openModal("reminder-modal");
      });
    });
  };

  App.renderReminders = function () {
    var list = document.getElementById("reminder-list");
    var reminders = App.reminders || [];
    if (!reminders.length) {
      list.innerHTML = '<div class="empty-state">No reminders scheduled.</div>';
      return;
    }
    list.innerHTML = reminders.map(function (reminder) {
      var assignmentTitle = reminder.assignment && reminder.assignment.title || "Assignment";
      return '<div class="reminder-row' + (reminder.readAt ? " reminder-read" : "") + '">' +
        '<div class="reminder-content"><strong>' + App.escapeHtml(assignmentTitle) + '</strong>' +
        '<span>' + App.escapeHtml(reminder.message || "Assignment deadline approaching") + '</span>' +
        '<small>' + new Date(reminder.remindAt).toLocaleString() + (reminder.sentAt ? " · Sent" : " · Scheduled") + '</small></div>' +
        (reminder.readAt ? '<span class="reminder-done">Read</span>' : '<button class="task-action" data-read-reminder="' + reminder._id + '">Mark read</button>') +
        '<button class="task-del" data-delete-reminder="' + reminder._id + '" aria-label="Delete reminder">×</button></div>';
    }).join("");
    list.querySelectorAll("[data-read-reminder]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        try {
          await App.apiRequest("/reminders/" + btn.dataset.readReminder + "/read", { method: "PATCH" });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to mark reminder as read.");
        }
      });
    });
    list.querySelectorAll("[data-delete-reminder]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        try {
          await App.apiRequest("/reminders/" + btn.dataset.deleteReminder, { method: "DELETE" });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to delete reminder.");
        }
      });
    });
  };

  document.getElementById("submission-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var fileUrl = document.getElementById("submission-url").value.trim();
    var text = document.getElementById("submission-text").value.trim();
    if (!fileUrl && !text) {
      alert("Enter a submission URL or text before submitting.");
      return;
    }
    try {
      await App.apiRequest("/assignments/" + activeAssignmentId + "/submissions", {
        method: "POST",
        body: JSON.stringify({ fileUrl: fileUrl, text: text })
      });
      await App.loadUserData();
      App.closeModal("submission-modal");
      App.renderAll();
    } catch (err) {
      alert(err.message || "Unable to submit assignment.");
    }
  });

  document.getElementById("reminder-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var remindAt = document.getElementById("reminder-time").value;
    try {
      await App.apiRequest("/reminders", {
        method: "POST",
        body: JSON.stringify({
          assignment: activeAssignmentId,
          remindAt: new Date(remindAt).toISOString(),
          message: document.getElementById("reminder-message").value.trim()
        })
      });
      await App.loadUserData();
      App.closeModal("reminder-modal");
      App.renderAll();
    } catch (err) {
      alert(err.message || "Unable to schedule reminder.");
    }
  });

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
  document.getElementById("task-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var title = document.getElementById("task-title").value.trim();
    var course = document.getElementById("task-course").value;
    var priority = document.getElementById("task-priority").value;
    var deadline = document.getElementById("task-deadline").value;
    if (!title || !course || !deadline) return;

    try {
      await App.apiRequest("/assignments", {
        method: "POST",
        body: JSON.stringify({ title: title, course: course, deadline: new Date(deadline + "T00:00:00").toISOString(), priority: priority })
      });
      await App.loadUserData();
      App.closeModal("task-modal");
      App.renderAll();
    } catch (err) {
      alert(err.message || "Unable to create task.");
    }
  });
})();
