/* ==========================================================================
   Black Star Media — interactions
   Vanilla JS, no dependencies. Loaded with `defer`.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Sticky nav: solidify on scroll ------------------------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Mobile menu ------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });
  // close when a link is tapped or Escape pressed
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- 3. Scroll reveal ----------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. Active nav link on scroll ------------------------------ */
  var sections = ["ventures", "videos", "music", "workshops", "about"];
  var linkFor = {};
  document.querySelectorAll(".nav__link").forEach(function (a) {
    var id = a.getAttribute("href").replace("#", "");
    linkFor[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- 5. Lazy YouTube embeds (privacy + performance) ------------ */
  // Loads the iframe only on click/keypress, using youtube-nocookie + modestbranding.
  function loadYouTube(box) {
    var id = box.getAttribute("data-yt");
    if (!id || box.dataset.loaded) return;
    box.dataset.loaded = "1";
    var wrap = document.createElement("div");
    wrap.className = "embed embed--16x9";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
      "?rel=0&modestbranding=1&autoplay=1";
    iframe.title = box.getAttribute("aria-label") || "YouTube video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.loading = "lazy";
    wrap.appendChild(iframe);
    box.replaceWith(wrap);
  }
  document.querySelectorAll(".embed-lazy").forEach(function (box) {
    box.addEventListener("click", function () { loadYouTube(box); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); loadYouTube(box); }
    });
  });

  /* ---------- 6. Hero starfield (lightweight canvas) -------------------- */
  var canvas = document.getElementById("starfield");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(140, Math.floor((w * h) / 11000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.2,
          a: Math.random() * 0.6 + 0.15,
          tw: Math.random() * 0.02 + 0.004,
          dir: Math.random() < 0.5 ? 1 : -1,
          vy: Math.random() * 0.12 + 0.02
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.a += s.tw * s.dir;
        if (s.a > 0.8 || s.a < 0.12) s.dir *= -1;
        s.y += s.vy;
        if (s.y > h) { s.y = -2; s.x = Math.random() * w; }
        // gold-tinted twinkle for a few; mostly white
        ctx.beginPath();
        ctx.fillStyle = (i % 9 === 0)
          ? "rgba(201,168,76," + s.a.toFixed(2) + ")"
          : "rgba(255,255,255," + s.a.toFixed(2) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    var raf;
    resize();
    draw();
    window.addEventListener("resize", function () {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
    // pause when hero off-screen to save battery
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) draw(); }
          else { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ---------- 7. Footer year (auto) ------------------------------------ */
  // (kept static "2026" in markup; uncomment to auto-update)
  // var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
})();
