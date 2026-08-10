/* ============================================================
   data.js
   Shared application state and data-layer helpers.
   Must be loaded FIRST — it creates the global `App` namespace
   that every other file (modals.js, dashboard.js, courses.js,
   tasks.js, profile.js, auth.js, main.js) attaches to.
   ============================================================ */

var App = {};

(function () {
  "use strict";

  App.users = [
    { name: "Md Fuad Hasan Raj", email: "demo@student.edu", password: "demo123" }
  ];
  App.currentUser = null;

  App.COLORS = ["#1B2340", "#6B9080", "#E0A94E", "#E8604C", "#5B6EAE"];
  App.STATUS_ORDER = ["Pending", "In Progress", "Completed"];

  App.todayISO = function () {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  };
  App.inDays = function (n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  /* Per-user data store, keyed by email. Only the built-in demo
     account ships with sample courses/tasks — every newly registered
     account starts completely empty, and each user's data stays
     separate from every other user's. */
  App.userStore = {
    "demo@student.edu": {
      courses: [
        { id: "c1", code: "CSE311", name: "Web Programming Lab", color: "#1B2340" },
        { id: "c2", code: "CSE331", name: "Data Communication", color: "#6B9080" },
        { id: "c3", code: "CSE411", name: "Software Engineering", color: "#E0A94E" }
      ],
      tasks: [
        { id: "t1", title: "Requirements doc v2", course: "c1", priority: "High", status: "In Progress", deadline: App.inDays(1) },
        { id: "t2", title: "ER diagram revision", course: "c2", priority: "Medium", status: "Pending", deadline: App.inDays(2) },
        { id: "t3", title: "Sprint retrospective slides", course: "c3", priority: "Low", status: "Pending", deadline: App.inDays(4) },
        { id: "t4", title: "API auth middleware", course: "c1", priority: "High", status: "Pending", deadline: App.inDays(0) },
        { id: "t5", title: "Quiz 2 prep", course: "c2", priority: "Medium", status: "Completed", deadline: App.inDays(-1) },
        { id: "t6", title: "Figma wireframes", course: "c1", priority: "Medium", status: "In Progress", deadline: App.inDays(6) }
      ]
    }
  };

  App.courses = [];
  App.tasks = [];

  App.loadUserData = function (email) {
    if (!App.userStore[email]) {
      App.userStore[email] = { courses: [], tasks: [] };
    }
    App.courses = App.userStore[email].courses;
    App.tasks = App.userStore[email].tasks;
  };
  App.saveUserData = function () {
    if (App.currentUser) {
      App.userStore[App.currentUser.email] = { courses: App.courses, tasks: App.tasks };
    }
  };

  App.daysUntil = function (dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var t = new Date(new Date().toDateString());
    return Math.round((d - t) / 86400000);
  };
  App.deadlineLabel = function (dateStr) {
    var n = App.daysUntil(dateStr);
    if (n < 0) return Math.abs(n) + "d overdue";
    if (n === 0) return "Due today";
    if (n === 1) return "Due tomorrow";
    return "Due in " + n + "d";
  };
  App.courseById = function (id) {
    for (var i = 0; i < App.courses.length; i++) if (App.courses[i].id === id) return App.courses[i];
    return null;
  };
  App.uid = function (prefix) { return prefix + Date.now() + Math.floor(Math.random() * 1000); };

  App.escapeHtml = function (str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };
})();
