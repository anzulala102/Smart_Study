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

  App.currentUser = null;
  App.reminders = [];
  App.token = localStorage.getItem("smartstudy_token") || null;
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

  App.setToken = function (token) {
    App.token = token || null;
    if (App.token) {
      localStorage.setItem("smartstudy_token", App.token);
    } else {
      localStorage.removeItem("smartstudy_token");
    }
  };

  App.apiRequest = async function (path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    if (App.token) {
      headers.Authorization = "Bearer " + App.token;
    }
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    var response = await fetch("/api" + path, Object.assign({}, options, { headers: headers }));
    var contentType = response.headers.get("content-type") || "";
    var payload = contentType.indexOf("application/json") >= 0 ? await response.json() : await response.text();
    if (!response.ok) {
      throw new Error((payload && (payload.error || payload.message)) || "Request failed");
    }
    return payload;
  };

  App.mapCourse = function (course) {
    var id = course && (course._id || course.id);
    var color = course && course.color ? course.color : App.COLORS[(id ? id.length : 0) % App.COLORS.length];
    return {
      id: id,
      code: course.code,
      name: course.name,
      color: color
    };
  };

  App.mapTask = function (task) {
    var courseId = task.course && (task.course._id || task.course);
    return {
      id: task._id || task.id,
      title: task.title,
      course: courseId || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      progress: task.progress || 0,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : App.todayISO()
    };
  };

  App.loadUserData = async function () {
    var coursesResult = await App.apiRequest("/courses");
    var assignmentsResult = await App.apiRequest("/assignments");
    var remindersResult = await App.apiRequest("/reminders");
    App.courses = (coursesResult || []).map(App.mapCourse);
    App.tasks = (assignmentsResult || []).map(App.mapTask);
    App.reminders = remindersResult || [];
    return { courses: App.courses, tasks: App.tasks };
  };

  App.saveUserData = function () {
    return Promise.resolve();
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
