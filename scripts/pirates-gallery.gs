/**
 * Black Star Media — Southwest Metro Pirates U16 Gallery backend
 * ===============================================================
 * A Google Apps Script web app that powers /pirates/ on blackstarmedia.com.au.
 *
 * The page sends the team password here. If it matches, this script lists the
 * team's Google Drive folder and returns the albums as JSON:
 *   - every SUBFOLDER of the root folder is one album (one game / event)
 *   - name subfolders "YYYY-MM-DD Title", e.g. "2026-11-15 vs Northside Hornets",
 *     so they sort newest-first and show a proper date
 *   - photos/videos sitting directly in the root folder go into "More photos"
 *
 * The password lives in Script Properties on Google's side, never in the site
 * code, so it can't be read from the page source.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME SETUP
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. script.google.com → New project. Paste this whole file in (Code.gs).
 *    Name it "Black Star — Pirates Gallery".
 * 2. Set the password, EITHER:
 *      a) type it into CONFIG.PASSWORD below (only in your Apps Script copy —
 *         never commit it to the public repo), OR
 *      b) Project Settings (gear) → Script properties → GALLERY_PASSWORD.
 *    A Script property, if present, wins.
 * 3. Deploy → New deployment → type "Web app":
 *       Execute as:     Me (your account)
 *       Who has access: Anyone
 *    Click Deploy, authorise Drive (read-only) access, COPY the Web app URL (/exec).
 * 4. In pirates/index.html find:
 *       var ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
 *    Replace the placeholder with the URL. Commit and push. Done.
 *
 * Check it: open the /exec URL in a browser. You should see
 *   "service":"pirates-gallery", "passwordSet":true, "folderOk":true
 *
 * Changing the password later: edit CONFIG.PASSWORD and deploy a new version
 * (or edit the Script property — no redeploy needed for that).
 * Editing THIS code later: Deploy → Manage deployments → edit → New version
 * (keeps the same /exec URL).
 *
 * Drive sharing: the root folder must be "Anyone with the link can view".
 * Files added inside it inherit that, which is what lets the page show them.
 */

var CONFIG = {
  ROOT_FOLDER_ID: "18V0NO9Me4r8NFBcfgkihZS91B6iofCcu",
  // Private Drive JSON {"Name": [photoId, ...]} produced by the face-grouping step.
  // Lives OUTSIDE the shared gallery folder so only the owner can read it.
  // Looked up by name (newest non-trashed copy wins), so re-running the tagging
  // only needs a new file with this name — no script redeploy.
  PLAYERS_FILE_NAME: "Pirates gallery - player tags (private).json",
  PASSWORD: "", // set in your Apps Script copy only — do NOT commit the real value
  // Separate password for adding/removing player tags. Set it here in your
  // Apps Script copy (never commit it) or as Script property TAG_PASSWORD.
  // Blank = tagging disabled.
  TAG_PASSWORD: "",
  LOOSE_ALBUM_TITLE: "More photos",
  CACHE_SECONDS: 300 // listing is cached for 5 min to keep the page fast
};

// ─────────────────────────────────────────────────────────────────────────────

// Health check: open the /exec URL in a browser to see whether setup is complete.
function doGet() {
  var folderOk = false;
  try { DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID).getName(); folderOk = true; } catch (_) {}
  return json_({ ok: true, service: "pirates-gallery", passwordSet: !!getPassword_(), folderOk: folderOk });
}

function getPassword_() {
  var prop = PropertiesService.getScriptProperties().getProperty("GALLERY_PASSWORD");
  return String(prop || CONFIG.PASSWORD || "").trim();
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) { body = {}; }
    }

    var expected = getPassword_();
    if (!expected) return json_({ ok: false, error: "not_configured" });

    var given = String(body.password || "").trim().toLowerCase();
    if (!given || given !== String(expected).trim().toLowerCase()) {
      Utilities.sleep(1200); // slow down guessing
      return json_({ ok: false, error: "bad_password" });
    }

    if (body.action === "checkTagPassword") {
      return json_(tagAuthError_(body) || { ok: true });
    }
    if (body.action === "setTags") {
      return json_(tagAuthError_(body) || setTags_(String(body.photo || ""), body.players));
    }

    var albums = getAlbums_();
    return json_({ ok: true, albums: albums, roster: Object.keys(loadTags_().tags).sort(), updated: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server_error" });
  }
}

function getAlbums_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get("albums");
  if (cached) return JSON.parse(cached);

  var root = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  var albums = [];

  var folders = root.getFolders();
  while (folders.hasNext()) {
    var album = buildAlbum_(folders.next());
    if (album.items.length) albums.push(album);
  }

  var loose = listMedia_(root);
  if (loose.length) {
    albums.push({
      id: "more",
      title: CONFIG.LOOSE_ALBUM_TITLE,
      date: "",
      url: root.getUrl(),
      items: loose
    });
  }

  // Newest first; undated albums ("More photos") last.
  albums.sort(function (a, b) {
    if (a.date === b.date) return a.title.localeCompare(b.title);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date < b.date ? 1 : -1;
  });

  var out = JSON.stringify(albums);
  if (out.length < 95000) cache.put("albums", out, CONFIG.CACHE_SECONDS);
  return albums;
}

