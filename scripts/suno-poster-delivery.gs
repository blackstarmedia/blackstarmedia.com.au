/**
 * Black Star Media — Suno Poster Email Delivery
 * =============================================
 * A Google Apps Script web app that powers the email capture on suno-poster.html.
 * When a visitor submits their email it:
 *   1. validates the request (email + consent),
 *   2. logs the address to a Google Sheet,
 *   3. emails them the poster as an attachment (fetched from the live site).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME SETUP
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. script.google.com → New project. Paste this whole file in (Code.gs).
 *    Name it "Black Star — Suno Poster Delivery".
 * 2. No config constants to change — everything is set in CONFIG below.
 * 3. Deploy → New deployment → type "Web app":
 *       Execute as:     Me (your account)
 *       Who has access: Anyone
 *    Click Deploy, authorise the scopes, and COPY the Web app URL (/exec).
 * 4. In suno-poster.html find the line:
 *       var ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
 *    Replace the placeholder with the URL you just copied.
 * 5. Commit and push suno-poster.html. Done.
 *
 * The signups Sheet is created automatically on the first submission.
 * To use an existing Sheet, paste its ID into CONFIG.SHEET_ID below.
 */

var CONFIG = {
  // URL of the PDF on your live site — must be publicly accessible.
  PDF_URL:      "https://blackstarmedia.com.au/assets/pdf/suno-visualized-dl-poster.pdf",
  PDF_FILENAME: "Suno-Visualized-Deep-Learning-Poster.pdf",
  PDF_TITLE:    "Suno AI — Deep Learning Visualized",

  // Leave blank to auto-create a Sheet on first run.
  SHEET_ID:   "",
  SHEET_NAME: "Suno Poster Signups",

  // Email identity (Australia's Spam Act requires sender identification).
  SENDER_NAME:       "Louis — Black Star Media",
  REPLY_TO:          "contact@blackstarmedia.com.au",
  BUSINESS_NAME:     "Black Star Media & Entertainment",
  BUSINESS_LOCATION: "Brisbane, QLD, Australia",
  UNSUBSCRIBE_EMAIL: "contact@blackstarmedia.com.au",
  SITE_URL:          "https://blackstarmedia.com.au"
};

// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return json_({ ok: true, service: "suno-poster-delivery" });
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); }
      catch (_) { body = (e.parameter || {}); }
    } else {
      body = (e && e.parameter) || {};
    }

    var email   = String(body.email   || "").trim();
    var consent = body.consent === true || body.consent === "true" || body.consent === "on";
    var source  = String(body.source  || "").slice(0, 300);

    if (!isValidEmail_(email)) return json_({ ok: false, error: "invalid_email" });
    if (!consent)              return json_({ ok: false, error: "consent_required" });

    logSignup_(email, consent, source);
    sendEmail_(email);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server_error", detail: String(err) });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id    = CONFIG.SHEET_ID || props.getProperty("SUNO_SHEET_ID");
  var ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create("Black Star — Suno Poster Signups");
    props.setProperty("SUNO_SHEET_ID", ss.getId());
  }
  var sh = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Timestamp", "Email", "Consent", "Source"]);
  }
  return sh;
}

function logSignup_(email, consent, source) {
  getSheet_().appendRow([new Date(), email, consent ? "yes" : "no", source]);
}

