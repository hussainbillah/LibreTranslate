// Deterministic animation engine. window.renderAt(t) draws the frame at time t
// (seconds); nothing reads the wall clock, so tools/render.mjs can step frame
// by frame and every render is identical.
//
// Reveal timing is anchored to narration cues, not fixed seconds:
//   data-in="1.2"    1.2 s after the scene starts
//   data-in="c2+0.5" 0.5 s after the scene's third cue starts
//   data-out="c3"    fade out when the scene's fourth cue starts
// so replacing the estimated timing with a recorded voice-over (tools/timing.mjs
// --voice) keeps every visual beat on its spoken line.
(function () {
  const S = window.SCRIPT, T = window.TIMING, M = window.MAP;
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const BN = "০১২৩৪৫৬৭৮৯";
  const bn = (n) => String(n).replace(/\d/g, (d) => BN[d]);
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };

  // ---- cue table: attach measured/estimated times to each scene's cues
  let ci = 0;
  for (const sc of S.scenes) sc.times = sc.cues.map(() => T.cues[ci++]);
  if (ci !== T.cues.length) console.error("timing.js does not match script.js — run tools/timing.mjs");
  const at = (spec, sc) => {
    if (spec === undefined) return null;
    const m = /^c(\d+)([+-][\d.]+)?$/.exec(spec.trim());
    if (!m) return parseFloat(spec);
    return sc.times[+m[1]][0] - sc.start + (m[2] ? parseFloat(m[2]) : 0);
  };
  const cueT = (sc, k) => sc.times[k][0] - sc.start;
  const cueEnd = (sc, k) => sc.times[k][1] - sc.start;

  // ---- icons
  const ICONS = {
    lock: '<rect x="9" y="20" width="30" height="22" rx="4"/><path d="M15 20v-6a9 9 0 0 1 18 0v6"/><circle cx="24" cy="31" r="3"/>',
    cloud: '<path d="M14 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2A9 9 0 0 0 14 36Z"/>',
    gov: '<path d="M6 18 24 8l18 10M9 18h30M12 22v14M20 22v14M28 22v14M36 22v14M7 40h34"/>',
    bank: '<rect x="6" y="12" width="36" height="24" rx="4"/><path d="M6 20h36M12 29h8"/>',
    server: '<rect x="9" y="7" width="30" height="10" rx="2"/><rect x="9" y="19" width="30" height="10" rx="2"/><rect x="9" y="31" width="30" height="10" rx="2"/><path d="M15 12h2M15 24h2M15 36h2"/>',
    chip: '<rect x="13" y="13" width="22" height="22" rx="3"/><rect x="19" y="19" width="10" height="10" rx="1"/><path d="M18 6v7M24 6v7M30 6v7M18 35v7M24 35v7M30 35v7M6 18h7M6 24h7M6 30h7M35 18h7M35 24h7M35 30h7"/>',
    brain: '<circle cx="12" cy="14" r="4"/><circle cx="12" cy="34" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="36" cy="14" r="4"/><circle cx="36" cy="34" r="4"/><path d="M16 15l5 6M16 33l5-6M27 21l5-5M27 27l5 5"/>',
    dice: '<rect x="8" y="8" width="32" height="32" rx="6"/><circle cx="17" cy="17" r="2.5"/><circle cx="31" cy="31" r="2.5"/><circle cx="24" cy="24" r="2.5"/>',
    gauge: '<path d="M8 32a16 16 0 0 1 32 0"/><path d="M24 32l8-10"/><circle cx="24" cy="32" r="2.5"/>',
    check: '<path d="M24 6 40 12v12c0 9-7 15-16 18C15 39 8 33 8 24V12Z"/><path d="m17 24 5 5 9-10"/>',
    doc: '<path d="M13 6h15l8 8v28H13z"/><path d="M28 6v8h8M18 24h13M18 31h13"/>',
    people: '<circle cx="17" cy="16" r="5"/><circle cx="32" cy="18" r="4"/><path d="M7 38c1-7 6-11 10-11s9 4 10 11M27 38c1-5 3-8 6-8s6 3 7 8"/>',
    cap: '<path d="M4 18 24 9l20 9-20 9z"/><path d="M12 22v9c4 4 20 4 24 0v-9M42 19v10"/>',
    globe: '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-6 6-6 28 0 34M24 7c6 6 6 28 0 34"/>',
    hand: '<path d="M6 24l8-8 8 4 6-4 14 10-8 8-6-5M14 16l-8 8 10 10 6-4"/>',
    chart: '<path d="M8 40V8M8 40h32"/><path d="m14 32 8-9 6 5 10-13"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon] ?? ""}</svg>`;
  });

  // ---- scene 1: world map (Natural Earth), Bangladesh highlighted, arcs to global nodes
  const wm = document.getElementById("worldmap");
  const wg = svgEl("g", {}, wm);
  svgEl("path", { d: M.land, fill: "#dde7f6", stroke: "#c2d2ea", "stroke-width": 1 }, wg);
  svgEl("path", { d: M.bd, fill: "#006a4e", stroke: "#004c38", "stroke-width": 0.8 }, wg);
  const [dx, dy] = M.cities.dhaka;
  const arcs = Object.entries(M.cities).filter(([k]) => k !== "dhaka").map(([k, [x, y]], i) => {
    const mx = (dx + x) / 2, my = (dy + y) / 2 - Math.hypot(x - dx, y - dy) * 0.28;
    const p = svgEl("path", { d: `M${dx},${dy} Q${mx},${my} ${x},${y}`, fill: "none", stroke: "#06b6d4", "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.85 }, wg);
    const node = svgEl("circle", { cx: x, cy: y, r: 5, fill: "#2563eb" }, wg);
    const pk = svgEl("circle", { r: 4.5, fill: "#0e7490" }, wg);
    return { p, node, pk, len: p.getTotalLength(), i };
  });
  const pulse = svgEl("circle", { cx: dx, cy: dy, r: 8, fill: "none", stroke: "#f42a41", "stroke-width": 3 }, wg);
  svgEl("circle", { cx: dx, cy: dy, r: 6, fill: "#f42a41" }, wg);
  const dlabel = svgEl("text", { x: dx + 14, y: dy + 30, "font-size": 26, "font-weight": 700, fill: "#0f2a5f", "font-family": "Noto Sans Bengali" }, wg);
  dlabel.textContent = "ঢাকা";

  // ---- scene 2: faint quantum-circuit background and collaboration diagram
  const cb = document.getElementById("circuitbg");
  for (let r = 0; r < 7; r++) {
    const y = 300 + r * 105;
    svgEl("line", { x1: 0, y1: y, x2: 1920, y2: y, stroke: "#c9d8ef", "stroke-width": 2 }, cb);
    for (let c = 0; c < 9; c++) {
      const x = 120 + c * 210 + (r % 2) * 60;
      if (hash(r, c) < 0.45) { svgEl("rect", { x: x - 22, y: y - 22, width: 44, height: 44, rx: 6, fill: "#fff", stroke: "#b9cdea", "stroke-width": 2 }, cb); const tx = svgEl("text", { x: x, y: y + 8, "text-anchor": "middle", "font-size": 22, fill: "#9fb4d8", "font-family": "Inter" }, cb); tx.textContent = hash(c, r) < 0.5 ? "H" : "R"; }
      else if (hash(r, c) < 0.6 && r < 6) { svgEl("circle", { cx: x, cy: y, r: 7, fill: "#b9cdea" }, cb); svgEl("line", { x1: x, y1: y, x2: x, y2: y + 105, stroke: "#b9cdea", "stroke-width": 2 }, cb); svgEl("circle", { cx: x, cy: y + 105, r: 14, fill: "none", stroke: "#b9cdea", "stroke-width": 2 }, cb); }
    }
  }
  const cs = document.getElementById("collabsvg");
  const collabNodes = [[320, 165, "Sonicium Quantum Lab", true], [110, 60, "বিশ্ববিদ্যালয়"], [530, 60, "শিল্প"], [320, 290, "সরকার"]];
  const collabLines = collabNodes.slice(1).map(([x, y]) => svgEl("line", { x1: 320, y1: 165, x2: x, y2: y, stroke: "#06b6d4", "stroke-width": 3, "stroke-dasharray": "8 8" }, cs));
  for (const [x, y, label, center] of collabNodes) {
    const w = center ? 330 : 190;
    svgEl("rect", { x: x - w / 2, y: y - 30, width: w, height: 60, rx: 30, fill: center ? "#0f2a5f" : "#fff", stroke: center ? "#0f2a5f" : "#9fb4d8", "stroke-width": 2 }, cs);
    const tx = svgEl("text", { x, y: y + 9, "text-anchor": "middle", "font-size": center ? 24 : 25, "font-weight": 600, fill: center ? "#fff" : "#0f2a5f", "font-family": "Inter, Noto Sans Bengali" }, cs);
    tx.textContent = label;
  }

  // ---- scene 3: processor die, circuit, histogram
  const die = document.getElementById("die");
  const regEls = { Q63: document.getElementById("rq63"), Q135: document.getElementById("rq135") };
  let dieReg = null, dieDots = [];
  const setDie = (reg) => {
    if (dieReg === reg) return;
    dieReg = reg;
    const [cols, rows] = reg === "Q63" ? [9, 7] : [15, 9];
    die.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    die.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    die.innerHTML = "<i></i>".repeat(cols * rows);
    dieDots = [...die.children];
    for (const k in regEls) regEls[k].className = k === reg ? "on" : "";
  };
  setDie("Q63");
  const circ = document.getElementById("circsvg");
  const q0 = svgEl("text", { x: 10, y: 70, "font-size": 30, fill: "#0f2a5f", "font-family": "JetBrains Mono" }, circ); q0.textContent = "|0⟩";
  svgEl("line", { x1: 80, y1: 60, x2: 430, y2: 60, stroke: "#9fb4d8", "stroke-width": 3 }, circ);
  svgEl("rect", { x: 150, y: 30, width: 60, height: 60, rx: 8, fill: "#fff", stroke: "#2563eb", "stroke-width": 3 }, circ);
  const hT = svgEl("text", { x: 180, y: 72, "text-anchor": "middle", "font-size": 32, "font-weight": 700, fill: "#2563eb", "font-family": "Inter" }, circ); hT.textContent = "H";
  svgEl("rect", { x: 300, y: 30, width: 70, height: 60, rx: 8, fill: "#fff", stroke: "#0f2a5f", "stroke-width": 3 }, circ);
  svgEl("path", { d: "M312 76a23 23 0 0 1 46 0", fill: "none", stroke: "#0f2a5f", "stroke-width": 3 }, circ);
  const needle = svgEl("line", { x1: 335, y1: 76, x2: 352, y2: 48, stroke: "#0f2a5f", "stroke-width": 3 }, circ);
  const outT = svgEl("text", { x: 455, y: 72, "font-size": 34, "font-weight": 700, fill: "#06b6d4", "font-family": "JetBrains Mono" }, circ);
  const qdot = svgEl("circle", { cx: 80, cy: 60, r: 9, fill: "#06b6d4" }, circ);
  const b0 = document.getElementById("b0"), b1 = document.getElementById("b1"), p0 = document.getElementById("p0"), p1 = document.getElementById("p1"), bitsEl = document.getElementById("bits");
  const rungs = [...document.querySelectorAll(".rung")];

  // ---- scene 4
  const wsteps = [...document.querySelectorAll(".wsteps li")];
  const anodes = [...document.querySelectorAll(".anode")];
  const arch = document.getElementById("arch"), apacket = document.getElementById("apacket");
  const STEP_GROUP = [0, 1, 2, 2, 3, 3, 4];

  // ---- scene 7: stakeholders
  const st = document.getElementById("stakesvg");
  const stakeNodes = [[380, 150, "কারিগরি পাইলট", true], [150, 55, "সরকারি প্রযুক্তি সংস্থা"], [610, 55, "বিশ্ববিদ্যালয় ও গবেষণা"], [150, 250, "শিল্প ও ডেটা সেন্টার"], [610, 250, "Sonicium Quantum Lab"]];
  const stakeLines = stakeNodes.slice(1).map(([x, y]) => svgEl("line", { x1: 380, y1: 150, x2: x, y2: y, stroke: "#9fb4d8", "stroke-width": 3 }, st));
  const stakeDots = stakeNodes.slice(1).map(() => svgEl("circle", { r: 7, fill: "#06b6d4" }, st));
  for (const [x, y, label, center] of stakeNodes) {
    const w = center ? 250 : 290;
    svgEl("rect", { x: x - w / 2, y: y - 30, width: w, height: 60, rx: 30, fill: center ? "#006a4e" : "#fff", stroke: center ? "#006a4e" : "#9fb4d8", "stroke-width": 2 }, st);
    const tx = svgEl("text", { x, y: y + 9, "text-anchor": "middle", "font-size": 24, "font-weight": 600, fill: center ? "#fff" : "#0f2a5f", "font-family": "Inter, Noto Sans Bengali" }, st);
    tx.textContent = label;
  }
  const phs = [...document.querySelectorAll(".ph")], rfill = document.getElementById("rfill");

  // ---- scene 8: Bangladesh outline
  const bz = document.getElementById("bdzoom");
  const bzRings = [0, 1, 2].map(() => svgEl("circle", { cx: M.dhakaZoom[0], cy: M.dhakaZoom[1], r: 10, fill: "none", stroke: "#06b6d4", "stroke-width": 2 }, bz));
  svgEl("path", { d: M.bdZoom, fill: "rgba(0,106,78,.12)", stroke: "#006a4e", "stroke-width": 3, "stroke-linejoin": "round" }, bz);
  svgEl("circle", { cx: M.dhakaZoom[0], cy: M.dhakaZoom[1], r: 11, fill: "#f42a41" }, bz);
  const bzl = svgEl("text", { x: M.dhakaZoom[0] + 20, y: M.dhakaZoom[1] + 9, "font-size": 30, "font-weight": 700, fill: "#0f2a5f", "font-family": "Noto Sans Bengali" }, bz); bzl.textContent = "ঢাকা";

  // ---- particles
  const canvas = document.getElementById("particles"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const PARTS = Array.from({ length: 50 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, r: 1.5 + hash(i, 3) * 3, vx: (hash(i, 4) - 0.5) * 12, vy: -5 - hash(i, 5) * 12, a: 0.12 + hash(i, 6) * 0.3, g: hash(i, 7) < 0.25 }));
  const drawParticles = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const p of PARTS) {
      ctx.beginPath(); ctx.fillStyle = p.g ? `rgba(0,106,78,${p.a})` : `rgba(6,182,212,${p.a})`;
      ctx.arc((((p.x + p.vx * t) % W) + W) % W, (((p.y + p.vy * t) % H) + H) % H, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };

  // ---- generic reveal
  const scenes = S.scenes.map((sc) => {
    const el = document.getElementById("s-" + sc.id);
    const items = [...el.querySelectorAll("[data-in],[data-out]")].map((e) => ({ e, tin: at(e.dataset.in, sc) ?? 0, tout: at(e.dataset.out, sc) }));
    return { sc, el, items };
  });
  const basisEl = document.getElementById("basis"), subEl = document.getElementById("subtext"), subBox = document.getElementById("subs"), bar = document.getElementById("bar");
  const BASIS = { verified: "✓ যাচাইকৃত: Sonicium Entropy প্রোডাক্ট ডকুমেন্টেশন", result: "প্রকৃত পরীক্ষার ফল · সীমাবদ্ধতাসহ", illustrative: "ধারণাগত / প্রতীকী চিত্র", proposal: "প্রস্তাবিত · অনুমোদিত কার্যক্রম নয়", brand: "" };

  function renderAt(t) {
    drawParticles(t);
    bar.style.width = `${(100 * clamp(t / S.duration)).toFixed(3)}%`;
    let active = null;
    for (const { sc, el, items } of scenes) {
      const local = t - sc.start, last = sc === S.scenes[S.scenes.length - 1];
      const fin = sc.start === 0 ? easeOut(local / 1.2) : easeOut(local / 0.7);
      const fout = last ? 1 : 1 - easeInOut((t - (sc.end - 0.6)) / 0.6);
      const a = t >= sc.start && t < sc.end + (last ? 1 : 0) ? Math.min(fin, fout) : 0;
      el.style.opacity = a.toFixed(3);
      el.style.visibility = a > 0 ? "visible" : "hidden";
      if (a <= 0) continue;
      active = sc;
      for (const { e, tin, tout } of items) {
        const pin = easeOut((local - tin) / 0.7);
        const pout = tout === null ? 1 : 1 - easeInOut((local - tout) / 0.5);
        const p = Math.min(pin, pout);
        e.style.opacity = p.toFixed(3);
        e.style.transform = `translateY(${((1 - pin) * 24 - (1 - pout) * 12).toFixed(2)}px)`;
        e.style.visibility = p > 0.001 ? "visible" : "hidden";
      }
      FX[sc.id]?.(local, sc, t);
    }
    let basis = active?.basis ?? "";
    if (active?.id === "entropy" && t >= active.times[4][0]) basis = "result";
    basisEl.textContent = BASIS[basis] ?? "";
    basisEl.className = "basis " + basis;
    basisEl.style.opacity = BASIS[basis] ? "1" : "0";
    let cue = null;
    S.scenes.forEach((sc) => sc.times.forEach(([a, b], k) => { if (t >= a && t < b) cue = { text: sc.cues[k], a, b, onscreen: sc.id === "closing" && k === 0 }; }));
    if (cue && !cue.onscreen) {
      if (subEl.textContent !== cue.text) subEl.textContent = cue.text;
      subBox.style.opacity = Math.min(clamp((t - cue.a) / 0.25), clamp((cue.b - t) / 0.2)).toFixed(3);
    } else subEl.textContent = "";
  }

  const FX = {
    opening(local) {
      const z = 1 + 0.32 * easeInOut(local / 24);
      wg.setAttribute("transform", `translate(${dx},${dy}) scale(${z.toFixed(4)}) translate(${-dx},${-dy})`);
      wm.style.opacity = (0.55 + 0.45 * easeOut(local / 2)).toFixed(3);
      for (const a of arcs) {
        const start = 2.0 + a.i * 0.45, d = clamp((local - start) / 1.4);
        a.p.setAttribute("stroke-dasharray", `${a.len}`);
        a.p.setAttribute("stroke-dashoffset", `${(a.len * (1 - easeInOut(d))).toFixed(1)}`);
        a.node.setAttribute("opacity", d.toFixed(2));
        const ph = ((local * 0.25 + hash(a.i, 3)) % 1);
        const pt = a.p.getPointAtLength(a.len * ph);
        a.pk.setAttribute("cx", pt.x.toFixed(1)); a.pk.setAttribute("cy", pt.y.toFixed(1));
        a.pk.setAttribute("opacity", d >= 1 ? (Math.sin(ph * Math.PI) * 0.9).toFixed(2) : "0");
      }
      const pp = (local % 1.6) / 1.6;
      pulse.setAttribute("r", (8 + pp * 26).toFixed(1)); pulse.setAttribute("opacity", (1 - pp).toFixed(2));
    },
    lab(local, sc) {
      const p = clamp((local - cueT(sc, 2)) / 1.2);
      collabLines.forEach((l, i) => { l.setAttribute("stroke-dashoffset", (-local * 24).toFixed(1)); l.setAttribute("opacity", clamp(p * 3 - i).toFixed(2)); });
      document.querySelector(".area.rng").classList.toggle("on", local >= cueT(sc, 3));
      document.getElementById("circuitbg").style.transform = `translateX(${(-local * 6).toFixed(1)}px)`;
    },
    entropy(local, sc) {
      const c1 = cueT(sc, 1), c1e = cueEnd(sc, 1);
      setDie(local < c1 + (c1e - c1) * 0.55 ? "Q63" : "Q135");
      const tick = Math.floor(local * 6);
      dieDots.forEach((d, i) => { const v = hash(i + 7, tick); d.className = v < 0.42 ? "on" : v > 0.86 ? "one" : ""; });
      // single-qubit circuit: |0> -> H -> measure, repeating every 1.5 s
      const cyc = ((local - cueT(sc, 2)) % 1.5 + 1.5) % 1.5 / 1.5;
      const shot = Math.floor((local - cueT(sc, 2)) / 1.5);
      qdot.setAttribute("cx", (80 + 255 * easeInOut(cyc / 0.7)).toFixed(1));
      qdot.setAttribute("opacity", cyc < 0.75 ? "1" : "0");
      const outcome = hash(shot, 99) < 0.5 ? 0 : 1;
      outT.textContent = cyc > 0.72 ? String(outcome) : "";
      needle.setAttribute("x2", cyc > 0.72 ? (outcome ? 352 : 318) : 335);
      // histogram of simulated fair outcomes (illustrative)
      const n = Math.max(0, Math.floor((local - cueT(sc, 2)) * 40));
      let ones = 0; for (let i = 0; i < n; i++) if (hash(i, 7) < 0.5) ones++;
      const f1 = n ? ones / n : 0.5;
      b0.style.height = `${(78 * (1 - f1) + 2).toFixed(1)}%`; b1.style.height = `${(78 * f1 + 2).toFixed(1)}%`;
      p0.textContent = bn(Math.round((1 - f1) * 100)) + "%"; p1.textContent = bn(Math.round(f1 * 100)) + "%";
      let s = ""; for (let i = Math.max(0, n - 260); i < n; i++) s += hash(i, 7) < 0.5 ? "1" : "0";
      bitsEl.textContent = s || "—";
      // ladder: walk the four stages during cue 3, then mark the tested stage during cue 4
      const c3 = cueT(sc, 3), c3e = cueEnd(sc, 3), c4 = cueT(sc, 4);
      const k = Math.floor(clamp((local - c3) / (c3e - c3), 0, 0.999) * 4);
      rungs.forEach((r, i) => { r.className = "rung" + (local >= c4 ? (i === 1 ? " res" : "") : local >= c3 && i === k ? " on" : ""); });
    },
    workflow(local, sc) {
      const cueOf = (k) => local >= cueT(sc, k) && (k + 1 >= sc.times.length || local < cueT(sc, k + 1));
      let activeStep = -1;
      if (cueOf(1)) activeStep = local < cueT(sc, 1) + (cueEnd(sc, 1) - cueT(sc, 1)) / 2 ? 0 : 1;
      else if (cueOf(2)) activeStep = 2;
      else if (cueOf(3)) activeStep = 3;
      else if (cueOf(4)) activeStep = 4 + Math.min(2, Math.floor(((local - cueT(sc, 4)) / (cueEnd(sc, 4) - cueT(sc, 4))) * 3));
      const doneUpTo = cueOf(5) ? 7 : activeStep;
      wsteps.forEach((li, i) => { li.className = i === activeStep ? "on" : i < doneUpTo ? "done" : ""; });
      anodes.forEach((n, g) => n.classList.toggle("on", activeStep >= 0 && STEP_GROUP[activeStep] === g));
      if (local >= cueT(sc, 0) + 1.2) {
        const ar = arch.getBoundingClientRect();
        const pts = anodes.map((n) => { const r = n.getBoundingClientRect(); return r.left + r.width / 2 - ar.left; });
        const cyc = ((local * 0.22) % 1) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(cyc));
        apacket.style.opacity = "1";
        apacket.style.transform = `translateX(${(pts[i] + (pts[i + 1] - pts[i]) * easeInOut(cyc - i) - 9).toFixed(1)}px)`;
      } else apacket.style.opacity = "0";
    },
    proposal(local, sc) {
      const on = local >= cueT(sc, 3) ? 3 : local >= cueT(sc, 2) ? 2 : local >= cueT(sc, 1) + 3.5 ? 1 : local >= cueT(sc, 1) ? 0 : -1;
      phs.forEach((p, i) => p.classList.toggle("on", i <= on));
      rfill.style.width = `${on < 0 ? 0 : ((on + 1) / 4) * 100}%`;
      stakeNodes.slice(1).forEach(([x, y], i) => {
        const ph = ((local * 0.4 + i * 0.25) % 1);
        stakeDots[i].setAttribute("cx", (x + (380 - x) * ph).toFixed(1)); stakeDots[i].setAttribute("cy", (y + (150 - y) * ph).toFixed(1));
        stakeDots[i].setAttribute("opacity", (Math.sin(ph * Math.PI) * clamp(local - 1)).toFixed(2));
        stakeLines[i].setAttribute("stroke", local > cueT(sc, 0) + 1 ? "#06b6d4" : "#9fb4d8");
      });
    },
    closing(local) {
      bz.style.opacity = (0.9 * easeOut(local / 1.5)).toFixed(3);
      bzRings.forEach((r, i) => { const p = ((local / 2.4) + i / 3) % 1; r.setAttribute("r", (10 + p * 120).toFixed(1)); r.setAttribute("opacity", (1 - p).toFixed(2)); });
    },
  };

  window.renderAt = renderAt;
  window.ready = document.fonts.ready.then(() => { renderAt(0); return true; });
  const params = new URLSearchParams(location.search);
  if (params.has("play")) { const t0 = performance.now(); const loop = () => { renderAt(((performance.now() - t0) / 1000) % S.duration); requestAnimationFrame(loop); }; window.ready.then(loop); }
  else if (params.has("t")) window.ready.then(() => renderAt(parseFloat(params.get("t"))));
})();
