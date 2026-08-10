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

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAuthError();
    var name = document.getElementById("reg-name").value.trim();
    var email = document.getElementById("reg-email").value.trim().toLowerCase();
    var password = document.getElementById("reg-password").value;

    if (App.users.some(function (u) { return u.email === email; })) {
      showAuthError("An account with this email already exists.");
      return;
    }
    var user = { name: name, email: email, password: password };
    App.users.push(user);
    /* New accounts always start with a clean slate — no sample
       courses or tasks. */
    App.userStore[email] = { courses: [], tasks: [] };
    App.currentUser = user;
    enterApp();
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAuthError();
    var email = document.getElementById("login-email").value.trim().toLowerCase();
    var password = document.getElementById("login-password").value;
    var user = App.users.find(function (u) { return u.email === email && u.password === password; });
    if (!user) {
      showAuthError("Incorrect email or password.");
      return;
    }
    App.currentUser = user;
    enterApp();
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    App.saveUserData();
    App.currentUser = null;
    App.courses = [];
    App.tasks = [];
    document.getElementById("app-screen").style.display = "none";
    document.getElementById("auth-screen").style.display = "flex";
    loginForm.reset();
    registerForm.reset();
  });

  function enterApp() {
    App.loadUserData(App.currentUser.email);
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("app-screen").style.display = "block";
    document.getElementById("sidebar-user-name").textContent = App.currentUser.name;
    document.getElementById("profile-name").value = App.currentUser.name;
    document.getElementById("profile-email").value = App.currentUser.email;
    App.renderAll();
  }
})();