function sendEmail_(email) {
  // Fetch the PDF from the live site and attach it directly to the email.
  var pdfBlob = UrlFetchApp.fetch(CONFIG.PDF_URL)
    .getBlob()
    .setName(CONFIG.PDF_FILENAME);

  var downloadLink = CONFIG.SITE_URL + "/assets/pdf/suno-visualized-dl-poster.pdf";
  var workshopsLink = CONFIG.SITE_URL + "#workshops";
  var subject = "Your download: " + CONFIG.PDF_TITLE;
  var siteShort = CONFIG.SITE_URL.replace(/^https?:\/\//, "");

  var plain =
    "Hi there,\n\n" +
    "Here’s your copy of the " + CONFIG.PDF_TITLE + " poster — I’ve attached it to this email.\n\n" +
    "You can also view or download it any time here:\n" + downloadLink + "\n\n" +
    "I hope it’s genuinely useful. If you want to go deeper on AI music tools, " +
    "our AI:M Workshops cover Suno, ChatGPT, Midjourney and more:\n" + workshopsLink + "\n\n" +
    "Hit reply if you have questions — it comes straight to me.\n\n" +
    "Talk soon,\nLouis\n" + CONFIG.BUSINESS_NAME + "\n" + CONFIG.SITE_URL + "\n\n" +
    "—\n" +
    "You’re receiving this because you requested this resource at " + siteShort + ".\n" +
    CONFIG.BUSINESS_NAME + ", " + CONFIG.BUSINESS_LOCATION + ".\n" +
    "To unsubscribe from future updates, reply with “unsubscribe” or email " +
    CONFIG.UNSUBSCRIBE_EMAIL + ".";

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
      'max-width:560px;margin:0 auto;color:#111827;line-height:1.65;">' +

      // Header
      '<div style="background:#000;border-radius:14px;padding:28px 28px 22px;text-align:center;margin-bottom:4px;">' +
        '<p style="margin:0 0 10px;color:#CBD0D8;font-size:12px;letter-spacing:3px;' +
          'font-family:monospace;text-transform:uppercase;">BLACK &#9733; STAR MEDIA</p>' +
        '<h1 style="margin:0;color:#fff;font-size:21px;font-weight:700;line-height:1.2;">' +
          'Your poster is attached!</h1>' +
      '</div>' +

      // Body
      '<div style="padding:28px 8px;">' +
        '<p>Hi there,</p>' +
        '<p>Here&rsquo;s your copy of <strong>' + escHtml_(CONFIG.PDF_TITLE) + '</strong> &mdash; ' +
          'I&rsquo;ve attached it directly to this email so you can save it to any device.</p>' +

        '<p style="text-align:center;margin:28px 0;">' +
          '<a href="' + downloadLink + '" ' +
            'style="display:inline-block;background:#CBD0D8;color:#000;text-decoration:none;' +
            'font-weight:600;font-size:15px;padding:13px 28px;border-radius:999px;">' +
            'View poster online &rarr;' +
          '</a>' +
        '</p>' +

        '<p>If you want to go deeper on AI music tools, our ' +
          '<a href="' + workshopsLink + '" style="color:#000;font-weight:600;">AI:M Workshops</a> ' +
          'cover Suno, ChatGPT, Midjourney and more &mdash; beginner-friendly and fully online.</p>' +

        '<p style="margin-top:26px;">' +
          'Hit reply if you have any questions &mdash; your email comes straight to me.' +
        '</p>' +

        '<p style="margin-top:26px;">' +
          'Talk soon,<br/>' +
          '<strong>Louis</strong><br/>' +
          escHtml_(CONFIG.BUSINESS_NAME) + '<br/>' +
          '<a href="' + CONFIG.SITE_URL + '" style="color:#111827;">' + siteShort + '</a>' +
        '</p>' +
      '</div>' +

      // Footer / unsubscribe
      '<div style="border-top:1px solid #e5e7eb;padding:16px 8px;' +
        'color:#9ca3af;font-size:12px;line-height:1.6;">' +
        'You&rsquo;re receiving this because you requested this resource at ' + siteShort + '.<br/>' +
        escHtml_(CONFIG.BUSINESS_NAME) + ', ' + escHtml_(CONFIG.BUSINESS_LOCATION) + '.<br/>' +
        'To unsubscribe from future updates, reply with &ldquo;unsubscribe&rdquo; or email ' +
        '<a href="mailto:' + CONFIG.UNSUBSCRIBE_EMAIL + '" style="color:#9ca3af;">' +
          CONFIG.UNSUBSCRIBE_EMAIL +
        '</a>.' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to:          email,
    subject:     subject,
    body:        plain,
    htmlBody:    html,
    attachments: [pdfBlob],
    name:        CONFIG.SENDER_NAME,
    replyTo:     CONFIG.REPLY_TO
  });
}

function escHtml_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
