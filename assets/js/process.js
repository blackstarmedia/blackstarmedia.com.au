/* ==========================================================================
   Black Star Media — "How We Work" inline pipeline accordion (index.html)
   Same six-stage content and collapse/expand interaction as pipeline.html,
   restyled with the homepage's design tokens (pl- prefixed classes) and
   scoped in its own IIFE. The stand-alone Pipeline page keeps the extra
   07/PROOF "Projects" stage — this inline copy covers the process itself.
   ========================================================================== */
(function () {
  "use strict";

  var app = document.getElementById("processApp");
  if (!app) return;

  var I = {
    bulb: '<path d="M12 3a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11z"/><path d="M10 20h4"/>',
    star: '<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>',
    lines: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    wave: '<path d="M3 12h2l2-6 3 12 3-9 2 5h6"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    cut: '<path d="M4 7l16 0M4 12l16 0M4 17l10 0"/><circle cx="18" cy="17" r="2.4"/>',
    yt: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
    tiktok: '<path d="M9 3v12.5a3.5 3.5 0 1 1-3-3.46"/><path d="M9 3c1 2.5 3 4 6 4"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4"/>',
    spotify: '<circle cx="12" cy="12" r="9"/><path d="M7.5 10c3-1 6-.5 8.5 1M8 13c2.2-.7 4.5-.4 6.3.9"/>',
    teach: '<path d="M3 7h18v11H3z"/><path d="M8 7V5h8v2M3 12h18"/>'
  };

  var STAGES = [
    { num: "01 / IDEATION", title: "Ideas & Concepts",
      desc: "Where it begins. Use conversational AI to find angles, test premises, and shape a concept before a single asset is made.",
      subs: [
        { icon: "bulb", label: "ChatGPT", tools: "brainstorm · expand", note: "Fast, broad ideation. Great for riffing on lots of directions and stress-testing a hook quickly.",
          tasks: ["Dump a rough topic and ask for 20 angles", "Pressure-test the hook against the audience", "Cluster the best ideas into a series", "Pick a working title and one-line premise"] },
        { icon: "star", label: "Gemini", tools: "research · grounding", note: "Strong for fact-anchored concepts and pulling in current context to ground an idea in what is real.",
          tasks: ["Validate the idea against current trends", "Pull supporting facts, stats, and references", "Check what competitors already covered", "Find a fresh angle the topic is missing"] },
        { icon: "lines", label: "Claude", tools: "structure · nuance", note: "Best for long-form thinking and refining a concept into a clear, well-reasoned outline.",
          tasks: ["Turn the raw idea into a structured outline", "Define the narrative arc start to finish", "Flag weak points and logical gaps", "Lock the final concept brief"] }
      ] },
    { num: "02 / DIRECTION", title: "Prompt",
      desc: "The concept becomes instruction. Write the prompts that tell every downstream tool exactly what to make.",
      subs: [
        { icon: "bulb", label: "ChatGPT", tools: "drafting · variations", note: "Quickly spin up prompt variants and iterate on wording to dial in tone and detail.",
          tasks: ["Draft the first prompt from the brief", "Generate 3–5 wording variations", "A/B the variants, keep the strongest", "Note what phrasing moved the output"] },
        { icon: "star", label: "Gemini", tools: "multimodal cues", note: "Useful when a prompt needs to reference images or live data to steer the output.",
          tasks: ["Attach reference images or links", "Describe the visual style concretely", "Pull live data the prompt should reflect", "Merge text and image direction"] },
        { icon: "lines", label: "Claude", tools: "precision · system prompts", note: "Excels at detailed, rule-heavy prompts and reusable templates that keep output consistent.",
          tasks: ["Write a constraint-led master prompt", "Build a reusable template for the series", "Add guardrails to stay on-brand", "Document the prompt for reuse"] }
      ] },
    { num: "03 / PRODUCTION", title: "Content Generators",
      desc: "Prompts become raw media. Generate the sound, motion, and imagery that make up the piece.",
      subs: [
        { icon: "wave", label: "Audio", tools: "Suno · ElevenLabs", note: "Suno writes full tracks from a prompt; ElevenLabs voices narration and dialogue. Music and voice, covered.",
          tasks: ["Generate a track or full song in Suno", "Render voiceover in ElevenLabs", "Pick a consistent voice for the series", "Export clean stems for editing"] },
        { icon: "film", label: "Video", tools: "Kling · OpenArt · Flow", note: "Text-to-video and image-to-video clips. Generate motion, scenes, and animated sequences from a description.",
          tasks: ["Generate scene clips from prompts", "Use image-to-video for controlled shots", "Create B-roll and transitions", "Export clips at target resolution"] },
        { icon: "image", label: "Image", tools: "ChatGPT · Gemini", note: "Generate thumbnails, stills, and visual assets on demand for covers and in-video graphics.",
          tasks: ["Generate thumbnail options", "Create stills and overlay graphics", "Make cover art for audio releases", "Upscale and tidy chosen assets"] }
      ] },
    { num: "04 / ASSEMBLY", title: "Content Compilation",
      desc: "Scattered assets become one finished cut. Edit, sync, and arrange everything into the final piece.",
      subs: [
        { icon: "cut", label: "CapCut", tools: "edit · sync · export", note: "The assembly bench. Cut clips, layer audio, add captions and effects, then export ready-to-post versions for each platform.",
          tasks: ["Lay clips and audio on the timeline", "Sync cuts to beat and voiceover", "Add captions, titles, and effects", "Export tailored versions per platform"] }
      ] },
    { num: "05 / DISTRIBUTION", title: "Platforms",
      desc: "The finished cut goes live. Publish to where the audience already is — and tailor the format to each.",
      subs: [
        { icon: "yt", label: "YouTube", tools: "long-form · home base", note: "The anchor channel for full-length content, searchable library, and the main monetisation engine.",
          tasks: ["Upload the long-form master cut", "Write SEO title, description, tags", "Set thumbnail and end screens", "Schedule the publish slot"] },
        { icon: "tiktok", label: "TikTok", tools: "short · discovery", note: "Vertical short-form built for reach. Best for hooks, trends, and pulling new viewers into the funnel.",
          tasks: ["Cut a vertical short from the master", "Hook hard in the first 2 seconds", "Add trending audio and on-screen text", "Post at peak time with hashtags"] },
        { icon: "ig", label: "Instagram", tools: "reels · community", note: "Reels and posts for audience-building and brand presence, with strong cross-promotion back to YouTube.",
          tasks: ["Repurpose the short as a Reel", "Add a cover frame and caption", "Cross-link to the YouTube upload", "Reply to comments to build community"] }
      ] },
    { num: "06 / RETURN", title: "Monetisation",
      desc: "The work pays back. Turn views, listens, and skills into multiple income streams.",
      subs: [
        { icon: "coin", label: "Ads", tools: "AdSense · YouTube · Google Ads", note: "Revenue from views via the YouTube Partner Programme and AdSense, scaled by paid promotion when it pays for itself.",
          tasks: ["Hit the Partner Programme thresholds", "Enable monetisation and ad placements", "Link AdSense for payout", "Reinvest in Google Ads where ROI is positive"] },
        { icon: "spotify", label: "Spotify", tools: "streaming royalties", note: "Distribute generated music for per-stream royalties and a catalogue that earns passively over time.",
          tasks: ["Distribute tracks via an aggregator", "Build a release and playlist plan", "Grow a catalogue that earns passively", "Track per-stream royalties over time"] },
        { icon: "teach", label: "Workshops", tools: "teach · high-margin", note: "Package the whole pipeline as a paid skill — the highest-margin stream, selling the know-how itself.",
          tasks: ["Package the pipeline into a course", "Set pricing and session format", "Promote to the existing audience", "Deliver live and collect testimonials"] }
      ] }
  ];

  function subBody(s) {
    return (
      '<p class="pl-sub-note">' + s.note + "</p>" +
      '<button class="pl-tasks-btn" aria-expanded="false"><span class="pl-plus">+</span> Detailed tasks</button>' +
      '<div class="pl-panel"><ul class="pl-tasks">' + s.tasks.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>"
    );
  }

  STAGES.forEach(function (st) {
    var subsHTML = st.subs.map(function (s) {
      return (
        '<div class="pl-sub" data-open="false">' +
          '<button class="pl-sub-btn" aria-expanded="false">' +
            '<span class="pl-glyph"><svg viewBox="0 0 24 24">' + I[s.icon] + "</svg></span>" +
            '<span class="pl-sub-meta"><span class="pl-sub-label">' + s.label + '</span><span class="pl-sub-tools">' + s.tools + "</span></span>" +
            '<span class="pl-chev"></span>' +
          "</button>" +
          '<div class="pl-panel"><div class="pl-sub-body">' + subBody(s) + "</div></div>" +
        "</div>"
      );
    }).join("");

    app.insertAdjacentHTML("beforeend",
      '<section class="pl-stage">' +
        '<button class="pl-stage-btn" aria-expanded="false">' +
          '<span class="pl-stage-num">' + st.num + "</span>" +
          '<span class="pl-stage-title">' + st.title + "</span>" +
          '<span class="pl-toggle"></span>' +
        "</button>" +
        '<div class="pl-panel"><div class="pl-panel-inner">' +
          '<p class="pl-stage-desc">' + st.desc + "</p>" +
          subsHTML +
        "</div></div>" +
      "</section>"
    );
  });

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
