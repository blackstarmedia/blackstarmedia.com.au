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

  /* ---------- 5b. Latest YouTube uploads (auto-refresh) ----------------- */
  // Pulls the newest video id per channel from a same-origin JSON file that a
  // scheduled GitHub Action keeps current. Silently keeps the hard-coded
  // data-yt/thumbnail fallback in the markup if the fetch fails.
  var latestEmbeds = document.querySelectorAll(".embed-lazy[data-channel]");
  if (latestEmbeds.length && "fetch" in window) {
    fetch("assets/data/latest-videos.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.channels) return;
        latestEmbeds.forEach(function (box) {
          var info = data.channels[box.getAttribute("data-channel")];
          if (!info || !info.videoId || box.dataset.loaded) return;
          var id = info.videoId;
          box.setAttribute("data-yt", id);
          box.style.background =
            "linear-gradient(rgba(10,10,10,0.2),rgba(10,10,10,0.55))," +
            "url('https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg') center/cover";
          if (info.title) box.setAttribute("aria-label", "Play: " + info.title);
        });
      })
      .catch(function () { /* keep static fallback */ });
  }

  /* ---------- 5c. Downloads — email-gated lead magnets ----------------- */
  // Renders the download cards on downloads.html from a same-origin JSON
  // manifest (display info only — the actual files live in Google Drive and are
  // never linked here). Each card carries an email opt-in form; on submit we
  // POST {key, email, consent} to a Google Apps Script web app (the "endpoint"
  // in the manifest), which logs the address to a Google Sheet and emails the
  // download link. Empty/failed states degrade to a friendly message.
  var dlList = document.getElementById("downloadsList");
  if (dlList && "fetch" in window) {
    var esc = function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    };
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var endpoint = "";
    var renderEmpty = function (msg) {
      dlList.innerHTML = '<p class="dl-empty">' + esc(msg) + "</p>";
    };
    var cardHTML = function (item) {
      var type = (item.type || "PDF").toUpperCase();
      var meta = [type, item.size].filter(Boolean).map(esc).join(" · ");
      var key = esc(item.key || "");
      var cover = item.cover
        ? '<div class="dl-card__cover"><img src="' + esc(item.cover) + '" alt="' + esc(item.title || "") + ' cover" loading="lazy" /></div>'
        : "";
      return (
        '<article class="card dl-card reveal is-visible">' +
          cover +
          '<span class="dl-card__type">' + esc(type) + " &middot; free download</span>" +
          '<h3 class="dl-card__title">' + esc(item.title || "Untitled") + "</h3>" +
          (item.description ? '<p class="dl-card__desc">' + esc(item.description) + "</p>" : '<p class="dl-card__desc"></p>') +
          (meta ? '<p class="dl-card__meta">' + meta + "</p>" : "") +
          '<form class="dl-form" data-key="' + key + '" novalidate>' +
            '<label class="sr-only" for="dl-email-' + key + '">Your email address</label>' +
            '<input class="dl-form__email" id="dl-email-' + key + '" type="email" name="email" ' +
              'inputmode="email" autocomplete="email" placeholder="you@example.com" required />' +
            // honeypot (hidden from humans; bots tend to fill it)
            '<input class="dl-form__hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
            '<label class="dl-form__consent"><input type="checkbox" name="consent" required /> ' +
              "<span>Email me this resource and occasional updates from Black Star Media. " +
              "I can unsubscribe anytime.</span></label>" +
            '<button class="btn btn--gold dl-form__submit" type="submit">Email me the ' + esc(type) +
              ' <span aria-hidden="true">&rarr;</span></button>' +
            '<p class="dl-form__msg" role="status" aria-live="polite"></p>' +
          "</form>" +
        "</article>"
      );
    };
    var groupHTML = function (group) {
      var items = (group.items || []).map(cardHTML).join("");
      if (!items) return "";
      var name = group.name ? '<h3 class="dl-group__name">' + esc(group.name) + "</h3>" : "";
      return '<div class="dl-group">' + name + '<div class="grid grid--3">' + items + "</div></div>";
    };

    var setMsg = function (form, text, kind) {
      var msg = form.querySelector(".dl-form__msg");
      msg.textContent = text;
      msg.className = "dl-form__msg" + (kind ? " is-" + kind : "");
    };

    var onSubmit = function (e) {
      e.preventDefault();
      var form = e.currentTarget;
      if (form.dataset.sent) return;
      var email = (form.email.value || "").trim();
      var consent = form.consent.checked;
      var honeypot = form.company.value;
      if (honeypot) return;                                  // silent bot drop
      if (!EMAIL_RE.test(email)) { setMsg(form, "Please enter a valid email address.", "error"); form.email.focus(); return; }
      if (!consent) { setMsg(form, "Please tick the box so we can send it over.", "error"); return; }
      if (!endpoint || endpoint.indexOf("PASTE_") === 0) { setMsg(form, "Downloads aren't configured yet — please check back soon.", "error"); return; }

      var btn = form.querySelector(".dl-form__submit");
      btn.disabled = true;
      setMsg(form, "Sending…", "pending");

      // Apps Script web apps don't return CORS headers we can read, so we use a
      // no-cors POST with a simple (text/plain) body and treat completion as
      // success. The script validates the key/email server-side.
      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ key: form.dataset.key, email: email, consent: true, source: location.href })
      })
        .then(function () {
          form.dataset.sent = "1";
          form.innerHTML = '<p class="dl-form__success">✓ Thank you! Check your inbox (and spam folder) — ' +
            "your download link is on its way to <strong>" + esc(email) + "</strong>.</p>";
        })
        .catch(function () {
          btn.disabled = false;
          setMsg(form, "Something went wrong. Please try again in a moment.", "error");
        });
    };

    fetch("assets/data/downloads.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        endpoint = (data && data.endpoint) || "";
        var groups = (data && data.groups) || [];
        var total = groups.reduce(function (n, g) { return n + ((g.items && g.items.length) || 0); }, 0);
        if (!total) {
          renderEmpty("New resources are on their way — check back soon.");
          return;
        }
        dlList.innerHTML = groups.map(groupHTML).join("");
        dlList.querySelectorAll(".dl-form").forEach(function (f) {
          f.addEventListener("submit", onSubmit);
        });
      })
      .catch(function () {
        renderEmpty("Downloads are temporarily unavailable. Please try again later.");
      });
  }

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
        // light-grey twinkle for a few; mostly white
        ctx.beginPath();
        ctx.fillStyle = (i % 9 === 0)
          ? "rgba(203,208,216," + s.a.toFixed(2) + ")"
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
