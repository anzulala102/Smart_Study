/* ============================================================
   main.js
   Ties every view's render function together via App.renderAll,
   and handles sidebar navigation between views. Load this last.
   ============================================================ */

(function () {
  "use strict";

  App.renderAll = function () {
    App.renderStats();
    App.renderDeadlineStrip();
    App.renderCourses();
    App.renderTasks();
    App.renderReminders();
  };

  var navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (btn) {
    btn.addEventListener("click", function () { goto(btn.getAttribute("data-view")); });
  });
  document.querySelectorAll("[data-goto]").forEach(function (el) {
    el.addEventListener("click", function () { goto(el.getAttribute("data-goto")); });
  });

  function goto(view) {
    navItems.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === view); });
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    document.getElementById("view-" + view).classList.add("active");
  }
})();
