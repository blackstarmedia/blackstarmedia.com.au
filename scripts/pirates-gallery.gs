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
 * 2. Project Settings (gear icon) → Script properties → Add script property:
 *       Property: GALLERY_PASSWORD     Value: <the team password>
 * 3. Deploy → New deployment → type "Web app":
 *       Execute as:     Me (your account)
 *       Who has access: Anyone
 *    Click Deploy, authorise Drive (read-only) access, COPY the Web app URL (/exec).
 * 4. In pirates/index.html find:
 *       var ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
 *    Replace the placeholder with the URL. Commit and push. Done.
 *
 * Changing the password later: edit the Script property. No redeploy needed.
 * Editing THIS code later: Deploy → Manage deployments → edit → New version
 * (keeps the same /exec URL).
 *
 * Drive sharing: the root folder must be "Anyone with the link can view".
 * Files added inside it inherit that, which is what lets the page show them.
 */

var CONFIG = {
  ROOT_FOLDER_ID: "18V0NO9Me4r8NFBcfgkihZS91B6iofCcu",
  LOOSE_ALBUM_TITLE: "More photos",
  CACHE_SECONDS: 300 // listing is cached for 5 min to keep the page fast
};

// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return json_({ ok: true, service: "pirates-gallery" });
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) { body = {}; }
    }

    var expected = PropertiesService.getScriptProperties().getProperty("GALLERY_PASSWORD");
    if (!expected) return json_({ ok: false, error: "not_configured" });

    var given = String(body.password || "").trim().toLowerCase();
    if (!given || given !== String(expected).trim().toLowerCase()) {
      Utilities.sleep(1200); // slow down guessing
      return json_({ ok: false, error: "bad_password" });
    }

    return json_({ ok: true, albums: getAlbums_(), updated: new Date().toISOString() });
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

function listMedia_(folder) {
  var items = [];
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var mime = f.getMimeType() || "";
    var type = mime.indexOf("image/") === 0 ? "image" : mime.indexOf("video/") === 0 ? "video" : "";
    if (!type) continue;
    items.push({ id: f.getId(), type: type, name: f.getName() });
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
