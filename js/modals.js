/* ============================================================
   modals.js
   Generic open/close behaviour for the task & course modals.
   ============================================================ */

(function () {
  "use strict";

  App.openModal = function (id) { document.getElementById(id).classList.add("active"); };
  App.closeModal = function (id) { document.getElementById(id).classList.remove("active"); };

  document.querySelectorAll(".modal-close").forEach(function (btn) {
    btn.addEventListener("click", function () { App.closeModal(btn.getAttribute("data-close")); });
  });
  document.querySelectorAll(".modal-overlay").forEach(function (ov) {
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.classList.remove("active"); });
  });
})();
