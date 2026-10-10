// Deterministic animation engine: window.renderAt(t) draws the frame at time t
// (seconds). Nothing depends on wall-clock time, so tools/render.mjs can step
// through frames one by one and every render is identical.
(function () {
  const S = window.SCRIPT;
  const params = new URLSearchParams(location.search);
  const portrait = params.get("format") === "9x16";
  if (portrait) document.documentElement.classList.add("portrait");
  const W = portrait ? 1080 : 1920;
  const H = portrait ? 1920 : 1080;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  function hash(a, b) {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const hex2 = (v) => Math.floor(v * 256).toString(16).padStart(2, "0");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- icons (simple line icons, drawn here so no external assets are needed)
  const ICONS = {
    lock: '<rect x="9" y="20" width="30" height="22" rx="4"/><path d="M15 20v-6a9 9 0 0 1 18 0v6"/><circle cx="24" cy="31" r="3"/>',
    id: '<rect x="5" y="10" width="38" height="28" rx="4"/><circle cx="17" cy="22" r="5"/><path d="M10 33c2-5 12-5 14 0M28 19h10M28 26h8"/>',
    key: '<circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M43 24v5"/>',
    code: '<path d="M17 14 7 24l10 10M31 14l10 10-10 10M27 10l-6 28"/>',
    token: '<rect x="5" y="12" width="38" height="24" rx="4"/><path d="M12 20h12M12 27h20"/><circle cx="35" cy="21" r="3"/>',
    cycle: '<path d="M38 18a15 15 0 0 0-27-3M10 30a15 15 0 0 0 27 3"/><path d="M11 7v8h8M37 41v-8h-8"/>',
    flask: '<path d="M19 6h10M21 6v12L9 38a3 3 0 0 0 3 4h24a3 3 0 0 0 3-4L27 18V6"/><path d="M14 30h20"/>',
    cloud: '<path d="M14 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2A9 9 0 0 0 14 36Z"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon]}</svg>`;
  });

  // ---------- scene 1: racks + network
  const racks = [...document.querySelectorAll(".rack")];
  racks.forEach((r) => { for (let i = 0; i < 14; i++) r.insertAdjacentHTML("beforeend", '<div class="unit"><span class="led"></span><span class="led"></span><span class="slot"></span></div>'); });
  const leds = [...document.querySelectorAll(".rack .led")];

  const netNodes = [[80, 90], [300, 50], [520, 110], [140, 260], [360, 210], [540, 300], [250, 370], [460, 390]];
  const netEdges = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [6, 7], [5, 7], [0, 4], [2, 4]];
  const svg = document.getElementById("netsvg");
  svg.innerHTML =
    netEdges.map(([a, b]) => `<line x1="${netNodes[a][0]}" y1="${netNodes[a][1]}" x2="${netNodes[b][0]}" y2="${netNodes[b][1]}" stroke="#bccde9" stroke-width="2.5"/>`).join("") +
    netNodes.map(([x, y], i) => `<g><circle cx="${x}" cy="${y}" r="${i === 4 ? 30 : 22}" fill="#fff" stroke="${i === 4 ? "#2563eb" : "#9fb4d8"}" stroke-width="3"/><rect x="${x - 9}" y="${y - 5}" width="18" height="12" rx="2" fill="${i === 4 ? "#2563eb" : "#7f95bd"}"/></g>`).join("") +
    netEdges.map((_, i) => `<g class="pk" id="pk${i}"><circle r="9" fill="#06b6d4" opacity=".9"/><circle r="15" fill="none" stroke="#06b6d4" stroke-opacity=".35" stroke-width="3"/></g>`).join("");
  const packets = netEdges.map((_, i) => document.getElementById("pk" + i));

  // ---------- scene 2: hex grids
  const weakPattern = ["a3", "5f", "1c", "07"];
  const weakGrid = document.getElementById("weakgrid");
  const strongGrid = document.getElementById("stronggrid");
  const CELLS = 32;
  for (let i = 0; i < CELLS; i++) {
    weakGrid.insertAdjacentHTML("beforeend", "<span></span>");
    strongGrid.insertAdjacentHTML("beforeend", "<span></span>");
  }
  const weakCells = [...weakGrid.children];
  const strongCells = [...strongGrid.children];

  // ---------- scene 4: API demo text (real endpoint, placeholder key, sample values)
  const REQ = [
    [["c", "$ "], ["k", "export "], ["", "SONICIUM_API_KEY="], ["s", '"YOUR_API_KEY"'], ["c", "   # প্লেসহোল্ডার"]],
    [["c", "$ "], ["k", "curl "], ["", "-sS --max-time 30 \\"]],
    [["", "    "], ["s", '"https://api.soniciumentropy.com/v1/random?length=32&format=hex"'], ["", " \\"]],
    [["", "    -H "], ["s", '"Authorization: Bearer $SONICIUM_API_KEY"']],
  ];
  const RESP = [
    "{",
    '  <span class="p">"data"</span>: <span class="s">"4cc5673986cbff63e4c2a4b28df98d4c1978319fbfd305dccc4bcd7c8e74e56a"</span>,',
    '  <span class="p">"length"</span>: <span class="k">32</span>,',
    '  <span class="p">"format"</span>: <span class="s">"hex"</span>,',
    '  <span class="p">"register"</span>: <span class="s">"Q135"</span>,',
    '  <span class="p">"drbgAlgorithm"</span>: <span class="s">"CTR-DRBG-AES-256"</span>,',
    '  <span class="p">"entropySource"</span>: <span class="s">"superconducting_qubit_q135"</span>,',
    '  <span class="p">"healthCheck"</span>: { <span class="p">"rct"</span>: <span class="s">"passed"</span>, <span class="p">"apt"</span>: <span class="s">"passed"</span>, <span class="p">"excludedChannels"</span>: [] },',
    '  <span class="p">"seedEpoch"</span>: <span class="k">412</span>,',
    '  <span class="p">"seedId"</span>: <span class="s">"9f1e…a07c"</span>,',
    '  <span class="p">"sourceJobIds"</span>: [<span class="s">"…"</span>],',
    '  <span class="p">"servedAt"</span>: <span class="s">"2026-10-10T09:30:00.000Z"</span>',
    "}",
  ];
  const VAL = [
    '<span class="k">body</span> = json.loads(response_text)',
    '<span class="k">assert</span> body[<span class="s">"format"</span>] == <span class="s">"hex"</span> <span class="k">and</span> body[<span class="s">"length"</span>] == 32',
    '<span class="k">raw</span> = bytes.fromhex(body[<span class="s">"data"</span>])',
    '<span class="k">assert</span> len(raw) == 32',
    '<span class="k">assert</span> body[<span class="s">"healthCheck"</span>][<span class="s">"rct"</span>] == <span class="s">"passed"</span>',
    '<span class="k">assert</span> body[<span class="s">"healthCheck"</span>][<span class="s">"apt"</span>] == <span class="s">"passed"</span>',
    '<span class="ok">✓ যাচাই সম্পন্ন → অ্যাপ্লিকেশন-নির্দিষ্ট ক্রিপ্টো ওয়ার্কফ্লো</span>',
  ];
  const reqEl = document.getElementById("req");
  const respEl = document.getElementById("resp");
  const valEl = document.getElementById("validate");
  const authBadge = document.getElementById("authbadge");
  const steps = [...document.querySelectorAll(".steps li")];
  const reqTotal = REQ.reduce((n, line) => n + line.reduce((m, [, s]) => m + [...s].length, 0) + 1, 0);

  function renderReq(chars, highlightAuth) {
    let left = chars;
    const out = [];
    REQ.forEach((line, li) => {
      if (left <= 0) return;
      let html = "";
      for (const [cls, text] of line) {
        if (left <= 0) break;
        const cs = [...text];
        const part = cs.slice(0, left).join("");
        left -= cs.length;
        html += cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part);
      }
      left -= 1;
      if (highlightAuth && li === 3) html = `<span class="hlline">${html}</span>`;
      out.push(html);
    });
    return out.join("\n") + (chars < reqTotal ? '<span class="caret"></span>' : "");
  }

  // ---------- scene 7: packet path
  const flow = document.getElementById("flow");
  const packet = document.getElementById("packet");
  const fnodes = [...document.querySelectorAll(".fnode")];

  // ---------- background particles
  const canvas = document.getElementById("particles");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const PARTS = Array.from({ length: 46 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, r: 1.5 + hash(i, 3) * 3, vx: (hash(i, 4) - 0.5) * 14, vy: -6 - hash(i, 5) * 14, a: 0.15 + hash(i, 6) * 0.35 }));
  function drawParticles(t) {
    ctx.clearRect(0, 0, W, H);
    for (const p of PARTS) {
      const x = (((p.x + p.vx * t) % W) + W) % W;
      const y = (((p.y + p.vy * t) % H) + H) % H;
      ctx.beginPath();
      ctx.fillStyle = `rgba(6,182,212,${p.a})`;
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- generic reveal
  const sceneEls = S.scenes.map((sc) => {
    const el = document.getElementById("s-" + sc.id);
    const items = [...el.querySelectorAll("[data-in]")].map((e) => ({ e, at: parseFloat(e.dataset.in) }));
    return { sc, el, items };
  });
  const basisEl = document.getElementById("basis");
  const BASIS = { verified: "✓ যাচাইকৃত: Sonicium Entropy API ডকুমেন্টেশন", illustrative: "ধারণাগত চিত্র", brand: "" };
  const subEl = document.getElementById("subtext");
  const subBox = document.getElementById("subs");
  const bar = document.getElementById("bar");

  function renderAt(t) {
    drawParticles(t);
    bar.style.width = `${(100 * clamp(t / S.duration)).toFixed(3)}%`;

    let active = null;
    for (const { sc, el, items } of sceneEls) {
      const local = t - sc.start;
      const last = sc === S.scenes[S.scenes.length - 1];
      const fin = easeOut(local / 0.6);
      const fout = last ? 1 : 1 - easeInOut((t - (sc.end - 0.5)) / 0.5);
      const a = t >= sc.start && t < sc.end + (last ? 1 : 0) ? Math.min(fin, fout) : 0;
      el.style.opacity = a.toFixed(3);
      el.style.visibility = a > 0 ? "visible" : "hidden";
      el.style.transform = `translateY(${((1 - fin) * 18).toFixed(2)}px)`;
      if (a <= 0) continue;
      active = sc;
      for (const { e, at } of items) {
        const p = easeOut((local - at) / 0.7);
        e.style.opacity = p.toFixed(3);
        e.style.transform = `translateY(${((1 - p) * 26).toFixed(2)}px)`;
      }
      SCENE_FX[sc.id]?.(local, t);
    }

    const b = active ? BASIS[active.basis] : "";
    basisEl.textContent = b;
    basisEl.className = "basis " + (active ? active.basis : "");
    basisEl.style.opacity = b ? "1" : "0";

    let cue = null;
    for (const sc of S.scenes) for (const c of sc.cues) if (t >= c[0] && t < c[1]) cue = c;
    if (cue) {
      if (subEl.textContent !== cue[2]) subEl.textContent = cue[2];
      const k = Math.min(clamp((t - cue[0]) / 0.25), clamp((cue[1] - t) / 0.2));
      subBox.style.opacity = k.toFixed(3);
    } else {
      subEl.textContent = "";
    }
  }

  const SCENE_FX = {
    challenge(local) {
      leds.forEach((l, i) => {
        const v = hash(i, Math.floor(local * 5 + hash(i, 9) * 5));
        l.className = "led" + (v > 0.55 ? (i % 2 ? " on" : " blue") : "");
      });
      netEdges.forEach(([a, b], i) => {
        const speed = 0.35 + hash(i, 11) * 0.3;
        const ph = (local * speed + hash(i, 12)) % 1;
        const fwd = hash(i, 13) > 0.5;
        const [x1, y1] = netNodes[fwd ? a : b];
        const [x2, y2] = netNodes[fwd ? b : a];
        const vis = clamp((local - 0.8) / 0.6);
        packets[i].setAttribute("transform", `translate(${x1 + (x2 - x1) * ph},${y1 + (y2 - y1) * ph})`);
        packets[i].setAttribute("opacity", (vis * Math.sin(ph * Math.PI)).toFixed(3));
      });
    },
    why(local) {
      const shown = Math.floor(clamp((local - 2.6) / 3.0) * CELLS);
      weakCells.forEach((c, i) => {
        if (i === CELLS - 1) {
          c.textContent = local > 6.0 ? weakPattern[i % 4] : "??";
          c.className = local > 6.0 ? "rep next" : "next";
        } else {
          c.textContent = i < shown ? weakPattern[i % 4] : "··";
          c.className = i < shown && i >= 4 ? "rep" : "";
        }
      });
      const tick = Math.floor(local * 4);
      strongCells.forEach((c, i) => {
        const revealAt = Math.floor(clamp((local - 3.4) / 3.0) * CELLS);
        c.textContent = i < revealAt ? hex2(hash(i * 97 + 7, i < revealAt - 6 ? 1 : tick)) : "··";
      });
    },
    api(local) {
      const step = local < 5 ? 0 : local < 9.5 ? 1 : local < 14 ? 2 : 3;
      steps.forEach((li, i) => { li.className = i === step ? "active" : i < step ? "done" : ""; });
      const chars = Math.floor(clamp((local - 0.8) / 3.6) * reqTotal);
      reqEl.innerHTML = renderReq(chars, local >= 5 && local < 9.5);
      authBadge.style.opacity = clamp((local - 5.6) / 0.4).toFixed(3);
      const rl = Math.floor(clamp((local - 9.6) / 3.2) * RESP.length + (local >= 9.6 ? 1 : 0));
      respEl.innerHTML = RESP.slice(0, Math.min(rl, RESP.length)).join("\n") || " ";
      const vl = Math.floor(clamp((local - 14.3) / 2.8) * VAL.length + (local >= 14.3 ? 1 : 0));
      valEl.innerHTML = VAL.slice(0, Math.min(vl, VAL.length)).join("\n") || " ";
    },
    workflow(local) {
      const fr = flow.getBoundingClientRect();
      const pts = fnodes.map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - fr.left, r.top + r.height / 2 - fr.top]; });
      const cyc = ((local - 3.0) / 2.6) % 1;
      if (local < 3.0) { packet.style.opacity = "0"; return; }
      const seg = cyc * (pts.length - 1);
      const i = Math.min(pts.length - 2, Math.floor(seg));
      const f = easeInOut(seg - i);
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      packet.style.opacity = "1";
      packet.style.transform = `translate(${x - 9}px, ${y - 9}px)`;
    },
  };

  window.renderAt = renderAt;
  window.ready = document.fonts.ready.then(() => { renderAt(0); return true; });
  // Live preview when opened directly in a browser: index.html?play
  if (params.has("play")) {
    const t0 = performance.now();
    const loop = () => { renderAt(((performance.now() - t0) / 1000) % S.duration); requestAnimationFrame(loop); };
    window.ready.then(loop);
  } else if (params.has("t")) {
    window.ready.then(() => renderAt(parseFloat(params.get("t"))));
  }
})();
