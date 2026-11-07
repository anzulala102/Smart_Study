/* ============================================================
   auth.js
   Login, registration, logout, and the login/register form toggle.
   ============================================================ */

(function () {
  "use strict";

  var authError = document.getElementById("auth-error");
  var loginForm = document.getElementById("login-form");
  var registerForm = document.getElementById("register-form");

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.style.display = "block";
  }
  function clearAuthError() {
    authError.style.display = "none";
  }

  document.getElementById("toggle-to-register").querySelector("a").addEventListener("click", function () {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    document.getElementById("toggle-to-register").style.display = "none";
    document.getElementById("toggle-to-login").style.display = "block";
    clearAuthError();
  });
  document.getElementById("toggle-to-login").querySelector("a").addEventListener("click", function () {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    document.getElementById("toggle-to-login").style.display = "none";
    document.getElementById("toggle-to-register").style.display = "block";
    clearAuthError();
  });

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearAuthError();
    var name = document.getElementById("reg-name").value.trim();
    var email = document.getElementById("reg-email").value.trim().toLowerCase();
    var password = document.getElementById("reg-password").value;
    var studentId = document.getElementById("reg-student-id").value.trim();

    try {
      var result = await App.apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name, email: email, password: password, studentId: studentId })
      });
      App.currentUser = result.user;
      App.setToken(result.token);
      await App.loadUserData();
      enterApp();
    } catch (err) {
      showAuthError(err.message || "Registration failed.");
    }
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearAuthError();
    var email = document.getElementById("login-email").value.trim().toLowerCase();
    var password = document.getElementById("login-password").value;

    try {
      var result = await App.apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password })
      });
      App.currentUser = result.user;
      App.setToken(result.token);
      await App.loadUserData();
      enterApp();
    } catch (err) {
      showAuthError(err.message || "Incorrect email or password.");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    App.setToken(null);
    App.currentUser = null;
    App.courses = [];
    App.tasks = [];
    App.reminders = [];
    document.getElementById("app-screen").style.display = "none";
    document.getElementById("auth-screen").style.display = "flex";
    loginForm.reset();
    registerForm.reset();
  });

  async function enterApp() {
    if (!App.currentUser) return;
    try {
      var me = await App.apiRequest("/auth/me");
      App.currentUser = me.user || App.currentUser;
      await App.loadUserData();
      document.getElementById("auth-screen").style.display = "none";
      document.getElementById("app-screen").style.display = "block";
      document.getElementById("sidebar-user-name").textContent = App.currentUser.name;
      document.getElementById("profile-name").value = App.currentUser.name;
      document.getElementById("profile-email").value = App.currentUser.email;
      App.renderAll();
    } catch (err) {
      App.setToken(null);
      App.currentUser = null;
      showAuthError(err.message || "Session expired.");
      document.getElementById("auth-screen").style.display = "flex";
      document.getElementById("app-screen").style.display = "none";
    }
  }
})();
