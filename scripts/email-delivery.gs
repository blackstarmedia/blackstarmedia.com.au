/**
 * Black Star Media — Download delivery + email capture
 * =====================================================
 * A Google Apps Script web app that powers the email-gated downloads on
 * downloads.html. When a visitor submits the form it:
 *   1. validates the request (known resource key + valid email + consent),
 *   2. appends the address to a Google Sheet (your email database),
 *   3. emails them a sincere thank-you with the download link.
 *
 * The actual PDFs stay in Google Drive (never hosted on the public site), so the
 * email gate can't be bypassed by guessing a URL.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * ONE-TIME SETUP
 * ───────────────────────────────────────────────────────────────────────────
 * 1. Go to https://script.google.com → New project. Paste this whole file in,
 *    replacing the default Code.gs. Name the project "Black Star Downloads".
 * 2. Fill in CONFIG below (FILES map at minimum). Each Drive file must be shared
 *    "Anyone with the link → Viewer".
 * 3. Deploy → New deployment → type "Web app":
 *       Execute as:        Me (your@blackstarmedia.com.au)
 *       Who has access:    Anyone
 *    Click Deploy, authorise the scopes when prompted, and COPY the Web app URL
 *    (ends in /exec).
 * 4. Paste that URL into assets/data/downloads.json → "endpoint".
 * 5. (Optional) test by visiting the /exec URL in a browser — it should return
 *    {"ok":true,"service":"black-star-downloads"}.
 *
 * The signups Sheet is created automatically on the first submission and lives
 * in your Drive as "Black Star — Download Signups". To use an existing sheet,
 * put its ID in CONFIG.SHEET_ID.
 *
 * When you add a new resource: add an entry to FILES here (key → Drive id),
 * redeploy (Deploy → Manage deployments → edit → Version: New version), and add
 * the matching display entry to downloads.json.
 */

var CONFIG = {
  // Resource key (must match downloads.json) → Drive file details.
  FILES: {
    "suno-visualized-workflow-booklet": {
      id: "1EKteupnYVHGrCN80RvtYA1a-nY-VWVft",
      title: "Suno Visualized — Workflow Booklet"
    }
  },

  // Leave blank to auto-create "Black Star — Download Signups" in your Drive,
  // or paste an existing spreadsheet ID to log there instead.
  SHEET_ID: "",
  SHEET_NAME: "Signups",

  // Sender identity (also satisfies the Spam Act "identify the sender" rule).
  SENDER_NAME: "Louis — Black Star Media",
  REPLY_TO: "contact@blackstarmedia.com.au",
  BUSINESS_NAME: "Black Star Media & Entertainment",
  BUSINESS_LOCATION: "Brisbane, QLD, Australia",
  UNSUBSCRIBE_EMAIL: "contact@blackstarmedia.com.au",
  SITE_URL: "https://blackstarmedia.com.au"
};

// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return json_({ ok: true, service: "black-star-downloads" });
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); }
      catch (err) { body = (e.parameter || {}); }   // fallback: form-encoded
    } else {
      body = (e && e.parameter) || {};
    }

    var key = String(body.key || "").trim();
    var email = String(body.email || "").trim();
    var consent = body.consent === true || body.consent === "true" || body.consent === "on";
    var source = String(body.source || "").slice(0, 300);

    var file = CONFIG.FILES[key];
    if (!file) return json_({ ok: false, error: "unknown_resource" });
    if (!isValidEmail_(email)) return json_({ ok: false, error: "invalid_email" });
    if (!consent) return json_({ ok: false, error: "consent_required" });

    logSignup_(email, key, file.title, consent, source);
    sendDeliveryEmail_(email, file);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server_error", detail: String(err) });
  }
}

function isValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = CONFIG.SHEET_ID || props.getProperty("SHEET_ID");
  var ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create("Black Star — Download Signups");
    props.setProperty("SHEET_ID", ss.getId());
  }
  var sh = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Timestamp", "Email", "Resource key", "Resource title", "Consent", "Source"]);
  }
  return sh;
}

