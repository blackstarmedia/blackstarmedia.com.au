/* ==========================================================================
   Black Star Media — Downloads section + admin upload
   Reads PDFs from a public Google Drive folder.
   Admin upload via Google Sign-In (Shift + Alt + A to open panel).

   SETUP — fill in the three constants below:
   1. Go to console.cloud.google.com and create/select a project.
   2. Enable the "Google Drive API".
   3. Create an API key (restrict it to your domain + Drive API).
   4. Create an OAuth 2.0 Web Client ID (add your domain to Authorised JS origins).
   5. Create a Google Drive folder, share it as "Anyone with the link → Viewer".
   6. Grab the folder ID from the share URL: drive.google.com/drive/folders/FOLDER_ID
   ========================================================================== */
(function () {
  "use strict";

  // ── CONFIG ───────────────────────────────────────────────────────────────
  // Drive listing + admin upload (see header):
  var DRIVE_API_KEY   = "YOUR_GOOGLE_API_KEY";
  var DRIVE_CLIENT_ID = "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com";
  var DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID";
  // Email gate: the Apps Script web-app /exec URL (see scripts/email-delivery.gs).
  // Visitors enter their email -> we POST to this -> it logs the address to a
  // Google Sheet and emails the download link. Leave as-is to disable gating.
  var EMAIL_ENDPOINT  = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
  // ─────────────────────────────────────────────────────────────────────────

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var gateOn = EMAIL_ENDPOINT.indexOf("PASTE_") !== 0;

  var grid  = document.getElementById("downloadsGrid");
  var modal = document.getElementById("adminModal");
  var adminBody = document.getElementById("adminBody");

  if (!grid) return;

  // ── Escape helper ────────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Observe newly added reveal cards ────────────────────────────────────
  function observeReveals(parent) {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var newCards = parent.querySelectorAll(".reveal:not(.is-visible)");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      newCards.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    newCards.forEach(function (el) { io.observe(el); });
  }

  // ── Build a download card DOM node ───────────────────────────────────────
  function buildCard(file, index) {
    var title = file.name.replace(/\.pdf$/i, "");
    var desc  = (file.description || "").trim();
    var isYT  = desc && /youtu\.?be/.test(desc);

    var card = document.createElement("article");
    card.className = "dl-card reveal";
    card.setAttribute("data-delay", String((index % 3) + 1));

    card.innerHTML =
      '<div class="dl-card__icon" aria-hidden="true">' +
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="9" y1="13" x2="15" y2="13"/>' +
          '<line x1="9" y1="17" x2="15" y2="17"/>' +
        "</svg>" +
      "</div>" +
      '<div class="dl-card__body">' +
        '<h3 class="dl-card__title">' + esc(title) + "</h3>" +
        (isYT
          ? '<a class="link-arrow dl-card__yt" href="' + esc(desc) + '" target="_blank" rel="noopener">' +
              'Watch on YouTube <span class="chev">&rarr;</span>' +
            "</a>"
          : "") +
      "</div>" +
      (gateOn ? gateFormHTML(file, title) : directDownloadHTML(file));

    if (gateOn) {
      var form = card.querySelector(".dl-form");
      if (form) form.addEventListener("submit", onGateSubmit);
    }
    return card;
  }

  // ── Email-gate form (replaces the direct download) ───────────────────────
  function gateFormHTML(file, title) {
    var id = esc(file.id);
    return (
      '<form class="dl-form" data-file-id="' + id + '" data-file-name="' + esc(title) + '" novalidate>' +
        '<label class="sr-only" for="dl-email-' + id + '">Your email address</label>' +
        '<input class="dl-form__email" id="dl-email-' + id + '" type="email" name="email" ' +
          'inputmode="email" autocomplete="email" placeholder="you@example.com" required />' +
        '<input class="dl-form__hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
        '<label class="dl-form__consent"><input type="checkbox" name="consent" required /> ' +
          "<span>Email me this resource and occasional updates from Black Star Media. " +
          "I can unsubscribe anytime.</span></label>" +
        '<button class="btn btn--gold dl-form__submit" type="submit">Email me the PDF ' +
          '<span aria-hidden="true">&rarr;</span></button>' +
        '<p class="dl-form__msg" role="status" aria-live="polite"></p>' +
      "</form>"
    );
  }

  // ── Direct download (used only when the email gate is not configured) ─────
  function directDownloadHTML(file) {
    return (
      '<a class="btn btn--gold-outline dl-card__dl"' +
        ' href="https://drive.google.com/uc?export=download&id=' + encodeURIComponent(file.id) + '"' +
        ' target="_blank" rel="noopener">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">' +
          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
          '<polyline points="7 10 12 15 17 10"/>' +
          '<line x1="12" y1="15" x2="12" y2="3"/>' +
        "</svg>" +
        " Download PDF" +
      "</a>"
    );
  }

  function setFormMsg(form, text, kind) {
    var msg = form.querySelector(".dl-form__msg");
    msg.textContent = text;
    msg.className = "dl-form__msg" + (kind ? " is-" + kind : "");
  }

  function onGateSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    if (form.dataset.sent) return;
    var email = (form.email.value || "").trim();
    if (form.company.value) return;                       // honeypot: silent bot drop
    if (!EMAIL_RE.test(email)) { setFormMsg(form, "Please enter a valid email address.", "error"); form.email.focus(); return; }
    if (!form.consent.checked) { setFormMsg(form, "Please tick the box so we can send it over.", "error"); return; }

    var btn = form.querySelector(".dl-form__submit");
    btn.disabled = true;
    setFormMsg(form, "Sending…", "pending");

    // Apps Script doesn't return readable CORS headers, so use a no-cors POST
    // with a simple (text/plain) body and treat completion as success.
    fetch(EMAIL_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        fileId: form.dataset.fileId,
        fileName: form.dataset.fileName,
        email: email,
        consent: true,
        source: location.href
      })
    })
      .then(function () {
        form.dataset.sent = "1";
        form.innerHTML = '<p class="dl-form__success">✓ Thank you! Check your inbox (and spam folder) — ' +
          "your download link is on its way to <strong>" + esc(email) + "</strong>.</p>";
      })
      .catch(function () {
        btn.disabled = false;
        setFormMsg(form, "Something went wrong. Please try again in a moment.", "error");
      });
  }

  // ── Placeholder cards (shown before Drive is configured) ─────────────────
  function renderPlaceholders() {
    var items = [
      "AI Tools Quickstart Guide",
      "Prompt Engineering Cheatsheet",
      "AI:M Workshop Workbook",
    ];
    grid.innerHTML = "";
    items.forEach(function (title, i) {
      var card = document.createElement("article");
      card.className = "dl-card dl-card--placeholder reveal";
      card.setAttribute("data-delay", String(i + 1));
      card.innerHTML =
        '<div class="dl-card__icon" aria-hidden="true">' +
          '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
            '<polyline points="14 2 14 8 20 8"/>' +
          "</svg>" +
        "</div>" +
        '<div class="dl-card__body">' +
          '<h3 class="dl-card__title">' + esc(title) + "</h3>" +
          '<span class="dl-card__yt muted">Coming soon</span>' +
        "</div>" +
        '<span class="btn btn--ghost dl-card__dl" aria-disabled="true">Coming Soon</span>';
      grid.appendChild(card);
    });
    observeReveals(grid);
  }

  // ── Fetch file list from Drive API ───────────────────────────────────────
  function loadDownloads() {
    if (DRIVE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      renderPlaceholders();
      return;
    }

    var q = "'" + DRIVE_FOLDER_ID + "' in parents and mimeType='application/pdf' and trashed=false";
    var url =
      "https://www.googleapis.com/drive/v3/files" +
      "?q=" + encodeURIComponent(q) +
      "&orderBy=createdTime+desc" +
      "&fields=" + encodeURIComponent("files(id,name,description,createdTime)") +
      "&key=" + encodeURIComponent(DRIVE_API_KEY);

    grid.innerHTML = '<p class="dl-empty">Loading resources&hellip;</p>';

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var files = data.files || [];
        if (files.length === 0) {
          grid.innerHTML = '<p class="dl-empty">No resources yet — check back soon.</p>';
          return;
        }
        grid.innerHTML = "";
        files.forEach(function (f, i) { grid.appendChild(buildCard(f, i)); });
        observeReveals(grid);
      })
      .catch(function () {
        grid.innerHTML = '<p class="dl-empty">Could not load resources. Please try again later.</p>';
      });
  }

  // ── Admin modal ──────────────────────────────────────────────────────────
  var adminOpen = false;
  var tokenClient = null;
  var accessToken = null;

  function openAdmin() {
    if (!modal) return;
    adminOpen = true;
    modal.removeAttribute("hidden");
    modal.classList.add("is-open");
    if (!tokenClient && DRIVE_CLIENT_ID !== "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com") {
      loadGIS();
    } else if (tokenClient) {
      showSignIn();
    } else {
      if (adminBody) {
        adminBody.innerHTML =
          '<p style="color:rgba(255,255,255,0.6);font-size:0.9rem;">' +
          "Admin not configured — add your OAuth Client ID to downloads.js to enable uploads." +
          "</p>";
      }
    }
    document.getElementById("adminClose") && document.getElementById("adminClose").focus();
  }

  function closeAdmin() {
    if (!modal) return;
    adminOpen = false;
    modal.classList.remove("is-open");
    setTimeout(function () { modal.setAttribute("hidden", ""); }, 350);
  }

  // Secret shortcut: Shift + Alt + A
  document.addEventListener("keydown", function (e) {
    if (e.shiftKey && e.altKey && (e.key === "A" || e.key === "a")) {
      adminOpen ? closeAdmin() : openAdmin();
    }
    if (e.key === "Escape" && adminOpen) closeAdmin();
  });

  if (modal) {
    var closeBtn = document.getElementById("adminClose");
    if (closeBtn) closeBtn.addEventListener("click", closeAdmin);

    // Click outside box to close
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeAdmin();
    });
  }

  // ── Google Identity Services ─────────────────────────────────────────────
  function loadGIS() {
    if (adminBody) adminBody.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-size:0.9rem;">Loading Google Sign-In&hellip;</p>';
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = function () {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: DRIVE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: function (resp) {
          if (resp.error) {
            setAdminMsg("Sign-in failed: " + resp.error, true);
            return;
          }
          accessToken = resp.access_token;
          showUploadForm();
        },
      });
      showSignIn();
    };
    s.onerror = function () {
      setAdminMsg("Could not load Google Sign-In. Check your connection.", true);
    };
    document.head.appendChild(s);
  }

  function showSignIn() {
    if (!adminBody) return;
    adminBody.innerHTML =
      '<button class="btn btn--gold" id="adminSignIn">Sign in with Google &rarr;</button>';
    document.getElementById("adminSignIn").addEventListener("click", function () {
      if (tokenClient) tokenClient.requestAccessToken();
    });
  }

  function showUploadForm() {
    if (!adminBody) return;
    adminBody.innerHTML =
      '<form id="uploadForm" class="form" style="gap:0.9rem;">' +
        '<div class="field">' +
          '<label for="pdfTitle">Display name <span style="font-size:0.85em;opacity:0.6">(leave blank to use filename)</span></label>' +
          '<input id="pdfTitle" type="text" placeholder="e.g. AI Tools Quickstart Guide" />' +
        "</div>" +
        '<div class="field">' +
          '<label for="pdfYt">YouTube video URL <span style="font-size:0.85em;opacity:0.6">(optional — shown on the card)</span></label>' +
          '<input id="pdfYt" type="url" placeholder="https://youtube.com/watch?v=..." />' +
        "</div>" +
        '<div class="field">' +
          '<label for="pdfFile">PDF file <span style="color:var(--color-gold)">*</span></label>' +
          '<input id="pdfFile" type="file" accept=".pdf,application/pdf" required />' +
        "</div>" +
        '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">' +
          '<button class="btn btn--gold" type="submit">Upload to Drive &rarr;</button>' +
          '<button class="btn btn--ghost" type="button" id="adminSignOut">Sign out</button>' +
        "</div>" +
        '<p id="uploadMsg" style="font-size:0.88rem;margin-top:0.4rem;min-height:1.4em;"></p>' +
      "</form>";

    document.getElementById("uploadForm").addEventListener("submit", handleUpload);
    document.getElementById("adminSignOut").addEventListener("click", function () {
      accessToken = null;
      showSignIn();
    });
  }

  function handleUpload(e) {
    e.preventDefault();
    var fileInput = document.getElementById("pdfFile");
    var titleInput = document.getElementById("pdfTitle");
    var ytInput = document.getElementById("pdfYt");
    var msgEl = document.getElementById("uploadMsg");
    var file = fileInput && fileInput.files[0];
    if (!file) return;

    var displayName = (titleInput ? titleInput.value.trim() : "") || file.name.replace(/\.pdf$/i, "");
    var ytUrl = ytInput ? ytInput.value.trim() : "";
    var fileName = displayName + ".pdf";

    msgEl.textContent = "Uploading…";
    msgEl.style.color = "rgba(255,255,255,0.6)";

    var meta = JSON.stringify({
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
      description: ytUrl,
    });

    var body = new FormData();
    body.append("metadata", new Blob([meta], { type: "application/json" }));
    body.append("file", file);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
      body: body,
    })
      .then(function (r) {
        if (r.status === 401) { accessToken = null; throw new Error("auth"); }
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function () {
        msgEl.textContent = "Uploaded! Refreshing list…";
        msgEl.style.color = "var(--color-gold)";
        setTimeout(function () {
          loadDownloads();
          closeAdmin();
        }, 1200);
      })
      .catch(function (err) {
        if (err.message === "auth") {
          msgEl.textContent = "Session expired — please sign in again.";
          msgEl.style.color = "var(--color-gold)";
          setTimeout(showSignIn, 1500);
        } else {
          msgEl.textContent = "Upload failed: " + err.message;
          msgEl.style.color = "var(--color-gold)";
        }
      });
  }

  function setAdminMsg(text, isErr) {
    if (!adminBody) return;
    adminBody.innerHTML =
      '<p style="font-size:0.9rem;color:' + (isErr ? "var(--color-gold)" : "rgba(255,255,255,0.6)") + ';">' +
      esc(text) +
      "</p>";
  }

  // ── Kick off ─────────────────────────────────────────────────────────────
  loadDownloads();
})();
