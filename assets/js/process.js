/* ==========================================================================
   Black Star Media — "How We Work" inline pipeline accordion (index.html)
   The six-stage content now lives as static HTML directly in index.html
   (so it's crawlable without JS); this file only wires up the expand/
   collapse interaction on top of that markup.
   ========================================================================== */
(function () {
  "use strict";

  var app = document.getElementById("processApp");
  if (!app) return;

  /* ---- accordion (2 levels: stage -> sub -> tasks) ---- */
  function depth(el) { var d = 0, n = el; while (n) { n = n.parentElement; d++; } return d; }
  function refreshOpenPanels() {
    var panels = Array.prototype.slice.call(app.querySelectorAll(".pl-panel"));
    panels.sort(function (a, b) { return depth(b) - depth(a); });
    panels.forEach(function (p) {
      var btn = p.previousElementSibling;
      var isOpen = btn && btn.getAttribute("aria-expanded") === "true";
      if (!isOpen) { p.style.maxHeight = "0px"; return; }
      p.style.maxHeight = "none";
      var h = p.scrollHeight;
      p.style.maxHeight = p.querySelector(".pl-panel") ? h + "px" : "none";
    });
  }
  function setPanel(btn, panel) {
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    var sub = btn.closest(".pl-sub");
    if (sub && btn.classList.contains("pl-sub-btn")) sub.dataset.open = String(!open);
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + "px";
      requestAnimationFrame(function () { panel.style.maxHeight = "0px"; });
      requestAnimationFrame(refreshOpenPanels);
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
      panel.addEventListener("transitionend", function te(e) {
        if (e.target !== panel) return;
        if (btn.getAttribute("aria-expanded") === "true") {
          if (!panel.querySelector(".pl-panel")) panel.style.maxHeight = "none";
          refreshOpenPanels();
        }
        panel.removeEventListener("transitionend", te);
      });
      requestAnimationFrame(refreshOpenPanels);
    }
  }
  app.querySelectorAll(".pl-stage-btn, .pl-sub-btn, .pl-tasks-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { setPanel(btn, btn.nextElementSibling); });
  });
  window.addEventListener("resize", function () { requestAnimationFrame(refreshOpenPanels); });
})();
