/* ============================================================
   courses.js
   Renders the course grid and handles the "Add course" modal
   (including the color-tag picker) and course deletion.
   ============================================================ */

(function () {
  "use strict";

  App.renderCourses = function () {
    var grid = document.getElementById("course-grid");
    if (App.courses.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No courses yet. Add one to start creating tasks.</div>';
      return;
    }
    grid.innerHTML = App.courses.map(function (c) {
      var count = App.tasks.filter(function (t) { return t.course === c.id && t.status !== "Completed"; }).length;
      return '<div class="course-card">' +
        '<button class="course-del" data-course-id="' + c.id + '">🗑</button>' +
        '<div class="course-swatch" style="background:' + c.color + '"></div>' +
        '<div class="course-code">' + App.escapeHtml(c.code) + '</div>' +
        '<div class="course-name">' + App.escapeHtml(c.name) + '</div>' +
        '<div class="course-count">' + count + ' active task' + (count !== 1 ? 's' : '') + '</div>' +
      '</div>';
    }).join("");

    grid.querySelectorAll(".course-del").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-course-id");
        try {
          await App.apiRequest("/courses/" + id, { method: "DELETE" });
          await App.loadUserData();
          App.renderAll();
        } catch (err) {
          alert(err.message || "Unable to delete course.");
        }
      });
    });
  };

  /* Course modal */
  var selectedColor = App.COLORS[0];
  var colorRow = document.getElementById("color-row");
  colorRow.innerHTML = App.COLORS.map(function (c) {
    return '<span class="color-dot" data-color="' + c + '" style="background:' + c + '"></span>';
  }).join("");
  function refreshColorDots() {
    colorRow.querySelectorAll(".color-dot").forEach(function (dot) {
      dot.classList.toggle("selected", dot.getAttribute("data-color") === selectedColor);
    });
  }
  colorRow.querySelectorAll(".color-dot").forEach(function (dot) {
    dot.addEventListener("click", function () {
      selectedColor = dot.getAttribute("data-color");
      refreshColorDots();
    });
  });
  refreshColorDots();

  document.getElementById("open-course-form").addEventListener("click", function () {
    document.getElementById("course-code").value = "";
    document.getElementById("course-name").value = "";
    selectedColor = App.COLORS[0];
    refreshColorDots();
    App.openModal("course-modal");
  });
  document.getElementById("course-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var code = document.getElementById("course-code").value.trim();
    var name = document.getElementById("course-name").value.trim();
    if (!code || !name) return;

    try {
      await App.apiRequest("/courses", {
        method: "POST",
        body: JSON.stringify({ code: code, name: name, supervisor: "" })
      });
      await App.loadUserData();
      App.closeModal("course-modal");
      App.renderAll();
    } catch (err) {
      alert(err.message || "Unable to save course.");
    }
  });
})();
