(function () {
  const LISTS = window.LISTS;
  const TOOLS = window.TOOLS;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const logo = (k) => `assets/logos/${k}.png`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = (id) => document.getElementById(id);

  // ---------- Typewriter headline ----------
  // Types each word letter by letter, holds it, backspaces, then types the next.
  const words = ["D2C founders", "logistics shippers", "dental clinics", "M&A advisors", "finance leaders", "manufacturers", "marketing agencies"];
  const rot = $("rot");
  if (!reduce) {
    let wi = 0, ci = words[0].length, deleting = true;
    const TYPE = 70, DELETE = 38, HOLD = 2000, GAP = 260;
    const tick = () => {
      const w = words[wi];
      if (deleting) {
        ci--;
        rot.textContent = w.slice(0, ci);
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; return setTimeout(tick, GAP); }
        return setTimeout(tick, DELETE);
      }
      const next = words[wi];
      ci++;
      rot.textContent = next.slice(0, ci);
      if (ci >= next.length) { deleting = true; return setTimeout(tick, HOLD); }
      setTimeout(tick, TYPE + Math.random() * 40);
    };
    setTimeout(tick, HOLD);
  }

  // ---------- Count-up proof numbers ----------
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduce) return;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));

  // ---------- Filters ----------
  const state = { industry: "All" };
  const industries = [];
  LISTS.forEach((l) => l.industries.forEach((v) => { if (!industries.includes(v)) industries.push(v); }));
  function renderFilters() {
    $("industry-filters").innerHTML = ["All", ...industries].map((v) => {
      const n = v === "All" ? LISTS.length : LISTS.filter((l) => l.industries.includes(v)).length;
      return `<button class="chip" data-val="${esc(v)}" aria-pressed="${state.industry === v}">${esc(v)}<span class="n">${n}</span></button>`;
    }).join("");
  }
  $("industry-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.industry = b.dataset.val;
    renderFilters();
    renderCards();
  });

  // ---------- Revolving carousel (new cards) ----------
  const track = $("track");
  const HEADS = window.HEADS || {}, FLOWS = window.FLOWS || {};

  const toolsOf = (l) => {
    const f = FLOWS[l.id];
    const all = f ? f.flatMap((s) => (s.par ? s.par : [s]).flatMap((n) => n.tools)) : l.steps.flatMap((s) => s[2]);
    return all.filter((t, j, a) => a.indexOf(t) === j && TOOLS[t]);
  };
  const stepTitles = (l) => {
    const f = FLOWS[l.id];
    if (!f) return l.steps.map((s) => s[0]);
    return f.map((s) => (s.par ? s.par.map((n) => n.t).join(" + ") : s.t));
  };

  // card copy: earlier wording (quoted pain question + "who it finds"), with overrides from window.CARD
  const cardTitle = (l) => ((window.CARD || {})[l.id] || {}).title || `“${l.pain}”`;
  const cardDesc = (l) => ((window.CARD || {})[l.id] || {}).desc || l.title;

  function cardHtml(l) {
    const proof = !l.video && window.PROOF && window.PROOF[l.id];
    const thumb = proof
      ? `<div class="pc-thumb"><img src="${proof.img}" alt="${esc(proof.alt)}" loading="lazy"></div>`
      : window.THUMBS[l.id]
        ? `<div class="pc-thumb"><img src="${window.THUMBS[l.id]}" alt="" loading="lazy"><span class="play">▶</span></div>`
        : `<div class="pc-thumb"><div class="lv" data-live></div></div>`;
    return `
      <article class="pcard" data-id="${l.id}">
        ${thumb}
        <div class="pc-body">
          <span class="pc-tag">${esc(l.industries[0])}</span>
          <h3 class="pc-title">${esc(cardTitle(l))}</h3>
          <p class="pc-desc">${esc(cardDesc(l))}</p>
          ${l.stat ? `<p class="pc-stat">${esc(l.stat)}</p>` : ""}
          <div class="pc-logos">${toolsOf(l).slice(0, 7).map((t) => `<img src="${logo(t)}" alt="${esc(TOOLS[t])}" title="${esc(TOOLS[t])}">`).join("")}</div>
        </div>
        <div class="pc-rule"></div>
        <button class="pc-cta" type="button">See the workflow <span>→</span></button>
      </article>`;
  }

  // live workflow thumbnail for projects with no video or screenshot (drawn in a 320×180 box)
  const LV_NODES = [
    { x: 62, y: 60, logo: "crunchbase", b: "Funding", s: "Seed · $3.2M" },
    { x: 160, y: 60, logo: "gmaps", b: "Office", s: "Reg. no. found" },
    { x: 258, y: 60, logo: "linkedin", b: "Job posts", s: "“In office”" },
    { x: 240, y: 132, logo: "openai", b: "Intent", s: "0/7" },
    { x: 92, y: 132, logo: "clay", b: "Tier A", s: "3 buyers", win: true }
  ];
  const LV_PATH = "M62,60 L258,60 C306,60 306,132 240,132 L92,132";
  function initLive(root) {
    root.querySelectorAll("[data-live]").forEach((box) => {
      box.innerHTML = `<svg viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true"><path class="lv-track" d="${LV_PATH}"/><path class="lv-lit" d="${LV_PATH}"/><circle class="lv-dot" r="4.5"/></svg>
        <span class="lv-label"><i></i>Live workflow</span>` +
        LV_NODES.map((n) => `<div class="lv-node" style="left:${(n.x / 320) * 100}%;top:${(n.y / 180) * 100}%"><img src="${logo(n.logo)}" alt=""><span><b>${n.b}</b><small>${n.s}</small></span>${n.win ? '<span class="lv-avs"><span></span><span></span><span></span></span>' : ""}</div>`).join("");
      const lit = box.querySelector(".lv-lit"), dot = box.querySelector(".lv-dot");
      const nodes = [...box.querySelectorAll(".lv-node")], counter = nodes[3].querySelector("small");
      const L = lit.getTotalLength(), CYCLE = 6.4, TRAVEL = 4.2;
      lit.style.strokeDasharray = L;
      const at = LV_NODES.map((n) => {
        let best = 0, bd = 1e9;
        for (let i = 0; i <= 200; i++) { const p = lit.getPointAtLength((L * i) / 200); const d = (p.x - n.x) ** 2 + (p.y - n.y) ** 2; if (d < bd) { bd = d; best = i / 200; } }
        return best;
      });
      const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
      const tIntent = TRAVEL * (Math.acos(1 - 2 * at[3]) / Math.PI);
      function paint(t) {
        const e = ease(Math.min(1, t / TRAVEL)), p = lit.getPointAtLength(L * e);
        dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y);
        dot.style.opacity = t > CYCLE - 0.5 ? String(Math.max(0, (CYCLE - t) / 0.5)) : "1";
        lit.style.strokeDashoffset = L * (1 - e);
        nodes.forEach((el, i) => el.classList.toggle("on", e >= at[i] - 0.005 && i < nodes.length - 1));
        nodes[nodes.length - 1].classList.toggle("win", e >= 0.999 && t < CYCLE - 0.35);
        counter.textContent = t < tIntent ? "0/7" : `${Math.min(6, Math.floor((t - tIntent) * 14))}/7`;
      }
      if (reduce) { paint(TRAVEL + 0.5); return; }
      let vis = true;
      const t0 = performance.now();
      new IntersectionObserver(([en]) => (vis = en.isIntersecting)).observe(box);
      (function loop(now) {
        if (!box.isConnected) return;
        if (vis) paint(((now - t0) / 1000) % CYCLE);
        requestAnimationFrame(loop);
      })(t0);
    });
  }

  let pos = 0, paused = false, holdUntil = 0, looping = false, visibleOnScreen = true;
  function renderCards() {
    const items = LISTS.filter((l) => state.industry === "All" || l.industries.includes(state.industry));
    looping = items.length >= 3 && !reduce;
    const html = items.map(cardHtml).join("");
    track.innerHTML = looping ? html + html : html;
    track.classList.toggle("static", !looping);
    if (looping) track.querySelectorAll(".pcard").forEach((c, i) => { if (i >= items.length) { c.setAttribute("aria-hidden", "true"); c.querySelector(".pc-cta").tabIndex = -1; } });
    initLive(track);
    pos = 0; track.scrollLeft = 0;
  }
  const half = () => track.scrollWidth / 2;
  function frame() {
    if (looping && !paused && visibleOnScreen && performance.now() > holdUntil && !$("sheet").open) {
      pos += 0.95;
      if (pos >= half()) pos -= half();
      track.scrollLeft = pos;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  track.addEventListener("mouseenter", () => (paused = true));
  track.addEventListener("mouseleave", () => { paused = false; pos = track.scrollLeft; });
  track.addEventListener("focusin", () => (paused = true));
  track.addEventListener("focusout", () => { paused = false; pos = track.scrollLeft; });
  track.addEventListener("pointerdown", () => (holdUntil = performance.now() + 4000));
  track.addEventListener("scroll", () => {
    if (performance.now() < holdUntil || paused) {
      if (looping && track.scrollLeft >= half()) track.scrollLeft -= half();
      pos = track.scrollLeft;
    }
  }, { passive: true });
  new IntersectionObserver(([e]) => (visibleOnScreen = e.isIntersecting)).observe(track);
  function nudge(dir) {
    const c = track.querySelector(".pcard");
    const w = c ? c.getBoundingClientRect().width + 20 : 520;
    holdUntil = performance.now() + 2500;
    if (looping && dir < 0 && track.scrollLeft < w) track.scrollLeft += half();
    track.scrollBy({ left: dir * w, behavior: "smooth" });
  }
  $("prev").addEventListener("click", () => nudge(-1));
  $("next").addEventListener("click", () => nudge(1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
  });
  track.addEventListener("click", (e) => { const c = e.target.closest(".pcard"); if (c) open(c.dataset.id); });

  // ---------- Workflow flowchart (inside the detail sheet) ----------
  const toolImgs = (ts) => ts.filter((t) => TOOLS[t]).map((t) => `<img src="${logo(t)}" alt="" title="${esc(TOOLS[t])}">`).join("");
  const nodeHtml = (n, k) => `
    <div class="wf-node">
      <span class="wf-k">${k}</span>
      <div class="wf-tx"><b>${esc(n.t)}</b><p>${esc(n.d)}</p>${n.tools && n.tools.length ? `<span class="wf-tools">${toolImgs(n.tools)}</span>` : ""}</div>
    </div>`;
  const sideHtml = (n) => (n.drop ? `<span class="wf-drop"><i>✕</i>${esc(n.drop)}</span>` : "") + (n.note ? `<span class="wf-note">${esc(n.note)}</span>` : "");
  function flowHtml(l) {
    const f = FLOWS[l.id] || l.steps.map((s) => ({ t: s[0], d: s[1], tools: s[2] }));
    let k = 0;
    return `<ol class="wf">${f.map((s) => {
      if (s.par) {
        const nodes = s.par.map((n) => { k++; return `<div class="wf-cell">${nodeHtml(n, String(k).padStart(2, "0"))}${sideHtml(n) ? `<div class="wf-side">${sideHtml(n)}</div>` : ""}</div>`; }).join("");
        const label = s.join === "or" ? "Either signal qualifies" : "Merged into one list";
        return `<li class="wf-row wf-par"><div class="wf-pair">${nodes}</div><span class="wf-join ${s.join}">${label}</span>${s.par.some((n) => n.n) ? `<span class="wf-count">${esc(s.par.map((n) => n.n).filter(Boolean).join(" · "))}</span>` : ""}</li>`;
      }
      k++;
      return `<li class="wf-row">${nodeHtml(s, String(k).padStart(2, "0"))}<div class="wf-side">${sideHtml(s)}</div>${s.n ? `<span class="wf-count">${esc(s.n)}</span>` : ""}</li>`;
    }).join("")}</ol>`;
  }

  // ---------- Detail sheet ----------
  // A video is either a Google Drive file ID or "loom:<id>".
  function videoUrls(v) {
    if (v.startsWith("loom:")) {
      const id = encodeURIComponent(v.slice(5));
      return { embed: `https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true&hideEmbedTopBar=true`, view: `https://www.loom.com/share/${id}`, host: "Loom" };
    }
    const id = encodeURIComponent(v);
    return { embed: `https://drive.google.com/file/d/${id}/preview`, view: `https://drive.google.com/file/d/${id}/view`, host: "Drive" };
  }
  const sheet = $("sheet");
  function open(id, push = true) {
    const l = LISTS.find((x) => x.id === id);
    if (!l) return;
    $("sheet-body").innerHTML = `
      <p class="eyebrow">${l.industries.map(esc).join(" · ")} · Built in ${esc(l.built.join(" + "))}</p>
      <h2 class="sheet-head" id="sheet-title">${esc(cardTitle(l))}</h2>
      <p class="sheet-sub">${esc(cardTitle(l).startsWith("“") ? (HEADS[l.id] || "") : `“${l.pain}”`)}</p>
      <p class="sc-icp"><span>Finds</span>${esc(l.title)}</p>

      ${l.video ? `
      <div class="video">
        <iframe src="${videoUrls(l.video).embed}" title="Walkthrough: ${esc(l.title)}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
      </div>
      <a class="video-link" href="${videoUrls(l.video).view}" target="_blank" rel="noopener">Open the walkthrough in ${videoUrls(l.video).host} ↗</a>` : ""}

      ${!l.video && window.PROOF && window.PROOF[l.id] ? `<figure class="proof-fig"><img src="${window.PROOF[l.id].img}" alt="${esc(window.PROOF[l.id].alt)}"><figcaption>${esc(window.PROOF[l.id].label)}</figcaption></figure>` : ""}

      <div class="problem"><span class="lbl">The problem</span><p>${esc(l.problem)}</p></div>

      <div class="wf-head"><span class="lbl">How the workflow runs</span><span class="wf-legend"><i class="lg-drop">✕</i> thrown out <i class="lg-count">→</i> what's left</span></div>
      ${flowHtml(l)}

      <div class="evolved"><span class="lbl">How it evolved</span><p>${esc(l.evolved)}</p></div>

      <div class="results">${l.results.map((r) => `<div><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div>`).join("")}</div>`;
    if (!reduce) $("sheet-body").querySelectorAll(".wf-row").forEach((r, i) => { r.style.animationDelay = (120 + i * 70) + "ms"; r.classList.add("wf-in"); });
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    if (push) history.replaceState(null, "", `#list/${id}`);
  }
  sheet.addEventListener("close", () => { $("sheet-body").innerHTML = ""; if (location.hash.startsWith("#list/")) history.replaceState(null, "", "#lists"); });
  $("close").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });



  renderFilters();
  renderCards();
  const m = location.hash.match(/^#list\/(.+)$/);
  if (m) open(m[1], false);
})();