function buildAlbum_(folder) {
  var name = folder.getName().trim();
  var m = name.match(/^(\d{4}-\d{2}-\d{2})[\s_\-–—:]*(.*)$/);
  var date = m ? m[1] : Utilities.formatDate(folder.getDateCreated(), "Australia/Brisbane", "yyyy-MM-dd");
  var title = (m ? m[2] : name) || "Game day";
  return {
    id: folder.getId(),
    title: title,
    date: date,
    url: folder.getUrl(),
    items: listMedia_(folder)
  };
}

// photoId -> ["Name", ...]; empty map if the tags file is missing/unreadable.
// ---------- player tags (private Drive JSON: {"Name": [photoId, ...]}) ----------

// Newest non-trashed file with the configured name; {file: null, tags: {}} if none.
function loadTags_() {
  var out = { file: null, tags: {} };
  if (!CONFIG.PLAYERS_FILE_NAME) return out;
  try {
    var it = DriveApp.getFilesByName(CONFIG.PLAYERS_FILE_NAME);
    while (it.hasNext()) {
      var f = it.next();
      if (f.isTrashed()) continue;
      if (!out.file || f.getLastUpdated() > out.file.getLastUpdated()) out.file = f;
    }
    if (out.file) out.tags = JSON.parse(out.file.getBlob().getDataAsString());
  } catch (err) { console.error("player tags unreadable", err); }
  return out;
}

var PLAYER_INDEX_ = null;
function playerIndex_() {
  if (PLAYER_INDEX_) return PLAYER_INDEX_;
  PLAYER_INDEX_ = {};
  var tags = loadTags_().tags;
  Object.keys(tags).forEach(function (name) {
    tags[name].forEach(function (id) { (PLAYER_INDEX_[id] = PLAYER_INDEX_[id] || []).push(name); });
  });
  return PLAYER_INDEX_;
}

function tagPassword_() {
  var prop = PropertiesService.getScriptProperties().getProperty("TAG_PASSWORD");
  return String(prop || CONFIG.TAG_PASSWORD || "").trim();
}

// null when the request carries the right tagging password, else an error payload.
function tagAuthError_(body) {
  var expected = tagPassword_();
  if (!expected) return { ok: false, error: "tagging_disabled" };
  if (String(body.tagPassword || "").trim() !== expected) {
    Utilities.sleep(1200);
    return { ok: false, error: "bad_tag_password" };
  }
  return null;
}

// Replace the full list of players tagged in one photo. New names join the roster.
function setTags_(photoId, players) {
  if (!/^[A-Za-z0-9_-]{10,}$/.test(photoId)) return { ok: false, error: "bad_photo" };
  // The photo must be inside the gallery folder tree.
  try {
    var parents = DriveApp.getFileById(photoId).getParents(), inside = false;
    while (parents.hasNext()) {
      var p = parents.next();
      if (p.getId() === CONFIG.ROOT_FOLDER_ID) { inside = true; break; }
      var gp = p.getParents();
      while (gp.hasNext()) if (gp.next().getId() === CONFIG.ROOT_FOLDER_ID) inside = true;
    }
    if (!inside) return { ok: false, error: "bad_photo" };
  } catch (_) { return { ok: false, error: "bad_photo" }; }

  var names = [];
  (Array.isArray(players) ? players : []).forEach(function (n) {
    n = String(n || "").replace(/\s+/g, " ").trim();
    if (/^[A-Za-z][A-Za-z '\-]{0,29}$/.test(n) && names.indexOf(n) < 0) names.push(n);
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var t = loadTags_(), tags = t.tags;
    Object.keys(tags).forEach(function (name) {
      tags[name] = tags[name].filter(function (id) { return id !== photoId; });
    });
    names.forEach(function (name) {
      (tags[name] = tags[name] || []).push(photoId);
    });
    var json = JSON.stringify(tags);
    if (t.file) t.file.setContent(json);
    else DriveApp.createFile(CONFIG.PLAYERS_FILE_NAME, json, "application/json"); // created private in My Drive
    CacheService.getScriptCache().remove("albums");
    return { ok: true, photo: photoId, players: names, roster: Object.keys(tags).sort() };
  } finally {
    lock.releaseLock();
  }
}

function listMedia_(folder) {
  var items = [], tags = playerIndex_();
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var mime = f.getMimeType() || "";
    var type = mime.indexOf("image/") === 0 ? "image" : mime.indexOf("video/") === 0 ? "video" : "";
    if (!type) continue;
    var item = { id: f.getId(), type: type, name: f.getName() };
    if (tags[item.id]) item.players = tags[item.id];
    items.push(item);
  }
  // Camera file names (IMG_0001…) sort into shooting order.
  items.sort(function (a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  return items;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
