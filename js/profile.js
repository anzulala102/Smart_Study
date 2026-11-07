/* ============================================================
   profile.js
   Handles saving changes on the Profile view.
   ============================================================ */

(function () {
  "use strict";

  document.getElementById("save-profile-btn").addEventListener("click", async function () {
    var newName = document.getElementById("profile-name").value.trim();
    if (!newName) return;

    try {
      var result = await App.apiRequest("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: newName })
      });
      App.currentUser = result.user || App.currentUser;
      App.currentUser.name = newName;
      document.getElementById("sidebar-user-name").textContent = newName;
      var msg = document.getElementById("profile-saved-msg");
      msg.style.display = "block";
      setTimeout(function () { msg.style.display = "none"; }, 1800);
    } catch (err) {
      alert(err.message || "Unable to save profile.");
    }
  });
})();
