// Deterministic animation engine for the investor film. window.renderAt(t)
// draws the frame at time t; nothing reads the wall clock.
//
// Timing:  src/timing.js (scene bounds, cue times, subtitle chunks)
// Numbers: src/data.js   (built from sonicium_entropy_financial_model.json)
// Reveals are anchored to narration cues: data-in="c2+0.5" = 0.5 s after the
// scene's third sentence starts; data-out="c3" fades out when the fourth starts.
(function () {
  const S = window.SCRIPT, T = window.TIMING, M = window.MAP, D = window.DATA;
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; parent?.appendChild(e); return e; };
  const usd = (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2)}M` : `$${Math.round(v / 1e3)}K`);
  const FONT = "Inter, Noto Sans Bengali";

  // ---- timing
  let ci = 0;
  S.duration = T.duration;
  S.scenes.forEach((sc, i) => { [sc.start, sc.end] = T.scenes[i]; sc.first = ci; sc.times = sc.cues.map(() => T.cues[ci++]); });
  if (ci !== T.cues.length) console.error("timing.js does not match script.js — run tools/timing.mjs");
  const hiddenCue = new Set(S.scenes.flatMap((sc) => (sc.onscreen ?? []).map((k) => sc.first + k)));
  const cueT = (sc, k) => sc.times[k][0] - sc.start;
  const at = (spec, sc) => {
    if (spec === undefined) return null;
    const m = /^c(\d+)([+-][\d.]+)?$/.exec(spec.trim());
    return m ? cueT(sc, +m[1]) + (m[2] ? parseFloat(m[2]) : 0) : parseFloat(spec);
  };
  const scene = (id) => S.scenes.find((s) => s.id === id);

  // ---- icons
  const ICONS = {
    lock: '<rect x="9" y="20" width="30" height="22" rx="4"/><path d="M15 20v-6a9 9 0 0 1 18 0v6"/><circle cx="24" cy="31" r="3"/>',
    cloud: '<path d="M14 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2A9 9 0 0 0 14 36Z"/>',
    bank: '<rect x="6" y="12" width="36" height="24" rx="4"/><path d="M6 20h36M12 29h8"/>',
    server: '<rect x="9" y="7" width="30" height="10" rx="2"/><rect x="9" y="19" width="30" height="10" rx="2"/><rect x="9" y="31" width="30" height="10" rx="2"/><path d="M15 12h2M15 24h2M15 36h2"/>',
    chip: '<rect x="13" y="13" width="22" height="22" rx="3"/><rect x="19" y="19" width="10" height="10" rx="1"/><path d="M18 6v7M24 6v7M30 6v7M18 35v7M24 35v7M30 35v7M6 18h7M6 24h7M6 30h7M35 18h7M35 24h7M35 30h7"/>',
    brain: '<circle cx="12" cy="14" r="4"/><circle cx="12" cy="34" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="36" cy="14" r="4"/><circle cx="36" cy="34" r="4"/><path d="M16 15l5 6M16 33l5-6M27 21l5-5M27 27l5 5"/>',
    dice: '<rect x="8" y="8" width="32" height="32" rx="6"/><circle cx="17" cy="17" r="2.5"/><circle cx="31" cy="31" r="2.5"/><circle cx="24" cy="24" r="2.5"/>',
    gauge: '<path d="M8 32a16 16 0 0 1 32 0"/><path d="M24 32l8-10"/><circle cx="24" cy="32" r="2.5"/>',
    check: '<path d="M24 6 40 12v12c0 9-7 15-16 18C15 39 8 33 8 24V12Z"/><path d="m17 24 5 5 9-10"/>',
    cap: '<path d="M4 18 24 9l20 9-20 9z"/><path d="M12 22v9c4 4 20 4 24 0v-9M42 19v10"/>',
    chart: '<path d="M8 40V8M8 40h32"/><path d="m14 32 8-9 6 5 10-13"/>',
    key: '<circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M43 24v5"/>',
    token: '<rect x="5" y="12" width="38" height="24" rx="4"/><path d="M12 20h12M12 27h20"/><circle cx="35" cy="21" r="3"/>',
    code: '<path d="M17 14 7 24l10 10M31 14l10 10-10 10M27 10l-6 28"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon] ?? ""}</svg>`; });

  // ---- roadmap phases from the financial model (proposed targets)
  const roadmap = document.querySelector("#s-investment .roadmap");
  D.roadmap.forEach((p, i) => {
    roadmap.insertAdjacentHTML("beforeend", `<div class="ph" data-in="c0+${(0.8 + i * 0.9).toFixed(1)}"><span>ধাপ ${"১২৩৪"[i]}</span><b>${p.name_bn}</b><em class="tgt">${p.kpi_bn}</em></div>`);
  });
  const phs = [...roadmap.querySelectorAll(".ph")], rfill = document.getElementById("rfill");

  // ---- 1: world map
  const wm = document.getElementById("worldmap");
  const wg = svgEl("g", {}, wm);
  svgEl("path", { d: M.land, fill: "#dde7f6", stroke: "#c2d2ea", "stroke-width": 1 }, wg);
  svgEl("path", { d: M.bd, fill: "#006a4e", stroke: "#004c38", "stroke-width": 0.8 }, wg);
  const [dx, dy] = M.cities.dhaka;
  const arcs = Object.entries(M.cities).filter(([k]) => k !== "dhaka").map(([, [x, y]], i) => {
    const mx = (dx + x) / 2, my = (dy + y) / 2 - Math.hypot(x - dx, y - dy) * 0.28;
    const p = svgEl("path", { d: `M${dx},${dy} Q${mx},${my} ${x},${y}`, fill: "none", stroke: "#06b6d4", "stroke-width": 2.2, opacity: 0.85 }, wg);
    return { p, node: svgEl("circle", { cx: x, cy: y, r: 5, fill: "#2563eb" }, wg), pk: svgEl("circle", { r: 4.5, fill: "#0e7490" }, wg), len: p.getTotalLength(), i };
  });
  const pulse = svgEl("circle", { cx: dx, cy: dy, r: 8, fill: "none", stroke: "#f42a41", "stroke-width": 3 }, wg);
  svgEl("circle", { cx: dx, cy: dy, r: 6, fill: "#f42a41" }, wg);

  // ---- 2: QRNG bars, QC estimates, nested markets
  const qc = document.getElementById("qrngchart");
  const pts = D.market.qrng.points, maxV = 4.4;
  const baseY = 380, topY = 30, xs = [120, 300, 700];
  svgEl("line", { x1: 60, y1: baseY, x2: 840, y2: baseY, stroke: "#c9d8ef", "stroke-width": 2 }, qc);
  [1, 2, 3, 4].forEach((v) => { const y = baseY - (v / maxV) * (baseY - topY); svgEl("line", { x1: 60, y1: y, x2: 840, y2: y, stroke: "#eef3fb", "stroke-width": 1.5 }, qc); svgEl("text", { x: 50, y: y + 6, "text-anchor": "end", "font-size": 18, fill: "#8a9bbd", "font-family": FONT }, qc, `$${v}B`); });
  const qbars = pts.map((p, i) => {
    const r = svgEl("rect", { x: xs[i] - 55, width: 110, rx: 10, fill: i === 2 ? "url(#gq)" : "#9fb4d8" }, qc);
    const lab = svgEl("text", { x: xs[i], "text-anchor": "middle", "font-size": i === 2 ? 40 : 28, "font-weight": 800, fill: i === 2 ? "#1d4ed8" : "#0f2a5f", "font-family": FONT }, qc, `$${p.usd_bn.toFixed(2)}B`);
    svgEl("text", { x: xs[i], y: baseY + 34, "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#0f2a5f", "font-family": FONT }, qc, String(p.year));
    return { r, lab, v: p.usd_bn, i };
  });
  const defs = svgEl("defs", {}, qc);
  const gq = svgEl("linearGradient", { id: "gq", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  svgEl("stop", { offset: "0", "stop-color": "#06b6d4" }, gq); svgEl("stop", { offset: "1", "stop-color": "#2563eb" }, gq);
  svgEl("text", { x: 500, y: baseY - 20, "text-anchor": "middle", "font-size": 30, fill: "#9fb4d8", "font-family": FONT }, qc, "· · ·");
  const cagr = svgEl("g", { opacity: 0 }, qc);
  svgEl("path", { d: "M330 250 Q520 120 640 90", fill: "none", stroke: "#06b6d4", "stroke-width": 4, "stroke-dasharray": "10 8" }, cagr);
  svgEl("text", { x: 470, y: 150, "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#0e7490", "font-family": FONT }, cagr, `CAGR ≈ ${(D.market.qrng.cagr_2026_2030 * 100).toFixed(1)}%`);
  svgEl("text", { x: 470, y: 178, "text-anchor": "middle", "font-size": 18, fill: "#4a5b7c", "font-family": FONT }, cagr, "২০২৬–২০৩০ (প্রকাশিত পূর্বাভাস)");

  const qcc = document.getElementById("qcchart");
  const qcmax = 22;
  const qcBars = D.market.quantum_computing_2030.map((e, i) => {
    const y = 20 + i * 82;
    svgEl("text", { x: 0, y: y + 22, "font-size": 21, "font-weight": 700, fill: "#0f2a5f", "font-family": FONT }, qcc, e.publisher);
    svgEl("text", { x: 0, y: y + 48, "font-size": 16, fill: "#4a5b7c", "font-family": FONT }, qcc, e.published);
    const r = svgEl("rect", { x: 230, y: y + 8, height: 40, rx: 8, fill: i ? "#2563eb" : "#06b6d4" }, qcc);
    const t = svgEl("text", { y: y + 36, "font-size": 24, "font-weight": 800, fill: "#0f2a5f", "font-family": FONT }, qcc, `$${e.usd_bn.toFixed(2)}B`);
    return { r, t, v: e.usd_bn };
  });

  const ns = document.getElementById("nestsvg");
  const nestRects = [
    [10, 10, 540, 230, "কোয়ান্টাম প্রযুক্তি অর্থনীতি", "#eef4ff", "#c9d8f3"],
    [70, 60, 420, 170, "QRNG বাজার", "#e6f8fc", "#9fdbe8"],
    [130, 112, 300, 108, "API / ক্লাউড র‍্যান্ডমনেস সেবা", "#fff", "#2563eb"],
  ].map(([x, y, w, h, label, fill, stroke], i) => {
    const g = svgEl("g", {}, ns);
    const r = svgEl("rect", { x, y, width: w, height: h, rx: 22, fill, stroke, "stroke-width": i === 2 ? 3 : 2 }, g);
    svgEl("text", { x: x + w / 2, y: y + (i === 2 ? 46 : 32), "text-anchor": "middle", "font-size": i === 2 ? 22 : 20, "font-weight": 700, fill: i === 2 ? "#1d4ed8" : "#0f2a5f", "font-family": FONT }, g, label);
    if (i === 2) svgEl("text", { x: x + w / 2, y: y + 80, "text-anchor": "middle", "font-size": 18, fill: "#0e7490", "font-weight": 600, "font-family": FONT }, g, "Sonicium Entropy-এর লক্ষ্য");
    return r;
  });

  // ---- 3: architecture packet
  const arch = document.getElementById("arch"), apacket = document.getElementById("apacket"), anodes = [...arch.querySelectorAll(".anode")];

  // ---- 5: flywheel
  const fly = document.getElementById("flysvg");
  const flyNodes = ["কার্যকর পণ্য", "ডেভেলপার অভিজ্ঞতা", "গ্রাহক সম্পর্ক", "কৌশলগত অংশীদারত্ব"];
  const fcx = 280, fcy = 260, fr = 185;
  svgEl("circle", { cx: fcx, cy: fcy, r: fr, fill: "none", stroke: "#c9d8ef", "stroke-width": 3, "stroke-dasharray": "10 10" }, fly);
  svgEl("circle", { cx: fcx, cy: fcy, r: 92, fill: "#0f2a5f" }, fly);
  svgEl("text", { x: fcx, y: fcy - 6, "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#fff", "font-family": FONT }, fly, "প্রবৃদ্ধির");
  svgEl("text", { x: fcx, y: fcy + 26, "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#fff", "font-family": FONT }, fly, "ভিত্তি");
  const flyEls = flyNodes.map((label, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 2, x = fcx + fr * Math.cos(a), y = fcy + fr * Math.sin(a);
    const g = svgEl("g", {}, fly);
    const r = svgEl("rect", { x: x - 120, y: y - 30, width: 240, height: 60, rx: 30, fill: "#fff", stroke: "#9fb4d8", "stroke-width": 2.5 }, g);
    svgEl("text", { x, y: y + 9, "text-anchor": "middle", "font-size": 23, "font-weight": 700, fill: "#0f2a5f", "font-family": FONT }, g, label);
    return r;
  });
  const flyDot = svgEl("circle", { r: 10, fill: "#06b6d4" }, fly);

  // ---- 6: share bars, funnel, scenario lines
  const sh = document.getElementById("sharesvg");
  const shMax = D.shares.at(-1).usd * 1.12, shBase = 340, shTop = 40;
  svgEl("line", { x1: 40, y1: shBase, x2: 1000, y2: shBase, stroke: "#c9d8ef", "stroke-width": 2 }, sh);
  const shBars = D.shares.map((s, i) => {
    const x = 120 + i * 240;
    const r = svgEl("rect", { x: x - 70, width: 140, rx: 10, fill: s.share === 0.001 ? "url(#gs)" : "#9fb4d8" }, sh);
    const t = svgEl("text", { x, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#0f2a5f", "font-family": FONT }, sh, usd(s.usd));
    svgEl("text", { x, y: shBase + 38, "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: s.share === 0.001 ? "#1d4ed8" : "#4a5b7c", "font-family": FONT }, sh, `${(s.share * 100).toString()}%`);
    return { r, t, s, x };
  });
  const gsd = svgEl("defs", {}, sh), gs = svgEl("linearGradient", { id: "gs", x1: 0, y1: 0, x2: 0, y2: 1 }, gsd);
  svgEl("stop", { offset: "0", "stop-color": "#06b6d4" }, gs); svgEl("stop", { offset: "1", "stop-color": "#2563eb" }, gs);
  const shHi = svgEl("rect", { x: 300, y: 20, width: 160, height: 360, rx: 16, fill: "none", stroke: "#06b6d4", "stroke-width": 4, opacity: 0 }, sh);

  const fu = document.getElementById("funnelsvg");
  const funnel = [
    ["TAM", usd(D.tam), "২০৩০ বৈশ্বিক QRNG বাজার · প্রকাশিত পূর্বাভাস", 520, "#0f2a5f"],
    ["SAM", usd(D.sam), `API/ক্লাউড-সরবরাহযোগ্য অংশ · অনুমান ${Math.round(D.samShare * 100)}%`, 400, "#1d4ed8"],
    ["SOM", usd(D.som), "বেস কেস ২০৩০ রান-রেট · বটম-আপ", 330, "#0e7490"],
  ].map(([k, v, note, w, col], i) => {
    const y = 20 + i * 150, g = svgEl("g", { opacity: 0 }, fu);
    svgEl("path", { d: `M${280 - w / 2},${y} L${280 + w / 2},${y} L${280 + w / 2 - 60},${y + 120} L${280 - w / 2 + 60},${y + 120} Z`, fill: col, opacity: 0.95 }, g);
    svgEl("text", { x: 280, y: y + 52, "text-anchor": "middle", "font-size": i === 2 ? 28 : 34, "font-weight": 800, fill: "#fff", "font-family": FONT }, g, `${k} · ${v}`);
    svgEl("text", { x: 280, y: y + 88, "text-anchor": "middle", "font-size": i === 2 ? 14 : 16, fill: "#e6efff", "font-family": FONT }, g, note);
    return g;
  });

  const sc = document.getElementById("scensvg");
  const years = D.scenarios.base.map((r) => r.year);
  const yMax = Math.ceil(Math.max(...D.scenarios.growth.map((r) => r.total)) / 1e6) * 1e6;
  const px = (i) => 110 + i * 215, py = (v) => 350 - (v / yMax) * 310;
  for (let v = 0; v <= yMax; v += 1e6) { svgEl("line", { x1: 90, y1: py(v), x2: 790, y2: py(v), stroke: "#eef3fb", "stroke-width": 1.5 }, sc); svgEl("text", { x: 80, y: py(v) + 6, "text-anchor": "end", "font-size": 18, fill: "#8a9bbd", "font-family": FONT }, sc, `$${v / 1e6}M`); }
  years.forEach((y, i) => svgEl("text", { x: px(i), y: 385, "text-anchor": "middle", "font-size": 21, "font-weight": 700, fill: "#0f2a5f", "font-family": FONT }, sc, String(y)));
  const SC = [["conservative", "রক্ষণশীল", "#9fb4d8"], ["base", "বেস কেস", "#2563eb"], ["growth", "প্রবৃদ্ধি", "#06b6d4"]];
  const scLines = SC.map(([k, label, col]) => {
    const rows = D.scenarios[k];
    const d = rows.map((r, i) => `${i ? "L" : "M"}${px(i)},${py(r.total)}`).join(" ");
    const p = svgEl("path", { d, fill: "none", stroke: col, "stroke-width": k === "base" ? 6 : 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, sc);
    const end = rows.at(-1);
    const t = svgEl("text", { x: px(3) + 16, y: py(end.total) + 7, "font-size": 20, "font-weight": 700, fill: col === "#9fb4d8" ? "#4a5b7c" : col, "font-family": FONT }, sc, `${label} ${usd(end.total)}`);
    return { p, t, len: p.getTotalLength() };
  });

  // ---- 7: partner network
  const pn = document.getElementById("partsvg");
  const pNodes = [[320, 150, "Sonicium Entropy", true], [140, 55, "বিশ্ববিদ্যালয়"], [500, 55, "গবেষণা প্রতিষ্ঠান"], [140, 245, "প্রযুক্তি কোম্পানি"], [500, 245, "আন্তর্জাতিক সহযোগী"]];
  const pLines = pNodes.slice(1).map(([x, y]) => svgEl("line", { x1: 320, y1: 150, x2: x, y2: y, stroke: "#06b6d4", "stroke-width": 3, "stroke-dasharray": "8 8" }, pn));
  for (const [x, y, label, c] of pNodes) {
    const w = c ? 270 : 230;
    svgEl("rect", { x: x - w / 2, y: y - 30, width: w, height: 60, rx: 30, fill: c ? "#0f2a5f" : "#fff", stroke: c ? "#0f2a5f" : "#9fb4d8", "stroke-width": 2 }, pn);
    svgEl("text", { x, y: y + 9, "text-anchor": "middle", "font-size": 23, "font-weight": 700, fill: c ? "#fff" : "#0f2a5f", "font-family": FONT }, pn, label);
  }
  svgEl("text", { x: 320, y: 296, "text-anchor": "middle", "font-size": 16, fill: "#92400e", "font-family": FONT }, pn, "সম্ভাব্য সহযোগিতা — কোনো স্বাক্ষরিত অংশীদারত্ব দাবি করা হচ্ছে না");

  // ---- 8: Bangladesh outline
  const bz = document.getElementById("bdzoom");
  const bzRings = [0, 1, 2].map(() => svgEl("circle", { cx: M.dhakaZoom[0], cy: M.dhakaZoom[1], r: 10, fill: "none", stroke: "#06b6d4", "stroke-width": 2 }, bz));
  svgEl("path", { d: M.bdZoom, fill: "rgba(0,106,78,.12)", stroke: "#006a4e", "stroke-width": 3, "stroke-linejoin": "round" }, bz);
  svgEl("circle", { cx: M.dhakaZoom[0], cy: M.dhakaZoom[1], r: 11, fill: "#f42a41" }, bz);
  svgEl("text", { x: M.dhakaZoom[0] + 20, y: M.dhakaZoom[1] + 9, "font-size": 30, "font-weight": 700, fill: "#0f2a5f", "font-family": "Noto Sans Bengali" }, bz, "ঢাকা");

  // ---- particles
  const canvas = document.getElementById("particles"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const PARTS = Array.from({ length: 50 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, r: 1.5 + hash(i, 3) * 3, vx: (hash(i, 4) - 0.5) * 12, vy: -5 - hash(i, 5) * 12, a: 0.12 + hash(i, 6) * 0.3, g: hash(i, 7) < 0.25 }));
  const drawParticles = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const p of PARTS) { ctx.beginPath(); ctx.fillStyle = p.g ? `rgba(0,106,78,${p.a})` : `rgba(6,182,212,${p.a})`; ctx.arc((((p.x + p.vx * t) % W) + W) % W, (((p.y + p.vy * t) % H) + H) % H, p.r, 0, Math.PI * 2); ctx.fill(); }
  };

  // ---- generic reveal
  const scenes = S.scenes.map((sc) => {
    const el = document.getElementById("s-" + sc.id);
    const items = [...el.querySelectorAll("[data-in],[data-out]")].map((e) => ({ e, tin: at(e.dataset.in, sc) ?? 0, tout: at(e.dataset.out, sc) }));
    return { sc, el, items };
  });
  const basisEl = document.getElementById("basis"), subEl = document.getElementById("subtext"), subBox = document.getElementById("subs"), bar = document.getElementById("bar");
  const BASIS = {
    illustrative: "ধারণাগত চিত্র",
    research: "তৃতীয় পক্ষের বাজার গবেষণা · উৎসসহ",
    verified: "✓ যাচাইকৃত: Sonicium Entropy সোর্স কোড ও ডকুমেন্টেশন",
    model: "ক্যাটালগ মূল্য যাচাইকৃত · গ্রাহক খাত সম্ভাব্য",
    analysis: "প্রকাশ্য তথ্য + নিজস্ব কৌশলগত বিশ্লেষণ",
    scenario: "দৃশ্যপট · কোম্পানির আয়ের পূর্বাভাস নয়",
    target: "প্রস্তাবিত লক্ষ্য · অর্জিত নয়",
    brand: "",
  };

  function renderAt(t) {
    drawParticles(t);
    bar.style.width = `${(100 * clamp(t / S.duration)).toFixed(3)}%`;
    let active = null;
    for (const { sc, el, items } of scenes) {
      const local = t - sc.start, last = sc === S.scenes.at(-1);
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
      FX[sc.id]?.(local, sc);
    }
    let basis = active?.basis ?? "";
    if (active?.id === "market" && t < active.times[5][0]) basis = "illustrative";
    basisEl.textContent = BASIS[basis] ?? "";
    basisEl.className = "basis " + basis;
    basisEl.style.opacity = BASIS[basis] ? "1" : "0";
    let cue = null;
    for (const [s0, s1, text, k] of T.subs) if (t >= s0 && t < s1) cue = { text, s0, s1, hidden: hiddenCue.has(k) };
    if (cue && !cue.hidden) {
      if (subEl.textContent !== cue.text) subEl.textContent = cue.text;
      subBox.style.opacity = Math.min(clamp((t - cue.s0) / 0.25), clamp((cue.s1 - t) / 0.2)).toFixed(3);
    } else subEl.textContent = "";
  }

  const FX = {
    opening(local, sc) {
      const z = 1 + 0.25 * easeInOut(local / (sc.end - sc.start));
      wg.setAttribute("transform", `translate(${dx},${dy}) scale(${z.toFixed(4)}) translate(${-dx},${-dy})`);
      wm.style.opacity = (0.5 + 0.5 * easeOut(local / 2)).toFixed(3);
      for (const a of arcs) {
        const d = clamp((local - 2 - a.i * 0.5) / 1.4);
        a.p.setAttribute("stroke-dasharray", `${a.len}`);
        a.p.setAttribute("stroke-dashoffset", `${(a.len * (1 - easeInOut(d))).toFixed(1)}`);
        a.node.setAttribute("opacity", d.toFixed(2));
        const ph = (local * 0.22 + hash(a.i, 3)) % 1, pt = a.p.getPointAtLength(a.len * ph);
        a.pk.setAttribute("cx", pt.x.toFixed(1)); a.pk.setAttribute("cy", pt.y.toFixed(1));
        a.pk.setAttribute("opacity", d >= 1 ? (Math.sin(ph * Math.PI) * 0.9).toFixed(2) : "0");
      }
      const pp = (local % 1.6) / 1.6;
      pulse.setAttribute("r", (8 + pp * 26).toFixed(1)); pulse.setAttribute("opacity", (1 - pp).toFixed(2));
    },
    market(local, sc) {
      const c5 = cueT(sc, 5), c6 = cueT(sc, 6), c7 = cueT(sc, 7), c9 = cueT(sc, 9);
      qbars.forEach(({ r, lab, v, i }) => {
        const g = easeOut((local - (i < 2 ? c5 + 0.6 + i * 0.5 : c6)) / (i < 2 ? 0.9 : 1.6));
        const h = (v / maxV) * (baseY - topY) * g;
        r.setAttribute("y", (baseY - h).toFixed(1)); r.setAttribute("height", h.toFixed(1));
        lab.setAttribute("y", (baseY - h - 14).toFixed(1)); lab.setAttribute("opacity", g.toFixed(2));
      });
      cagr.setAttribute("opacity", clamp((local - c6 - 1.6) / 0.8).toFixed(2));
      qcBars.forEach(({ r, t, v }, i) => {
        const g = easeOut((local - c7 - 0.4 - i * 0.6) / 1.0), w = (v / qcmax) * 200 * g;
        r.setAttribute("width", w.toFixed(1)); t.setAttribute("x", (238 + w).toFixed(1)); t.setAttribute("opacity", g.toFixed(2));
      });
      const glow = local >= c9 ? 0.5 + 0.5 * Math.sin((local - c9) * 4) : 0;
      nestRects[2].setAttribute("stroke-width", (3 + glow * 4).toFixed(1));
    },
    product(local, sc) {
      if (local < 1.2) { apacket.style.opacity = "0"; return; }
      const ar = arch.getBoundingClientRect();
      const xs2 = anodes.map((n) => { const r = n.getBoundingClientRect(); return r.left + r.width / 2 - ar.left; });
      const cyc = ((local * 0.22) % 1) * (xs2.length - 1), i = Math.min(xs2.length - 2, Math.floor(cyc));
      apacket.style.opacity = "1";
      apacket.style.transform = `translateX(${(xs2[i] + (xs2[i + 1] - xs2[i]) * easeInOut(cyc - i) - 9).toFixed(1)}px)`;
      anodes.forEach((n, k) => n.classList.toggle("on", k === Math.round(cyc)));
    },
    firstmover(local, sc) {
      const ang = -Math.PI / 2 + local * 0.9;
      flyDot.setAttribute("cx", (fcx + fr * Math.cos(ang)).toFixed(1)); flyDot.setAttribute("cy", (fcy + fr * Math.sin(ang)).toFixed(1));
      const near = ((Math.round((ang + Math.PI / 2) / (Math.PI / 2)) % 4) + 4) % 4;
      flyEls.forEach((r, i) => { r.setAttribute("stroke", i === near && local > cueT(sc, 1) ? "#2563eb" : "#9fb4d8"); r.setAttribute("fill", i === near && local > cueT(sc, 1) ? "#edf3ff" : "#fff"); });
    },
    scenarios(local, sc) {
      const c1 = cueT(sc, 1), c3 = cueT(sc, 3);
      shBars.forEach(({ r, t, s }, i) => {
        const g = easeOut((local - c1 + 0.2 - i * 0.5) / 0.9), h = Math.max(4, (s.usd / shMax) * (shBase - shTop)) * g;
        r.setAttribute("y", (shBase - h).toFixed(1)); r.setAttribute("height", h.toFixed(1));
        t.setAttribute("y", (shBase - h - 14).toFixed(1)); t.setAttribute("opacity", g.toFixed(2));
      });
      shHi.setAttribute("opacity", clamp((local - c1 - 2.6) / 0.6).toFixed(2));
      funnel.forEach((g, i) => g.setAttribute("opacity", clamp((local - c3 - 0.3 - i * 0.6) / 0.6).toFixed(2)));
      scLines.forEach(({ p, t, len }, i) => {
        const d = easeInOut((local - c3 - 1.2 - i * 0.4) / 2.2);
        p.setAttribute("stroke-dasharray", `${len}`); p.setAttribute("stroke-dashoffset", (len * (1 - d)).toFixed(1));
        t.setAttribute("opacity", clamp((d - 0.85) / 0.15).toFixed(2));
      });
    },
    investment(local, sc) {
      const n = phs.filter((p) => parseFloat(p.style.opacity || 0) > 0.5).length;
      rfill.style.width = `${(n / 4) * 100}%`;
      phs.forEach((p, i) => p.classList.toggle("on", i < n));
      pLines.forEach((l) => l.setAttribute("stroke-dashoffset", (-local * 24).toFixed(1)));
    },
    invitation(local) {
      bz.style.opacity = (0.85 * easeOut(local / 1.5)).toFixed(3);
      bzRings.forEach((r, i) => { const p = (local / 2.4 + i / 3) % 1; r.setAttribute("r", (10 + p * 120).toFixed(1)); r.setAttribute("opacity", (1 - p).toFixed(2)); });
    },
  };

  window.renderAt = renderAt;
  window.ready = document.fonts.ready.then(() => { renderAt(0); return true; });
  const params = new URLSearchParams(location.search);
  if (params.has("play")) { const t0 = performance.now(); const loop = () => { renderAt(((performance.now() - t0) / 1000) % S.duration); requestAnimationFrame(loop); }; window.ready.then(loop); }
  else if (params.has("t")) window.ready.then(() => renderAt(parseFloat(params.get("t"))));
})();
