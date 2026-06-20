/**
 * Black Star Media — Download delivery + email capture
 * =====================================================
 * A Google Apps Script web app that powers the email-gated downloads in the
 * Downloads section (index.html + assets/js/downloads.js). When a visitor
 * submits the email form it:
 *   1. validates the request (valid email + consent + the file really lives in
 *      your downloads Drive folder),
 *   2. appends the address to a Google Sheet (your email database),
 *   3. emails them a sincere thank-you with the download link.
 *
 * downloads.js lists PDFs straight from the Drive folder and posts the chosen
 * file's id here, so you DON'T maintain a per-file list in two places — any PDF
 * you upload to the folder is automatically deliverable.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * ONE-TIME SETUP
 * ───────────────────────────────────────────────────────────────────────────
 * 1. https://script.google.com → New project. Paste this whole file in,
 *    replacing the default Code.gs. Name it "Black Star Downloads".
 * 2. Set DOWNLOADS_FOLDER_ID below to the SAME Drive folder id you put in
 *    assets/js/downloads.js (DRIVE_FOLDER_ID). Adjust sender details if needed.
 * 3. Deploy → New deployment → type "Web app":
 *       Execute as:        Me (your@blackstarmedia.com.au)
 *       Who has access:    Anyone
 *    Deploy, authorise the scopes, and COPY the Web app URL (ends in /exec).
 * 4. Paste that URL into assets/js/downloads.js → EMAIL_ENDPOINT.
 * 5. (Optional) visit the /exec URL — it should return
 *    {"ok":true,"service":"black-star-downloads"}.
 *
 * The signups Sheet ("Black Star — Download Signups") is created automatically
 * in your Drive on the first submission (or set SHEET_ID to use an existing one).
 */

var CONFIG = {
  // MUST match DRIVE_FOLDER_ID in assets/js/downloads.js. Only PDFs inside this
  // folder can be emailed (prevents the endpoint being used to send other files).
  DOWNLOADS_FOLDER_ID: "YOUR_DRIVE_FOLDER_ID",

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

    var fileId = String(body.fileId || "").trim();
    var email = String(body.email || "").trim();
    var consent = body.consent === true || body.consent === "true" || body.consent === "on";
    var source = String(body.source || "").slice(0, 300);

    if (!isValidEmail_(email)) return json_({ ok: false, error: "invalid_email" });
    if (!consent) return json_({ ok: false, error: "consent_required" });

    var file = getFolderFile_(fileId);   // null unless the file is in our folder
    if (!file) return json_({ ok: false, error: "unknown_resource" });

    var title = file.getName().replace(/\.pdf$/i, "");
    logSignup_(email, fileId, title, consent, source);
    sendDeliveryEmail_(email, fileId, title);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server_error", detail: String(err) });
  }
}

function isValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Returns the Drive File only if it is a PDF located in DOWNLOADS_FOLDER_ID.
function getFolderFile_(fileId) {
  if (!fileId) return null;
  var file;
  try { file = DriveApp.getFileById(fileId); } catch (e) { return null; }
  var parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === CONFIG.DOWNLOADS_FOLDER_ID) return file;
  }
  return null;
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
    sh.appendRow(["Timestamp", "Email", "File id", "Resource title", "Consent", "Source"]);
  }
  return sh;
}

function logSignup_(email, fileId, title, consent, source) {
  getSheet_().appendRow([new Date(), email, fileId, title, consent ? "yes" : "no", source]);
}

function getDownloadLink_(fileId) {
  // Drive viewer: lets recipients preview large booklets inline and download.
  return "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
}

function sendDeliveryEmail_(email, fileId, title) {
  var link = getDownloadLink_(fileId);
  var subject = "Your download: " + title;

  var plain =
    "Hi there,\n\n" +
    "Thank you so much — it genuinely means a lot that you wanted this.\n\n" +
    "Here's your copy of \"" + title + "\":\n" + link + "\n\n" +
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
        "Here&rsquo;s your copy of <strong>" + escapeHtml_(title) + "</strong>:</p>" +
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
