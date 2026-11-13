// SpidAMAN · 2D pixel-art night patrol over GTM City.
// Everything is drawn in code on a 256×256 canvas and scaled up with hard pixel edges.
(function () {
  const stage = document.getElementById("spidaStage");
  const overlay = document.getElementById("spidaLabels");
  const statusEl = document.getElementById("spidaStatus");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const VW = 256, VH = 256, GROUND = 232;
  const cv = document.createElement("canvas");
  cv.width = VW; cv.height = VH;
  stage.prepend(cv);
  const g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;

  // ---------- Content ----------
  const MARKETS = [
    { sign: "LOGISTICS SAAS HQ", neon: "#5fe3ff", h: 108, villain: "Unmapped TAM", kind: "blob", vcol: ["#8e94ad", "#5d6380"], how: "Mapped by persona", proof: "20,000 companies mapped" },
    { sign: "COLD EMAIL AGENCY", neon: "#ff6fae", h: 92, villain: "Burnt Infra", kind: "blob", vcol: ["#ee8a3c", "#a8501f"], how: "Fresh domains + warm-up", proof: "3 channels live" },
    { sign: "B2B SAAS HQ", neon: "#ffd166", h: 120, villain: "No Signal", kind: "blob", vcol: ["#5fb8ad", "#2f7a72"], how: "Hiring + post signals", proof: "100 verified leads" },
    { sign: "MARKETING AGENCY", neon: "#b9f27c", h: 98, villain: "Ghosted Leads", kind: "ghost", vcol: ["#e9ecf7", "#9aa1c0"], how: "WhatsApp first + a call", proof: "50 meetings / month" },
    { sign: "D2C BRAND HQ", neon: "#c79bff", h: 112, villain: "Dirty Data", kind: "blob", vcol: ["#9b7651", "#5e4630"], how: "Enrichment waterfall", proof: "12,842 brands enriched" }
  ];
  const PLACE = ["Logistics SaaS HQ", "Cold Email Agency", "B2B SaaS HQ", "Marketing Agency", "D2C Brand HQ"];
  const SPACING = 132, BW = 78, X0 = 40;
  const bX = (n) => X0 + n * SPACING;
  const idx = (n) => ((n % 5) + 5) % 5;
  const mk = (n) => MARKETS[idx(n)];

  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- Pixel sprite builder: fill shapes, then add a black outline ----------
  const PAL = { R: "#d81f26", r: "#9c1218", L: "#f2524a", B: "#2a4fb8", b: "#1a3380", W: "#f7f7f7", K: "#0d0d12", w: "#7a0d12" };
  function sprite(Wd, Ht, paint) {
    const grid = Array.from({ length: Ht }, () => Array(Wd).fill(null));
    const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < Wd && y < Ht) grid[y][x] = c; };
    paint(set, grid);
    const out = grid.map((row) => row.slice());
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      if (grid[y][x]) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && xx >= 0 && yy < Ht && xx < Wd && grid[yy][xx] && grid[yy][xx] !== "K") out[y][x] = "K";
      }
    }
    const c = document.createElement("canvas");
    c.width = Wd; c.height = Ht;
    const cx = c.getContext("2d");
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      const v = out[y][x];
      if (!v) continue;
      cx.fillStyle = v.startsWith("#") ? v : PAL[v];
      cx.fillRect(x, y, 1, 1);
    }
    return c;
  }

  // ---------- SpidAMAN: chibi, big head, red + blue ----------
  const HW = 28, HH = 32;
  const POSES = {
    stand:  { aL: -0.35, aR: 0.35, al: 6, lL: -0.12, lR: 0.12, ll: 7, off: 0 },
    shoot:  { aL: -0.45, aR: 1.57, al: 8, lL: -0.22, lR: 0.22, ll: 7, off: 0 },
    swing:  { aL: -1.25, aR: 2.62, al: 8, lL: 0.85, lR: 0.25, ll: 6, off: 0 },
    swing2: { aL: -0.95, aR: 2.62, al: 8, lL: 0.45, lR: -0.2, ll: 6, off: 0 },
    crouch: { aL: -0.7, aR: 0.7, al: 5, lL: -0.65, lR: 0.65, ll: 6, off: 2 }
  };
  function heroSprite(p) {
    return sprite(HW, HH, (set, grid) => {
      const o = p.off, cx = 13.5, cy = 9 + o;
      for (let y = 0; y < 18 + o; y++) for (let x = 0; x < HW; x++) {
        const dx = (x - cx) / 7.6, dy = (y - cy) / 7.2;
        if (dx * dx + dy * dy <= 1) {
          let c = "R";
          if (x - cx > 3.6 || y - cy > 4.2) c = "r";
          if (x - cx < -3 && y - cy < -2.5) c = "L";
          set(x, y, c);
        }
      }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + 0.2;
        for (let t = 3.5; t < 7; t += 0.9) set(cx + Math.cos(a) * t, cy + Math.sin(a) * t * 0.95, "w");
      }
      const eye = [[-5, -1], [-4, -1], [-3, -1], [-2, -1], [-5, 0], [-4, 0], [-3, 0], [-2, 0], [-1, 0], [-4, 1], [-3, 1], [-2, 1], [-1, 1], [-3, 2], [-2, 2]];
      const cells = [];
      eye.forEach(([ex, ey]) => { cells.push([13 + ex, Math.round(cy) + ey]); cells.push([27 - (13 + ex), Math.round(cy) + ey]); });
      const isEye = (x, y) => cells.some(([a, b]) => a === x && b === y);
      cells.forEach(([x, y]) => {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
          if (!isEye(x + dx, y + dy) && grid[y + dy] && grid[y + dy][x + dx]) set(x + dx, y + dy, "K");
      });
      cells.forEach(([x, y]) => set(x, y, "W"));
      for (let y = 16 + o; y <= 23 + o; y++) for (let x = 10; x <= 17; x++) {
        let c = "R";
        if (x === 10 || x === 17) c = "B";
        if (y >= 22 + o) c = "B";
        if (x === 16 && y < 22 + o) c = "r";
        set(x, y, c);
      }
      [[13, 18], [14, 18], [13, 19], [14, 19], [12, 17], [15, 17], [12, 20], [15, 20]].forEach(([x, y]) => set(x, y + o, "K"));
      const limb = (x0, y0, a, len, upper, lower, cut) => {
        for (let t = 0; t <= len; t += 0.5) {
          const x = x0 + Math.sin(a) * t, y = y0 + Math.cos(a) * t;
          const c = t > len - cut ? lower : upper;
          set(x, y, c); set(x + 1, y, c); set(x, y + 1, c);
        }
      };
      limb(9, 16.5 + o, p.aL, p.al, "R", "R", 0);
      limb(17.5, 16.5 + o, p.aR, p.al, "R", "R", 0);
      limb(10.5, 23.5 + o, p.lL, p.ll, "B", "R", 3);
      limb(15.5, 23.5 + o, p.lR, p.ll, "B", "R", 3);
    });
  }
  const HERO = {};
  Object.keys(POSES).forEach((k) => (HERO[k] = heroSprite(POSES[k])));
  const handOf = (pose) => { const p = POSES[pose]; return { x: 18 + Math.sin(p.aR) * p.al, y: 16.5 + p.off + Math.cos(p.aR) * p.al }; };

  // ---------- Villains ----------
  function villainSprite(m) {
    const [c1, c2] = m.vcol;
    return sprite(22, 20, (set) => {
      const cx = 10.5, cy = 11;
      for (let y = 0; y < 20; y++) for (let x = 0; x < 22; x++) {
        const dx = (x - cx) / 9, dy = (y - cy) / 7.5;
        let inside = dx * dx + dy * dy <= 1;
        if (m.kind === "ghost") inside = (y <= cy && dx * dx + dy * dy <= 1) || (y > cy && y < 17 + ((x % 4) < 2 ? 1 : 0) && Math.abs(x - cx) <= 8.5);
        if (inside) set(x, y, y - cy > 3 || x - cx > 5 ? c2 : c1);
      }
      if (m.kind !== "ghost") { set(cx - 4, 2, c2); set(cx - 4, 3, c2); set(cx + 4, 2, c2); set(cx + 4, 3, c2); }
      for (const s of [-1, 1]) {
        const ex = Math.round(cx + s * 3.5);
        set(ex, 10, "W"); set(ex - 1, 10, "W"); set(ex, 11, "W"); set(ex - 1, 11, "W");
        set(s > 0 ? ex - 1 : ex, 11, "K");
        set(ex - 1, s > 0 ? 7 : 8, "K"); set(ex, 8, "K"); set(s > 0 ? ex - 2 : ex + 1, s > 0 ? 6 : 7, "K");
      }
      for (let x = cx - 2; x <= cx + 2; x++) set(x, Math.abs(x - cx) < 1 ? 14 : 15, "K");
    });
  }
  const VILLAIN = MARKETS.map(villainSprite);

  // ---------- Background layers ----------
  function layer(width, height, seed, base, win, minH, maxH, step) {
    const c = document.createElement("canvas");
    c.width = width; c.height = height;
    const x2 = c.getContext("2d");
    let x = 0, i = 0;
    while (x < width) {
      const w = step[0] + Math.floor(hash(seed + i) * step[1]);
      const h = minH + Math.floor(hash(seed + i * 3.1) * (maxH - minH));
      x2.fillStyle = base;
      x2.fillRect(x, height - h, w, h);
      if (hash(seed + i * 7.7) > 0.7) x2.fillRect(x + Math.floor(w / 2) - 1, height - h - 8, 2, 8);
      if (hash(seed + i * 5.3) > 0.75) x2.fillRect(x + 3, height - h - 5, 6, 5);
      if (win) for (let wy = height - h + 4; wy < height - 4; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4)
        if (hash(seed + wx * 13.1 + wy * 7.3) > 0.82) { x2.fillStyle = win; x2.fillRect(wx, wy, 1, 2); x2.fillStyle = base; }
      x += w + (hash(seed + i * 2.2) > 0.6 ? 2 : 0);
      i++;
    }
    return c;
  }
  const FAR = layer(512, 120, 11, "#4a3c78", null, 30, 90, [14, 22]);
  const MID = layer(512, 150, 37, "#2c2552", "#f3c46a", 50, 120, [16, 26]);
  const SKY = (() => {
    const c = document.createElement("canvas");
    c.width = VW; c.height = VH;
    const x2 = c.getContext("2d");
    const stops = ["#1f1a3f", "#2a2250", "#3a2d63", "#4c3a74", "#634a83", "#7d5a8c", "#9a6a8e", "#b9798c", "#d68a82", "#eda476", "#f6bd6f"];
    const band = 210 / stops.length;
    stops.forEach((s, i) => { x2.fillStyle = s; x2.fillRect(0, Math.floor(i * band), VW, Math.ceil(band) + 1); });
    x2.fillStyle = "#f6bd6f"; x2.fillRect(0, 210, VW, VH - 210);
    return c;
  })();
  const STARS = Array.from({ length: 46 }, (_, i) => ({ x: Math.floor(hash(i * 9.1) * VW), y: Math.floor(hash(i * 4.7) * 120), p: hash(i * 2.3) * 6 }));
  // moon with a stepped, pixel-edged glow and synthwave stripes
  const MOON = (() => {
    const r = 30, pad = 12, size = (r + pad) * 2;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x2 = c.getContext("2d");
    const ring = (rad, col) => { x2.fillStyle = col; for (let y = -rad; y <= rad; y++) { const w = Math.floor(Math.sqrt(rad * rad - y * y)); x2.fillRect(r + pad - w, r + pad + y, w * 2, 1); } };
    ring(r + 10, "rgba(255,214,140,0.10)");
    ring(r + 5, "rgba(255,214,140,0.16)");
    for (let y = -r; y <= r; y++) {
      if (y > 6 && (y % 6 === 0 || y % 6 === 1)) { x2.clearRect(0, r + pad + y, size, 1); continue; }
      const w = Math.floor(Math.sqrt(r * r - y * y));
      x2.fillStyle = y < -10 ? "#ffe9b0" : "#ffd27e";
      x2.fillRect(r + pad - w, r + pad + y, w * 2, 1);
    }
    return c;
  })();
  function drawMoon() { g.drawImage(MOON, 182 - MOON.width / 2, 104 - MOON.height / 2); }


  // ---------- HQ buildings ----------
  const BCOL = ["#1c2240", "#232a4e", "#271f44", "#1b2c44", "#2a2342"];
  function drawBuilding(n, camX, t) {
    const m = mk(n), x = Math.round(bX(n) - camX), top = GROUND - m.h;
    if (x > VW + 10 || x + BW < -10) return;
    g.fillStyle = BCOL[idx(n)]; g.fillRect(x, top, BW, m.h);
    g.fillStyle = "#3b4268"; g.fillRect(x - 2, top - 3, BW + 4, 3);
    g.fillStyle = "#11152a"; g.fillRect(x + BW - 6, top, 6, m.h);
    for (let wy = top + 20; wy < GROUND - 6; wy += 9) for (let wx = x + 6; wx < x + BW - 10; wx += 8) {
      const hsh = hash(n * 97 + (wx - x) * 0.37 + (wy - top) * 1.7);
      g.fillStyle = hsh > 0.55 ? (hsh > 0.9 ? "#7fe6e0" : "#ffcf6a") : "#0f1326";
      g.fillRect(wx, wy, 3, 4);
    }
    g.fillStyle = "#0b0d1a"; g.fillRect(x + 5, top + 5, BW - 12, 10);
    if (n % 2 === 0) {
      g.fillStyle = "#5a4a3c"; g.fillRect(x + 8, top - 15, 11, 9); g.fillRect(x + 7, top - 17, 13, 2);
      g.fillStyle = "#3a2f27"; g.fillRect(x + 9, top - 6, 1, 3); g.fillRect(x + 17, top - 6, 1, 3);
    } else {
      g.fillStyle = "#4a4f6b"; g.fillRect(x + 12, top - 22, 1, 19);
      if (Math.floor(t * 1.5 + n) % 2) { g.fillStyle = "#ff3b3b"; g.fillRect(x + 11, top - 24, 3, 2); }
    }
  }
  function drawStreet(camX, t) {
    g.fillStyle = "#151628"; g.fillRect(0, GROUND, VW, VH - GROUND);
    g.fillStyle = "#24253d"; g.fillRect(0, GROUND, VW, 2);
    g.fillStyle = "#4b4c63";
    for (let x = -(camX % 16); x < VW; x += 16) g.fillRect(Math.round(x), GROUND + 12, 7, 1);
    for (let i = 0; i < 3; i++) {
      const cx = ((t * (22 + i * 9) + i * 97) % (VW + 40)) - 20, cy = GROUND + (i % 2 ? 5 : 15);
      g.fillStyle = ["#c0392b", "#2d6cdf", "#e0b23a"][i]; g.fillRect(Math.round(cx), cy, 9, 3);
      g.fillStyle = "#fff3b0"; g.fillRect(Math.round(cx) + 9, cy + 1, 1, 1);
    }
  }

  // ---------- World state ----------
  const roofY = (n) => GROUND - mk(n).h - 3;
  const heroSpot = (n) => bX(n) + 18;
  const villSpot = (n) => bX(n) + BW - 24;
  const hero = { x: heroSpot(0), y: roofY(0), pose: "stand" };
  const villains = new Map();
  const vstate = (n) => { if (!villains.has(n)) villains.set(n, { alive: true, wrap: 0 }); return villains.get(n); };
  let web = null, alert = 0, shake = 0;
  const parts = [];
  let camX = hero.x - VW * 0.36;

  // ---------- HTML overlays (crisp text over the pixels) ----------
  const els = new Map(), bursts = [], cards = [];
  function el(key, cls, html) {
    if (!els.has(key)) { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; overlay.appendChild(d); els.set(key, d); }
    return els.get(key);
  }
  const place = (d, wx, wy, s) => (d.style.transform = `translate(${(wx - camX) * s}px, ${wy * s}px) translate(-50%, -100%)`);
  function burst(text, wx, wy) {
    const d = document.createElement("div");
    d.className = "px-burst"; d.textContent = text;
    overlay.appendChild(d);
    bursts.push({ d, wx, wy, t: 0 });
  }
  function card(n) {
    const m = mk(n), d = document.createElement("div");
    d.className = "px-card";
    d.innerHTML = `<b>✓ ${m.how}</b><span>${m.proof}</span>`;
    overlay.appendChild(d);
    cards.push({ d, wx: villSpot(n) - 4, wy: roofY(n) - 40, t: 0 });
  }

  // ---------- Tweens that pause with the scene ----------
  const tasks = [];
  const tween = (sec, fn = () => {}) => new Promise((res) => tasks.push({ t: 0, sec, fn, res }));
  const wait = (sec) => tween(sec);
  const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  const say = (s) => (statusEl.textContent = s);
  const handWorld = () => { const h = handOf(hero.pose); return { x: hero.x - HW / 2 + h.x, y: hero.y - HH + h.y }; };

  async function fight(n) {
    const m = mk(n), v = vstate(n);
    hero.pose = "stand";
    say(`Spotted: ${m.villain} at the ${PLACE[idx(n)]}`);
    alert = 0.55;
    await wait(0.55);
    hero.pose = "shoot";
    const tx = villSpot(n), ty = roofY(n) - 9, h0 = handWorld();
    burst("THWIP!", h0.x + 4, h0.y - 6);
    await tween(0.18, (t) => (web = { x1: h0.x, y1: h0.y, x2: h0.x + (tx - h0.x) * t, y2: h0.y + (ty - h0.y) * t }));
    await tween(0.35, (t) => (v.wrap = t));
    web = null;
    burst("POW!", tx, ty - 12);
    shake = 0.12;
    for (let i = 0; i < 22; i++) parts.push({ x: tx, y: ty, vx: (hash(i + n * 3) - 0.5) * 90, vy: -hash(i * 1.7 + n) * 80 - 10, c: i % 3 ? m.vcol[0] : "#ffffff", life: 0.7 });
    v.alive = false;
    hero.pose = "stand";
    say(`Beat ${m.villain}. ${m.proof}.`);
    card(n);
    await wait(1.6);
  }

  async function swing(n) {
    const S = { x: hero.x, y: hero.y }, E = { x: heroSpot(n + 1), y: roofY(n + 1) };
    hero.pose = "crouch";
    await wait(0.12);
    hero.pose = "swing";
    const A = { x: (S.x + E.x) / 2 + 6, y: 6 };
    const hw = handWorld();
    await tween(0.14, (t) => (web = { x1: hw.x, y1: hw.y, x2: hw.x + (A.x - hw.x) * t, y2: hw.y + (A.y - hw.y) * t }));
    const aS = Math.atan2(S.y - A.y, S.x - A.x), aE = Math.atan2(E.y - A.y, E.x - A.x);
    const rS = Math.hypot(S.x - A.x, S.y - A.y), rE = Math.hypot(E.x - A.x, E.y - A.y);
    say("Swinging to the next HQ…");
    await tween(1.05, (t) => {
      const e = ease(t), a = aS + (aE - aS) * e, r = rS + (rE - rS) * e + Math.sin(Math.PI * e) * 10;
      hero.x = A.x + Math.cos(a) * r; hero.y = A.y + Math.sin(a) * r;
      const h = handWorld();
      web = { x1: h.x, y1: h.y, x2: A.x, y2: A.y };
    });
    web = null;
    hero.x = E.x; hero.y = E.y;
    hero.pose = "crouch";
    await wait(0.16);
    hero.pose = "stand";
    for (const k of villains.keys()) if (k < n - 2) villains.delete(k);
  }

  async function story() {
    say("On night patrol…");
    await wait(0.8);
    for (let n = 0; ; n++) { await fight(n); await swing(n); }
  }

  // ---------- Draw ----------
  function draw(t) {
    g.drawImage(SKY, 0, 0);
    STARS.forEach((s) => { if (Math.sin(t * 2 + s.p) > -0.3) { g.fillStyle = "#fdf3d8"; g.fillRect(s.x, s.y, 1, 1); } });
    drawMoon();
    const sx = shake > 0 ? (Math.floor(t * 40) % 2 ? 1 : -1) : 0;
    g.save();
    g.translate(sx, 0);
    const tile = (img, f, y) => { const off = -(((camX * f) % img.width) + img.width) % img.width; for (let x = off; x < VW; x += img.width) g.drawImage(img, Math.round(x), y); };
    tile(FAR, 0.18, GROUND - 120);
    tile(MID, 0.45, GROUND - 150);
    const first = Math.floor((camX - X0) / SPACING) - 1;
    for (let n = first; n < first + 4; n++) drawBuilding(n, camX, t);
    for (let n = Math.max(0, first); n < first + 4; n++) {
      const v = vstate(n);
      if (!v.alive) continue;
      const bob = Math.round(Math.sin(t * 4 + n) * 1.2);
      const jit = v.wrap > 0 ? (Math.floor(t * 30) % 2 ? 1 : -1) : 0;
      const vx = Math.round(villSpot(n) - camX - 11) + jit, vy = roofY(n) - 17 + bob;
      g.drawImage(VILLAIN[idx(n)], vx, vy);
      if (v.wrap > 0) {
        g.fillStyle = "#ffffff";
        const k = Math.ceil(v.wrap * 4);
        for (let i = 0; i < k; i++) g.fillRect(vx + 2, vy + 4 + i * 4, 18, 1);
        for (let i = 0; i < k; i++) g.fillRect(vx + 3 + i * 5, vy + 2, 1, 16);
      }
    }
    if (web) {
      g.fillStyle = "#f4f4f4";
      const dx = web.x2 - web.x1, dy = web.y2 - web.y1, steps = Math.max(1, Math.abs(dx), Math.abs(dy));
      for (let i = 0; i <= steps; i++) g.fillRect(Math.round(web.x1 + (dx * i) / steps - camX), Math.round(web.y1 + (dy * i) / steps), 1, 1);
    }
    if (hero.pose === "swing") {                                          // wind trail
      g.fillStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < 3; i++) {
        const lx = Math.round(hero.x - camX - 20 - ((t * 70 + i * 11) % 9)), ly = Math.round(hero.y - 10 - i * 7);
        g.fillRect(lx, ly, 7, 1);
      }
    }
    const pose = hero.pose === "swing" && Math.floor(t / 0.14) % 2 ? "swing2" : hero.pose;
    g.drawImage(HERO[pose], Math.round(hero.x - HW / 2 - camX), Math.round(hero.y - HH));
    if (alert > 0) {
      g.fillStyle = "#ffe14d";
      const ax = Math.round(hero.x - camX), ay = Math.round(hero.y - HH - 10);
      g.fillRect(ax - 1, ay, 3, 6); g.fillRect(ax - 1, ay + 7, 3, 2);
    }
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x - camX), Math.round(p.y), 2, 2); });
    g.restore();
    drawStreet(camX, t);
  }

  function update(dt) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      const k = tasks[i];
      k.t = Math.min(k.sec, k.t + dt);
      k.fn(k.sec ? k.t / k.sec : 1);
      if (k.t >= k.sec) { tasks.splice(i, 1); k.res(); }
    }
    alert = Math.max(0, alert - dt);
    shake = Math.max(0, shake - dt);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    const want = hero.x - VW * 0.36;
    camX += (want - camX) * (1 - Math.exp(-dt * 3.2));
  }

  function overlays(t, dt) {
    const s = stage.clientWidth / VW;
    const first = Math.floor((camX - X0) / SPACING) - 1;
    const live = new Set();
    for (let n = Math.max(0, first); n < first + 4; n++) {
      const m = mk(n), sk = "s" + n, vk = "v" + n;
      live.add(sk);
      const sign = el(sk, "px-sign", m.sign);
      sign.style.setProperty("--neon", m.neon);
      sign.style.opacity = Math.sin(t * 9 + n * 2) > -0.94 ? 1 : 0.5;
      place(sign, bX(n) + BW / 2 - 3, GROUND - m.h + 15, s);
      if (vstate(n).alive) {
        live.add(vk);
        place(el(vk, "px-tag", m.villain), villSpot(n), roofY(n) - 18, s);
      }
    }
    for (const [k, d] of els) if (!live.has(k)) { d.remove(); els.delete(k); }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.t += dt;
      place(b.d, b.wx, b.wy, s);
      b.d.style.opacity = b.t < 0.45 ? 1 : Math.max(0, 1 - (b.t - 0.45) / 0.25);
      b.d.style.scale = String(b.t < 0.12 ? 0.4 + b.t * 5 : 1);
      if (b.t > 0.7) { b.d.remove(); bursts.splice(i, 1); }
    }
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i]; c.t += dt;
      place(c.d, c.wx, c.wy - Math.min(c.t, 0.4) * 10, s);
      c.d.style.opacity = c.t < 0.2 ? c.t / 0.2 : c.t < 2.2 ? 1 : Math.max(0, 1 - (c.t - 2.2) / 0.4);
      if (c.t > 2.6) { c.d.remove(); cards.splice(i, 1); }
    }
  }

  // ---------- Loop ----------
  let onScreen = true, last = performance.now(), clock = 0;
  new IntersectionObserver(([e]) => (onScreen = e.isIntersecting)).observe(stage);
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const running = onScreen && !document.hidden;
    if (running) { clock += dt; update(dt); }
    if (onScreen) { draw(clock); overlays(clock, running ? dt : 0); }
    requestAnimationFrame(frame);
  }
  if (reduce) { say("SpidAMAN keeps watch over GTM City."); draw(0); overlays(0, 0); }
  else { requestAnimationFrame(frame); story(); }
})();