// ---------- Tool flow (XP-style window) ----------
(function () {
  const grid = document.getElementById("flowgrid");
  if (!grid) return;
  const TOOLS = window.TOOLS;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FLOW = [
    { name: "Scrapers", sub: "find the raw market", tools: ["apify", "serper", "gmaps", "spider"],
      tick: ["scraping Google Maps for clinics…", "pulling directory listings…", "reading the Meta Ad Library…"] },
    { name: "Data providers", sub: "enrich and verify", tools: ["storeleads", "companyenrich", "aiark", "exa", "airscale", "prospeo", "icypeas", "debounce"],
      tick: ["finding founders…", "matching domains…", "verifying emails…"] },
    { name: "AI agents", sub: "qualify · tier · write", tools: ["claude", "cursor", "grok", "clay"], brain: true,
      tick: ["qualifying 753 brands…", "tiering by Meta ad count…", "writing copy per tier…"] },
    { name: "Sequencers", sub: "one channel at a time", tools: ["whatsapp", "msg91", "plusvibe", "smartlead", "instantly", "heyreach"],
      tick: ["sending WhatsApp touch 1…", "queueing email for day 6…", "connecting on LinkedIn…"] },
    { name: "CRMs + data", sub: "close the loop", tools: ["hubspot", "salesforce", "sheets", "supabase"],
      tick: ["logging replies…", "lead marked interested → SDR pinged…"] }
  ];
  const AUTO = ["n8n", "make", "zapier", "postman", "metabase"];
  const icon = (k) => `<span class="ti"><img src="assets/logos/${k}.png" alt="">${esc(TOOLS[k])}</span>`;

  grid.innerHTML = FLOW.map((n, i) => `
    <div class="node${n.brain ? " brain" : ""}" data-i="${i}">
      <div class="node-head"><span class="nh-n">${String(i + 1).padStart(2, "0")}</span>${esc(n.name)}</div>
      <div class="node-sub">${esc(n.sub)}</div>
      <div class="node-tools">${n.tools.map(icon).join("")}</div>
    </div>
    ${i < FLOW.length - 1 ? `<div class="pipe" data-i="${i}"><i></i><i></i><i></i></div>` : ""}`).join("");
  document.getElementById("autobar").innerHTML =
    `<span class="ab-label">Automation<small>the glue under every step</small></span><span class="ab-tools">${AUTO.map(icon).join("")}</span>`;

  const nodes = grid.querySelectorAll(".node");
  const pipes = grid.querySelectorAll(".pipe");
  const ticker = document.getElementById("ticker");
  let stage = 0;
  function show(s) {
    nodes.forEach((n, i) => n.classList.toggle("active", i === s));
    pipes.forEach((p, i) => p.classList.toggle("live", i === s));
    const t = FLOW[s].tick;
    ticker.textContent = t[Math.floor(Math.random() * t.length)];
  }
  show(0);
  if (!reduce) {
    let onScreen = false;
    new IntersectionObserver(([e]) => (onScreen = e.isIntersecting)).observe(grid);
    setInterval(() => { if (!onScreen) return; stage = (stage + 1) % FLOW.length; show(stage); }, 1700);
  }
})();

