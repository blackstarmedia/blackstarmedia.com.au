/* ============================================================
   Black Star Media — Cookie consent banner + Google Consent Mode
   ------------------------------------------------------------
   Pairs with the "consent default" snippet that must run in
   <head> before the AdSense (adsbygoogle.js) script tag on every
   page. This file renders the banner, stores the visitor's
   choice, and calls gtag('consent','update', …) accordingly.
   Required for AdSense's EU User Consent Policy (EEA/UK/CH).
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "bsm_consent";

  function getStoredConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function storeConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage unavailable */ }
  }

  function updateConsent(granted) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied"
    });
  }

  function injectStyles() {
    if (document.getElementById("cookieBannerStyles")) return;
    var style = document.createElement("style");
    style.id = "cookieBannerStyles";
    style.textContent =
      ".cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:999;display:flex;flex-wrap:wrap;" +
      "gap:1rem 1.5rem;align-items:center;justify-content:space-between;padding:1.1rem clamp(1.25rem,5vw,2.5rem);" +
      "background:rgba(14,16,19,0.97);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,0.12);" +
      "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;" +
      "transform:translateY(120%);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1)}" +
      ".cookie-banner.is-visible{transform:translateY(0)}" +
      ".cookie-banner__text{flex:1 1 320px;font-size:0.88rem;line-height:1.55;color:rgba(255,255,255,0.82);margin:0}" +
      ".cookie-banner__text a{color:#CBD0D8;text-decoration:underline;text-underline-offset:2px}" +
      ".cookie-banner__actions{display:flex;gap:0.7rem;flex-wrap:wrap}" +
      ".cookie-banner__btn{font:inherit;font-size:0.82rem;font-weight:600;letter-spacing:0.01em;cursor:pointer;" +
      "padding:0.6rem 1.1rem;border-radius:999px;border:1px solid rgba(255,255,255,0.18);background:transparent;" +
      "color:#fff;transition:background 0.2s ease,border-color 0.2s ease;white-space:nowrap}" +
      ".cookie-banner__btn:hover{border-color:rgba(255,255,255,0.4)}" +
      ".cookie-banner__btn--accept{background:#CBD0D8;color:#000;border-color:#CBD0D8}" +
      ".cookie-banner__btn--accept:hover{background:#E8EBEF;border-color:#E8EBEF}" +
      "@media(max-width:640px){.cookie-banner{justify-content:center;text-align:center}.cookie-banner__actions{width:100%;justify-content:center}}";
    document.head.appendChild(style);
  }

  function renderBanner() {
    injectStyles();
    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<p class="cookie-banner__text">' +
      "We use cookies, including Google&rsquo;s advertising cookies, to run this site and show relevant ads. " +
      'See our <a href="/privacy.html">Privacy Policy</a> for details.' +
      "</p>" +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="cookie-banner__btn cookie-banner__btn--reject" id="cookieReject">Reject non-essential</button>' +
      '<button type="button" class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAccept">Accept all</button>' +
      "</div>";
    document.body.appendChild(banner);

    requestAnimationFrame(function () { banner.classList.add("is-visible"); });

    function dismiss() {
      banner.classList.remove("is-visible");
      setTimeout(function () { banner.remove(); }, 500);
    }

    document.getElementById("cookieAccept").addEventListener("click", function () {
      storeConsent("granted");
      updateConsent(true);
      dismiss();
    });
    document.getElementById("cookieReject").addEventListener("click", function () {
      storeConsent("denied");
      updateConsent(false);
      dismiss();
    });
  }

  function init() {
    var stored = getStoredConsent();
    if (stored === "granted") { updateConsent(true); return; }
    if (stored === "denied") { return; } // stays denied, matches the default
    renderBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