function logSignup_(email, key, title, consent, source) {
  getSheet_().appendRow([new Date(), email, key, title, consent ? "yes" : "no", source]);
}

function getDownloadLink_(fileId) {
  // Drive viewer: lets recipients preview large booklets inline and download.
  return "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
}

function sendDeliveryEmail_(email, file) {
  var link = getDownloadLink_(file.id);
  var subject = "Your download: " + file.title;

  var plain =
    "Hi there,\n\n" +
    "Thank you so much — it genuinely means a lot that you wanted this.\n\n" +
    "Here's your copy of \"" + file.title + "\":\n" + link + "\n\n" +
    "I hope it's genuinely useful. If you ever get stuck or just want to share " +
    "what you're building, hit reply — your email comes straight to me.\n\n" +
    "Talk soon,\nLouis\n" + CONFIG.BUSINESS_NAME + "\n" + CONFIG.SITE_URL + "\n\n" +
    "—\nYou're receiving this because you requested this resource at " + CONFIG.SITE_URL + ".\n" +
    CONFIG.BUSINESS_NAME + ", " + CONFIG.BUSINESS_LOCATION + ".\n" +
    "To unsubscribe from future updates, just reply with \"unsubscribe\" or email " +
    CONFIG.UNSUBSCRIBE_EMAIL + ".";

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#16181C;line-height:1.6">' +
      '<div style="background:#000;border-radius:14px;padding:28px 28px 24px;text-align:center">' +
        '<p style="margin:0;color:#CBD0D8;font-size:13px;letter-spacing:3px">BLACK &#9733; STAR MEDIA</p>' +
        '<h1 style="margin:14px 0 0;color:#fff;font-size:22px;font-weight:700">Thank you — here&rsquo;s your download</h1>' +
      "</div>" +
      '<div style="padding:26px 6px">' +
        "<p>Hi there,</p>" +
        "<p>Thank you so much &mdash; it genuinely means a lot that you wanted this. " +
        "Here&rsquo;s your copy of <strong>" + escapeHtml_(file.title) + "</strong>:</p>" +
        '<p style="text-align:center;margin:26px 0">' +
          '<a href="' + link + '" style="display:inline-block;background:#CBD0D8;color:#000;text-decoration:none;' +
          'font-weight:600;padding:13px 26px;border-radius:999px">Open your download &rarr;</a>' +
        "</p>" +
        "<p>I hope it&rsquo;s genuinely useful. If you ever get stuck &mdash; or just want to share what " +
        "you&rsquo;re building &mdash; hit reply. Your email comes straight to me.</p>" +
        "<p style=\"margin-top:24px\">Talk soon,<br><strong>Louis</strong><br>" +
        escapeHtml_(CONFIG.BUSINESS_NAME) + '<br><a href="' + CONFIG.SITE_URL + '" style="color:#16181C">' +
        CONFIG.SITE_URL.replace(/^https?:\/\//, "") + "</a></p>" +
      "</div>" +
      '<div style="border-top:1px solid #e5e7eb;padding:16px 6px;color:#9AA0A6;font-size:12px;line-height:1.5">' +
        "You&rsquo;re receiving this because you requested this resource at " +
        CONFIG.SITE_URL.replace(/^https?:\/\//, "") + ".<br>" +
        escapeHtml_(CONFIG.BUSINESS_NAME) + ", " + escapeHtml_(CONFIG.BUSINESS_LOCATION) + ".<br>" +
        'To unsubscribe from future updates, reply with &ldquo;unsubscribe&rdquo; or email ' +
        '<a href="mailto:' + CONFIG.UNSUBSCRIBE_EMAIL + '" style="color:#9AA0A6">' + CONFIG.UNSUBSCRIBE_EMAIL + "</a>." +
      "</div>" +
    "</div>";

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: plain,
    htmlBody: html,
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.REPLY_TO
  });
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