// ---------- Email toggle ----------
(function () {
  const btn = document.getElementById("mail-toggle");
  const pop = document.getElementById("mail-pop");
  const copy = document.getElementById("mail-copy");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const open = pop.hidden;
    pop.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.classList.toggle("on", open);
  });
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("amankaushik2099@gmail.com"); copy.textContent = "Copied"; }
    catch { copy.textContent = "Select it"; }
    setTimeout(() => (copy.textContent = "Copy"), 1600);
  });
})();

// ---------- The system: n8n-style multi-touchpoint flow ----------
(function () {
  const canvas = document.getElementById("sysCanvas");
  if (!canvas) return;
  const wires = document.getElementById("sysWires");
  const dot = document.getElementById("leadDot");
  const fit = document.getElementById("sysFit");
  const scroller = document.getElementById("sysScroll");
  const cap = document.getElementById("sysCaption");
  const cardsEl = document.getElementById("infraCards");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = 1100, H = 470, NW = 180, NH = 60;

  // id: [x, y, label, sub, icons, card, kind]
  const N = {
    brand:  [20, 20, "Brand name", "from marketplaces", ["myntra", "noon"], "find"],
    domain: [20, 131, "Domain + store", "free checks first", ["serper", "storeleads"], "find"],
    people: [20, 243, "Founder + phone", "only if it qualifies", ["exa", "airscale"], "find"],
    score:  [20, 354, "Tier + offer", "5 tiers, 5 offers", ["claude", "supabase"], "find"],
    route:  [214, 187, "Route", "by geography", [], "find", "if"],
    wa:     [420, 41, "WhatsApp", "1st touch · rotating numbers", ["whatsapp", "msg91"], "wa"],
    email1: [420, 243, "Email", "1st touch to unlock new geographies", ["plusvibe"], "email"],
    agency: [420, 362, "Agencies", "referral · white-label", ["heyreach"], "li"],
    unibox: [650, 10, "Unibox", "reply inside 24h", ["whatsapp"], "wa"],
    retgt:  [650, 140, "Email retarget", "cheaper 2nd touch", ["plusvibe"], "email"],
    booked: [905, 10, "Booked", "meeting on calendar", ["hubspot"], "pipe", "end"],
    call:   [905, 107, "Call", "interested, then ghosted", [], "pipe", "call"],
    li:     [905, 243, "LinkedIn", "2nd or 3rd touch", ["heyreach"], "li"],
    park:   [905, 362, "Park 30 days", "then retarget", [], "pipe", "park"]
  };
  // [from, to, fromSide, toSide, label, dashed]
  const E = [
    ["brand", "domain", "b", "t"], ["domain", "people", "b", "t"], ["people", "score", "b", "t"],
    ["score", "route", "r", "l"],
    ["route", "wa", "r", "l", "WhatsApp works"], ["route", "email1", "r", "l", "WhatsApp\ndoesn't work"], ["route", "agency", "r", "l", "agency"],
    ["wa", "unibox", "r", "l", "replied"], ["wa", "retgt", "r", "l", "no reply"],
    ["unibox", "booked", "r", "l", "interested"], ["unibox", "call", "r", "l", "ghosted"], ["call", "booked", "t", "b"],
    ["retgt", "li", "r", "l"], ["email1", "li", "r", "l"],
    ["li", "park", "b", "t", "no outcome"], ["park", "route", "b", "b", "after 30 days", true]
  ];
  // journeys: key, toggle label, caption, [[node, status shown at that node], ...]
  const JOURNEYS = [
    { key: "book", label: "Books on WhatsApp", caption: "A D2C founder in India", steps: [
      ["brand", "Brand name scraped"], ["domain", "Store checked: live, qualifies"], ["people", "Founder and phone found"],
      ["score", "Scored: Tier B, offer picked"], ["route", "Routed to WhatsApp"], ["wa", "Contacted on WhatsApp"],
      ["unibox", "Replied, answered inside 24h"], ["booked", "Meeting booked"]] },
    { key: "ghost", label: "Says yes, goes quiet", caption: "Interested, then silent", steps: [
      ["score", "Scored, offer picked"], ["route", "Routed to WhatsApp"], ["wa", "Contacted on WhatsApp"],
      ["unibox", "Replied: interested"], ["call", "Went quiet, so we called"], ["booked", "Booked on the call"]] },
    { key: "us", label: "US brand, no WhatsApp", caption: "A brand outside WhatsApp markets", steps: [
      ["score", "Scored, offer picked"], ["route", "Routed to email: US"], ["email1", "Emailed first"], ["li", "Followed up on LinkedIn"]] },
    { key: "cold", label: "No reply anywhere", caption: "Silent on every channel", steps: [
      ["score", "Scored, offer picked"], ["route", "Routed to WhatsApp"], ["wa", "No reply on WhatsApp"],
      ["retgt", "Retargeted by email"], ["li", "Retargeted on LinkedIn"], ["park", "Parked for 30 days"], ["route", "Back in the queue, new angle"]] },
    { key: "agency", label: "Marketing agency", caption: "An agency, not a brand", steps: [
      ["score", "Scored as a partner"], ["route", "Routed to the agency lane"], ["agency", "Pitched referral or white-label"]] }
  ];
  const CARDS = {
    find: ["① Find", "Brand name → scored lead", [
      "Free checks first; paid lookups only once a brand qualifies.",
      "Scored into 5 tiers, each with its own offer."]],
    wa: ["WhatsApp", "First touch. Quietest inbox.", [
      "A rotating pool of numbers on our Meta account; new ones keep coming in, each warmed with inbound first.",
      "Meta-approved templates via MSG91, timed per region.",
      "One unibox for all numbers, replies inside 24h.",
      "What broke: cold sends via Unipile got numbers banned."]],
    email: ["Email", "Retarget cheaply. Open new markets.", [
      "Follows up WhatsApp non-replies.",
      "Opens the US, UK and UAE, where WhatsApp doesn't work.",
      "Domains, inboxes, auth and warm-up set up from scratch."]],
    li: ["LinkedIn", "Later touch, plus agencies.", [
      "HeyReach for the 2nd or 3rd touch, one seat per lead.",
      "A separate lane for agency referral deals."]],
    pipe: ["Pipeline", "Every lead has one stage.", [
      "Interested, then ghosted → a phone call.",
      "No outcome in 30 days → parked, then retargeted."]]
  };
  const ICON = { li: "linkedin" };
  const cardIcon = { find: "claude", wa: "whatsapp", email: "plusvibe", li: "heyreach", pipe: "sheets" };

  // nodes
  const glyph = { if: "◆", call: "☎", park: "⏸" };
  Object.entries(N).forEach(([id, n]) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "nd" + (n[6] ? " k-" + n[6] : "");
    el.id = "nd-" + id;
    el.style.left = n[0] + "px"; el.style.top = n[1] + "px";
    const icons = n[4].length
      ? n[4].map((k) => `<img src="assets/logos/${k}.png" alt="">`).join("")
      : `<span class="gl">${glyph[n[6]] || "•"}</span>`;
    el.innerHTML = `<span class="ic">${icons}</span><span class="tx"><b>${n[2]}</b><small>${n[3]}</small></span><i class="ck">✓</i><i class="pt pl"></i><i class="pt pr"></i>`;
    el.addEventListener("click", () => selectCard(n[5], true));
    canvas.appendChild(el);
  });

  // wires
  const port = (id, side) => {
    const [x, y] = N[id];
    const w = N[id][6] === "if" ? 120 : NW;
    return { l: [x, y + NH / 2], r: [x + w, y + NH / 2], t: [x + w / 2, y], b: [x + w / 2, y + NH] }[side];
  };
  const norm = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };
  const paths = {};
  wires.setAttribute("viewBox", `0 0 ${W} ${H}`);
  wires.innerHTML = E.map(([a, b, sa, sb, label, dashed]) => {
    const p1 = port(a, sa), p2 = port(b, sb);
    let d;
    if (a === "park") {
      // loop back under the canvas to Route
      const yb = H - 16;
      d = `M${p1[0]},${p1[1]} C${p1[0]},${yb} ${p1[0] - 60},${yb} ${p1[0] - 120},${yb} L${p2[0] + 60},${yb} C${p2[0]},${yb} ${p2[0]},${yb} ${p2[0]},${p2[1]}`;
    } else {
      const k = Math.max(40, Math.abs(p2[0] - p1[0]) / 2, Math.abs(p2[1] - p1[1]) / 3);
      const c1 = [p1[0] + norm[sa][0] * k, p1[1] + norm[sa][1] * k];
      const c2 = [p2[0] + norm[sb][0] * k, p2[1] + norm[sb][1] * k];
      d = `M${p1[0]},${p1[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
    }
    return `<path id="w-${a}-${b}" class="wire${dashed ? " dash" : ""}" d="${d}"/>`;
  }).join("");
  E.forEach(([a, b, , , label]) => {
    const p = document.getElementById(`w-${a}-${b}`);
    paths[a + ">" + b] = p;
    if (!label) return;
    const L = p.getTotalLength();
    const pt = p.getPointAtLength(a === "park" ? L * 0.5 : L * 0.55);
    const t = document.createElement("span");
    t.className = "wl"; t.textContent = label;
    t.style.left = pt.x + "px"; t.style.top = pt.y + "px";
    canvas.appendChild(t);
  });

  // stage chips + infra cards
  cardsEl.innerHTML = Object.entries(CARDS).map(([k, c]) => `
    <article class="ic-card" id="card-${k}">
      <header><img src="assets/logos/${cardIcon[k]}.png" alt=""><span>${c[0]}</span></header>
      <h3>${c[1]}</h3>
      <ul>${c[2].map((li) => `<li${li.startsWith("What broke") ? ' class="broke"' : ""}>${li}</li>`).join("")}</ul>
    </article>`).join("");
  function selectCard(k, scroll) {
    document.querySelectorAll(".ic-card").forEach((c) => c.classList.toggle("on", c.id === "card-" + k));
    document.querySelectorAll(".nd").forEach((el) => el.classList.toggle("sel", N[el.id.slice(3)][5] === k));
    if (scroll) document.getElementById("card-" + k).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }

  let scale = 1, touched = 0;
  scroller.addEventListener("pointerdown", () => (touched = Date.now()));
  scroller.addEventListener("wheel", () => (touched = Date.now()), { passive: true });
  const follow = (x) => {
    if (scroller.scrollWidth <= scroller.clientWidth + 4 || Date.now() - touched < 4000) return;
    scroller.scrollLeft = x * scale - scroller.clientWidth / 2;
  };
  // fit canvas to width (scrolls sideways on small screens)
  function fitCanvas() {
    const avail = scroller.clientWidth;
    const s = Math.max(0.64, Math.min(1, avail / W));
    scale = s;
    canvas.style.transform = `scale(${s})`;
    fit.style.width = W * s + "px"; fit.style.height = H * s + "px";
  }
  fitCanvas();
  addEventListener("resize", fitCanvas);

  // ---------- run journeys (smooth dot, drawn trail, selectable) ----------
  const nodeEl = (id) => document.getElementById("nd-" + id);
  const jWrap = document.getElementById("sysJourneys");
  const statusEl = document.getElementById("sysStatus");
  const stepEl = document.getElementById("sysStep");
  jWrap.innerHTML = `<button type="button" class="jr-btn on" data-j="auto">All journeys</button>` +
    JOURNEYS.map((j) => `<button type="button" class="jr-btn" data-j="${j.key}">${j.label}</button>`).join("");
  let token = 0, mode = "auto";
  const setStatus = (j, i, txt) => {
    cap.textContent = j.caption;
    statusEl.textContent = txt;
    stepEl.textContent = `step ${i + 1} of ${j.steps.length}`;
  };
  function reset() {
    canvas.querySelectorAll(".nd").forEach((n) => n.classList.remove("run", "done"));
    wires.querySelectorAll(".wire-lit").forEach((w) => w.remove());
    dot.style.opacity = 0;
  }
  function showFinal(j) {
    reset();
    j.steps.forEach(([id], i) => {
      nodeEl(id).classList.add("done");
      if (i) { const p = paths[j.steps[i - 1][0] + ">" + id]; if (p) { const o = p.cloneNode(); o.removeAttribute("id"); o.setAttribute("class", "wire-lit"); wires.appendChild(o); } }
    });
    const last = j.steps[j.steps.length - 1];
    setStatus(j, j.steps.length - 1, last[1]);
  }
  if (reduce) {
    showFinal(JOURNEYS[0]);
    jWrap.addEventListener("click", (e) => { const b = e.target.closest(".jr-btn"); if (!b) return; jWrap.querySelectorAll(".jr-btn").forEach((x) => x.classList.toggle("on", x === b)); showFinal(JOURNEYS.find((j) => j.key === b.dataset.j) || JOURNEYS[0]); });
    selectCard("wa", false);
    return;
  }
  let paused = false, visible = true;
  const sec = document.getElementById("system");
  canvas.addEventListener("mouseenter", () => (paused = true));
  canvas.addEventListener("mouseleave", () => (paused = false));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(sec);
  const live = () => !paused && visible && !document.hidden;
  const sleep = (ms, tok) => new Promise((res) => {
    let left = ms, last = performance.now();
    const f = (t) => {
      if (tok !== token) return res(false);
      if (live()) left -= t - last;
      last = t;
      if (left <= 0) return res(true);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  const SPEED = 0.62; // px per ms
  const travel = (path, tok) => new Promise((res) => {
    const L = path.getTotalLength();
    const lit = path.cloneNode();
    lit.removeAttribute("id");
    lit.setAttribute("class", "wire-lit");
    lit.style.strokeDasharray = L;
    lit.style.strokeDashoffset = L;
    wires.appendChild(lit);
    dot.style.opacity = 1;
    let d = 0, last = performance.now(), frame = 0;
    const f = (t) => {
      if (tok !== token) return res(false);
      if (live()) d = Math.min(L, d + (t - last) * SPEED);
      last = t;
      // ease in and out over each wire for a softer start and stop
      const k = d / L, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const p = path.getPointAtLength(e * L);
      dot.style.transform = `translate(${p.x - 6}px, ${p.y - 6}px)`;
      lit.style.strokeDashoffset = L - e * L;
      if (++frame % 6 === 0) follow(p.x);
      if (d >= L) return res(true);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  async function play(j, tok) {
    reset();
    for (let i = 0; i < j.steps.length; i++) {
      const [id, txt] = j.steps[i];
      if (i > 0) {
        const prev = j.steps[i - 1][0];
        nodeEl(prev).classList.replace("run", "done");
        const path = paths[prev + ">" + id];
        if (path && !(await travel(path, tok))) return false;
      } else {
        const n = N[id];
        dot.style.transform = `translate(${n[0] + NW / 2 - 6}px, ${n[1] + NH / 2 - 6}px)`;
      }
      nodeEl(id).classList.remove("done");
      nodeEl(id).classList.add("run");
      setStatus(j, i, txt);
      if (!(await sleep(i === j.steps.length - 1 ? 0 : 240, tok))) return false;
    }
    nodeEl(j.steps[j.steps.length - 1][0]).classList.replace("run", "done");
    dot.style.opacity = 0;
    return sleep(1500, tok);
  }
  async function run() {
    const tok = ++token;
    let r = 0;
    for (;;) {
      const j = mode === "auto" ? JOURNEYS[r % JOURNEYS.length] : JOURNEYS.find((x) => x.key === mode);
      if (!(await play(j, tok))) return;
      r++;
    }
  }
  jWrap.addEventListener("click", (e) => {
    const b = e.target.closest(".jr-btn");
    if (!b) return;
    mode = b.dataset.j;
    jWrap.querySelectorAll(".jr-btn").forEach((x) => x.classList.toggle("on", x === b));
    paused = false;
    run();
  });
  run();
  selectCard("wa", false);
})();

// ---------- Scroll reveal ----------
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const els = document.querySelectorAll("main section:not(.hero) > *, section.wa > *, section.system > *, section.lists > *, section.flowsec > *, section.contact > *");
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach((el, i) => { if (el.getBoundingClientRect().top > innerHeight * 0.9) { el.classList.add("rv"); el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el); } });
})();
