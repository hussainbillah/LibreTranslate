// Deterministic animation engine for Quantum Chapter 01. window.renderAt(t)
// draws the frame at time t; nothing reads the wall clock, so every frame is
// reproducible.
//
// Timing: src/timing.js, measured from the voice-over (tools/timing.mjs --voice).
// Reveals are anchored to narration cues: data-in="c2+0.5" = 0.5 s after the
// scene's third sentence starts; data-out="c3" fades out when the fourth starts.
(function () {
  const S = window.SCRIPT, T = window.TIMING;
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; parent?.appendChild(e); return e; };
  const FONT = "Inter, Noto Sans Bengali";
  const MATH = "KaTeX_Main, Inter";
  const C = { cyan: "#22d3ee", blue: "#3b82f6", violet: "#a78bfa", pink: "#f472b6", ok: "#34d399", warn: "#fbbf24", ink: "#e8f0ff", muted: "#9db0d6", dim: "#5d6f96", line: "rgba(120,160,255,0.28)" };
  const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  // ---- timing
  let ci = 0;
  S.duration = T.duration;
  S.scenes.forEach((sc, i) => { [sc.start, sc.end] = T.scenes[i]; sc.first = ci; sc.times = sc.cues.map(() => T.cues[ci++]); });
  if (ci !== T.cues.length) console.error("timing.js does not match script.js — run tools/timing.mjs");
  const cueT = (sc, k) => sc.times[k][0] - sc.start;
  const at = (spec, sc) => {
    if (spec === undefined) return null;
    const m = /^c(\d+)([+-][\d.]+)?$/.exec(spec.trim());
    return m ? cueT(sc, +m[1]) + (m[2] ? parseFloat(m[2]) : 0) : parseFloat(spec);
  };
  const scene = (id) => S.scenes.find((s) => s.id === id);

  // ---- maths typesetting (KaTeX, local copy)
  document.querySelectorAll(".tex").forEach((el) => {
    window.katex.render(el.dataset.tex, el, { displayMode: el.hasAttribute("data-d"), throwOnError: false, strict: false, output: "html" });
  });

  // ---- icons
  const ICONS = {
    phone: '<rect x="14" y="4" width="20" height="40" rx="4"/><path d="M21 38h6"/>',
    laptop: '<rect x="9" y="9" width="30" height="21" rx="2"/><path d="M4 37h40l-3-7H7z"/>',
    rack: '<rect x="9" y="5" width="30" height="11" rx="2"/><rect x="9" y="18.5" width="30" height="11" rx="2"/><rect x="9" y="32" width="30" height="11" rx="2"/><path d="M15 10.5h3M15 24h3M15 37.5h3"/>',
    mail: '<rect x="5" y="10" width="38" height="28" rx="3"/><path d="m6 12 18 14 18-14"/>',
    play: '<rect x="5" y="9" width="38" height="30" rx="4"/><path d="M20 17v14l11-7z"/>',
    calc: '<rect x="10" y="5" width="28" height="38" rx="3"/><rect x="15" y="10" width="18" height="8" rx="1"/><path d="M16 25h2M24 25h2M32 25h0M16 32h2M24 32h2M16 38h2M24 38h2M31 31v8"/>',
    meter: '<path d="M6 36a18 18 0 0 1 36 0"/><path d="M24 36 34 20"/><circle cx="24" cy="36" r="2.5"/><rect x="4" y="36" width="40" height="6" rx="2"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon] ?? ""}</svg>`; });

  // ---- shared drawing helpers
  const arrowHead = (parent, x1, y1, x2, y2, size, fill) => {
    const a = Math.atan2(y2 - y1, x2 - x1), s = size;
    return svgEl("polygon", { points: `${x2},${y2} ${x2 - s * Math.cos(a - 0.42)},${y2 - s * Math.sin(a - 0.42)} ${x2 - s * Math.cos(a + 0.42)},${y2 - s * Math.sin(a + 0.42)}`, fill }, parent);
  };
  const setArrow = (line, head, x1, y1, x2, y2, size) => {
    line.setAttribute("x1", x1); line.setAttribute("y1", y1); line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    const a = Math.atan2(y2 - y1, x2 - x1), s = size;
    head.setAttribute("points", `${x2},${y2} ${x2 - s * Math.cos(a - 0.42)},${y2 - s * Math.sin(a - 0.42)} ${x2 - s * Math.cos(a + 0.42)},${y2 - s * Math.sin(a + 0.42)}`);
  };
  const defs = (svg) => svgEl("defs", {}, svg);
  const glowFilter = (svg, id, std = 6) => {
    const f = svgEl("filter", { id, x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs(svg));
    svgEl("feGaussianBlur", { stdDeviation: std, result: "b" }, f);
    const m = svgEl("feMerge", {}, f); svgEl("feMergeNode", { in: "b" }, m); svgEl("feMergeNode", { in: "SourceGraphic" }, m);
  };
  const drawBar = (r, t, base, top, val, max, label) => {
    const h = (val / max) * (base - top);
    r.setAttribute("y", (base - h).toFixed(1)); r.setAttribute("height", Math.max(0, h).toFixed(1));
    if (t) { t.setAttribute("y", (base - h - 14).toFixed(1)); if (label !== undefined) t.textContent = label; }
  };

  // ---- Bloch sphere renderer (shared by the title card and scene 12)
  function blochSphere(svg, R, opts = {}) {
    glowFilter(svg, svg.id + "-glow", 5);
    const g = svgEl("g", {}, svg);
    const grad = svgEl("radialGradient", { id: svg.id + "-sph", cx: "38%", cy: "32%", r: "75%" }, defs(svg));
    svgEl("stop", { offset: "0%", "stop-color": "#1e3a8a", "stop-opacity": 0.55 }, grad);
    svgEl("stop", { offset: "70%", "stop-color": "#0b1a3f", "stop-opacity": 0.35 }, grad);
    svgEl("stop", { offset: "100%", "stop-color": "#22d3ee", "stop-opacity": 0.25 }, grad);
    svgEl("circle", { cx: 0, cy: 0, r: R, fill: `url(#${svg.id}-sph)`, stroke: "rgba(34,211,238,0.55)", "stroke-width": 2 }, g);
    const mk = (cls) => ({ back: svgEl("path", { fill: "none", stroke: cls, "stroke-width": 1.6, "stroke-dasharray": "5 7", opacity: 0.5 }, g), front: svgEl("path", { fill: "none", stroke: cls, "stroke-width": 2, opacity: 0.85 }, g) });
    const rings = [mk(C.cyan), mk("rgba(167,139,250,0.9)"), mk("rgba(167,139,250,0.9)")];
    const axes = ["x", "y", "z"].map(() => svgEl("line", { stroke: "rgba(232,240,255,0.35)", "stroke-width": 1.6, "stroke-dasharray": "3 6" }, g));
    const axisLab = opts.axisLabels ? ["x", "y", "z"].map((n) => svgEl("text", { "font-size": 26, fill: C.muted, "font-family": MATH, "font-style": "italic", "text-anchor": "middle" }, g, n)) : [];
    const rotAxis = svgEl("line", { stroke: C.warn, "stroke-width": 3, "stroke-dasharray": "10 8", opacity: 0 }, g);
    const trail = svgEl("path", { fill: "none", stroke: C.pink, "stroke-width": 3, opacity: 0.0, "stroke-linecap": "round" }, g);
    const vec = svgEl("line", { stroke: C.pink, "stroke-width": opts.thin ? 5 : 6, "stroke-linecap": "round", filter: `url(#${svg.id}-glow)` }, g);
    const head = svgEl("polygon", { fill: C.pink }, g);
    const tip = svgEl("circle", { r: opts.thin ? 7 : 9, fill: "#fff", filter: `url(#${svg.id}-glow)` }, g);
    svgEl("circle", { cx: 0, cy: 0, r: 5, fill: C.ink }, g);
    let yaw = 0, elev = 0.32;
    const P = ([x, y, z]) => {
      const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw);
      return { sx: xr * R, sy: -(z * Math.cos(elev) + yr * Math.sin(elev)) * R, depth: yr * Math.cos(elev) - z * Math.sin(elev) };
    };
    const ringPath = (fn) => {
      let fr = "", bk = "", pf = null, pb = null;
      for (let i = 0; i <= 96; i++) {
        const p = P(fn((i / 96) * Math.PI * 2)), front = p.depth <= 0.02;
        if (front) { fr += `${pf ? "L" : "M"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`; pf = true; pb = false; }
        else { bk += `${pb ? "L" : "M"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`; pb = true; pf = false; }
      }
      return [fr, bk];
    };
    const trailPts = [];
    return {
      P,
      draw({ yaw: yw, state, trailOn = false, axis = null }) {
        yaw = yw;
        const fns = [(t) => [Math.cos(t), Math.sin(t), 0], (t) => [Math.cos(t), 0, Math.sin(t)], (t) => [0, Math.cos(t), Math.sin(t)]];
        rings.forEach((r, i) => { const [f, b] = ringPath(fns[i]); r.front.setAttribute("d", f); r.back.setAttribute("d", b); });
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((v, i) => {
          const a = P(v.map((c) => -c * 1.18)), b = P(v.map((c) => c * 1.18));
          axes[i].setAttribute("x1", a.sx); axes[i].setAttribute("y1", a.sy); axes[i].setAttribute("x2", b.sx); axes[i].setAttribute("y2", b.sy);
          if (axisLab[i]) { const l = P(v.map((c) => c * 1.3)); axisLab[i].setAttribute("x", l.sx); axisLab[i].setAttribute("y", l.sy + 9); }
        });
        if (axis) {
          const a = P(axis.v.map((c) => -c * 1.25)), b = P(axis.v.map((c) => c * 1.25));
          rotAxis.setAttribute("x1", a.sx); rotAxis.setAttribute("y1", a.sy); rotAxis.setAttribute("x2", b.sx); rotAxis.setAttribute("y2", b.sy);
          rotAxis.setAttribute("opacity", axis.o.toFixed(2));
        } else rotAxis.setAttribute("opacity", 0);
        const p = P(state);
        setArrow(vec, head, 0, 0, p.sx * 0.94, p.sy * 0.94, opts.thin ? 16 : 22);
        tip.setAttribute("cx", p.sx); tip.setAttribute("cy", p.sy);
        if (trailOn) { trailPts.push(state); if (trailPts.length > 70) trailPts.shift(); } else trailPts.length = 0;
        trail.setAttribute("d", trailPts.map((s, i) => { const q = P(s); return `${i ? "L" : "M"}${q.sx.toFixed(1)},${q.sy.toFixed(1)}`; }).join(""));
        trail.setAttribute("opacity", trailOn ? 0.55 : 0);
      },
    };
  }
  const sph = (th, ph) => [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const rotate = (v, k, ang) => { // Rodrigues rotation of v about unit axis k
    const [x, y, z] = v, [a, b, c] = k, cs = Math.cos(ang), sn = Math.sin(ang), d = a * x + b * y + c * z;
    return [x * cs + (b * z - c * y) * sn + a * d * (1 - cs), y * cs + (c * x - a * z) * sn + b * d * (1 - cs), z * cs + (a * y - b * x) * sn + c * d * (1 - cs)];
  };

  // ---- 1 hook: 2p-like probability cloud (deterministic samples)
  const cloud = document.getElementById("cloud"), cctx = cloud.getContext("2d");
  const CLOUD = [];
  for (let i = 0, k = 0; CLOUD.length < 3200 && k < 200000; k++) {
    const r = hash(k, 1) * 9, th = Math.acos(2 * hash(k, 2) - 1), ph = hash(k, 3) * Math.PI * 2;
    const dens = r * r * Math.exp(-r) * Math.cos(th) ** 2; // |ψ_2pz|² · r² (radial measure)
    if (hash(k, 4) * 0.55 < dens) CLOUD.push([r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th), hash(k, 5)]);
  }
  const drawCloud = (t) => {
    cctx.clearRect(0, 0, 900, 900);
    const yaw = t * 0.18, tilt = 0.5;
    cctx.globalCompositeOperation = "lighter";
    for (const [x, y, z, s] of CLOUD) {
      const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw);
      const zr = z * Math.cos(tilt) - yr * Math.sin(tilt);
      const px = 450 + xr * 66, py = 450 - zr * 66, tw = 0.5 + 0.5 * Math.sin(t * 2 + s * 30);
      cctx.fillStyle = s < 0.5 ? `rgba(34,211,238,${0.18 + 0.22 * tw})` : `rgba(167,139,250,${0.16 + 0.2 * tw})`;
      cctx.beginPath(); cctx.arc(px, py, 1.6 + s * 1.6, 0, Math.PI * 2); cctx.fill();
    }
    const g = cctx.createRadialGradient(450, 450, 0, 450, 450, 60);
    g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.3, "rgba(34,211,238,0.6)"); g.addColorStop(1, "rgba(34,211,238,0)");
    cctx.fillStyle = g; cctx.beginPath(); cctx.arc(450, 450, 60, 0, Math.PI * 2); cctx.fill();
    cctx.globalCompositeOperation = "source-over";
  };

  // ---- 2 title: Bloch sphere
  const tb = blochSphere(document.getElementById("titlebloch"), 150, { thin: true });

  // ---- 3 why: bits, molecule, 2^n growth
  const bitstream = document.getElementById("bitstream");
  const bitEls = Array.from({ length: 10 }, () => { const s = document.createElement("span"); bitstream.appendChild(s); return s; });
  const mol = document.getElementById("molecule");
  glowFilter(mol, "molglow", 8);
  const ATOMS = [[-150, 20, 34, C.cyan], [0, -40, 46, C.violet], [150, 20, 34, C.cyan], [-60, 100, 26, C.blue], [80, 105, 26, C.blue]];
  [[0, 1], [1, 2], [1, 3], [1, 4]].forEach(([a, b]) => svgEl("line", { x1: ATOMS[a][0], y1: ATOMS[a][1], x2: ATOMS[b][0], y2: ATOMS[b][1], stroke: "rgba(157,176,214,0.45)", "stroke-width": 6 }, mol));
  const halos = ATOMS.map(([x, y, r, c]) => { svgEl("circle", { cx: x, cy: y, r, fill: c, opacity: 0.85, filter: "url(#molglow)" }, mol); return svgEl("circle", { cx: x, cy: y, r: r * 2, fill: "none", stroke: c, "stroke-width": 1.5, opacity: 0.4 }, mol); });
  const elecs = ATOMS.map(([x, y, r], i) => svgEl("circle", { r: 5, fill: "#fff", "data-i": i }, mol));
  const growRows = document.getElementById("growrows");
  const GROW = [[10, "1,024"], [30, "≈ 1.07 × 10⁹"], [50, "≈ 1.13 × 10¹⁵"]].map(([n, v]) => {
    growRows.insertAdjacentHTML("beforeend", `<div class="gr"><b>n = ${n}</b><i></i><em>${v}</em></div>`);
    return { n, bar: growRows.lastElementChild.querySelector("i") };
  });

  // ---- 5 bit: light switch
  const sw = document.getElementById("switch");
  glowFilter(sw, "swglow", 10);
  svgEl("rect", { x: 40, y: 90, width: 180, height: 120, rx: 60, fill: "#0b1a3f", stroke: C.line, "stroke-width": 3 }, sw);
  const knob = svgEl("circle", { cx: 100, cy: 150, r: 46, fill: C.ink }, sw);
  svgEl("line", { x1: 220, y1: 150, x2: 320, y2: 150, stroke: C.dim, "stroke-width": 4 }, sw);
  const bulb = svgEl("circle", { cx: 400, cy: 140, r: 62, fill: "#1e293b", stroke: C.line, "stroke-width": 3 }, sw);
  svgEl("rect", { x: 378, y: 200, width: 44, height: 30, rx: 6, fill: C.dim }, sw);
  const bitText = svgEl("text", { x: 400, y: 162, "text-anchor": "middle", "font-size": 64, "font-weight": 800, "font-family": "Inter", fill: C.ink }, sw, "0");

  // ---- 6 state: complex plane with α, β
  const cp = document.getElementById("cplane");
  const CR = 140;
  svgEl("circle", { cx: 0, cy: 0, r: CR, fill: "none", stroke: C.line, "stroke-width": 2, "stroke-dasharray": "6 6" }, cp);
  svgEl("line", { x1: -160, y1: 0, x2: 160, y2: 0, stroke: C.dim, "stroke-width": 2 }, cp);
  svgEl("line", { x1: 0, y1: 160, x2: 0, y2: -160, stroke: C.dim, "stroke-width": 2 }, cp);
  svgEl("text", { x: 150, y: 28, "font-size": 22, fill: C.muted, "font-family": "Inter", "text-anchor": "end" }, cp, "Re");
  svgEl("text", { x: 12, y: -146, "font-size": 22, fill: C.muted, "font-family": "Inter" }, cp, "Im");
  const aL = svgEl("line", { stroke: C.cyan, "stroke-width": 6, "stroke-linecap": "round" }, cp), aH = svgEl("polygon", { fill: C.cyan }, cp);
  const bL = svgEl("line", { stroke: C.violet, "stroke-width": 6, "stroke-linecap": "round" }, cp), bH = svgEl("polygon", { fill: C.violet }, cp);
  const aT = svgEl("text", { x: 0.6 * CR, y: 34, "text-anchor": "middle", "font-size": 30, fill: C.cyan, "font-family": MATH, "font-style": "italic" }, cp, "α");
  const bT = svgEl("text", { x: 26, y: -0.8 * CR + 4, "font-size": 30, fill: C.violet, "font-family": MATH, "font-style": "italic" }, cp, "β");

  // ---- 7 dirac: vectors in the plane
  const vp = document.getElementById("vplane");
  const VS = 240;
  svgEl("line", { x1: -40, y1: 0, x2: 320, y2: 0, stroke: C.dim, "stroke-width": 2 }, vp);
  svgEl("line", { x1: 0, y1: 40, x2: 0, y2: -290, stroke: C.dim, "stroke-width": 2 }, vp);
  const v0 = [svgEl("line", { stroke: C.cyan, "stroke-width": 6 }, vp), svgEl("polygon", { fill: C.cyan }, vp)];
  const v1 = [svgEl("line", { stroke: C.violet, "stroke-width": 6 }, vp), svgEl("polygon", { fill: C.violet }, vp)];
  const vpsi = [svgEl("line", { stroke: C.pink, "stroke-width": 6 }, vp), svgEl("polygon", { fill: C.pink }, vp)];
  const dashA = svgEl("line", { x1: 0.6 * VS, y1: 0, x2: 0.6 * VS, y2: -0.8 * VS, stroke: C.pink, "stroke-width": 2, "stroke-dasharray": "6 6" }, vp);
  const dashB = svgEl("line", { x1: 0, y1: -0.8 * VS, x2: 0.6 * VS, y2: -0.8 * VS, stroke: C.pink, "stroke-width": 2, "stroke-dasharray": "6 6" }, vp);
  const vlab = [
    svgEl("text", { x: VS + 10, y: 40, "font-size": 34, fill: C.cyan, "font-family": MATH }, vp, "|0⟩"),
    svgEl("text", { x: 14, y: -VS - 14, "font-size": 34, fill: C.violet, "font-family": MATH }, vp, "|1⟩"),
    svgEl("text", { x: 0.6 * VS + 12, y: -0.8 * VS - 12, "font-size": 34, fill: C.pink, "font-family": MATH }, vp, "|ψ⟩"),
  ];

  // ---- 8 superposition: amplitude & probability bars
  const ab = document.getElementById("ampbars");
  const AB = { base: 300, top: 40 };
  svgEl("line", { x1: 30, y1: AB.base, x2: 530, y2: AB.base, stroke: C.dim, "stroke-width": 2 }, ab);
  const abars = [0, 1].map((i) => {
    const x = 90 + i * 250;
    const amp = svgEl("rect", { x, width: 70, rx: 8, fill: i ? C.violet : C.cyan, opacity: 0.9 }, ab);
    const prob = svgEl("rect", { x: x + 84, width: 70, rx: 8, fill: i ? C.violet : C.cyan, opacity: 0.35 }, ab);
    const at_ = svgEl("text", { x: x + 35, "text-anchor": "middle", "font-size": 26, fill: C.ink, "font-family": MATH }, ab);
    const pt = svgEl("text", { x: x + 119, "text-anchor": "middle", "font-size": 24, fill: C.muted, "font-family": "Inter" }, ab);
    svgEl("text", { x: x + 77, y: AB.base + 44, "text-anchor": "middle", "font-size": 34, fill: C.ink, "font-family": MATH }, ab, i ? "|1⟩" : "|0⟩");
    return { amp, prob, at_, pt };
  });
  svgEl("text", { x: 30, y: 28, "font-size": 22, fill: C.muted, "font-family": FONT }, ab, "গাঢ়: অ্যাম্প্লিচিউড   ·   হালকা: সম্ভাবনা");

  // ---- 9 coin and waves
  const coin = document.getElementById("coin");
  const cg = svgEl("radialGradient", { id: "coingrad", cx: "40%", cy: "35%", r: "70%" }, defs(coin));
  svgEl("stop", { offset: "0%", "stop-color": "#fde68a" }, cg); svgEl("stop", { offset: "100%", "stop-color": "#b45309" }, cg);
  const coinBody = svgEl("ellipse", { cx: 0, cy: 0, rx: 120, ry: 120, fill: "url(#coingrad)", stroke: "#fbbf24", "stroke-width": 4 }, coin);
  const coinFace = svgEl("text", { x: 0, y: 30, "text-anchor": "middle", "font-size": 92, "font-weight": 800, "font-family": "Inter", fill: "#78350f" }, coin, "0");
  function wavePanel(svg, y0, h, label, phaseB, color) {
    const g = svgEl("g", {}, svg);
    svgEl("text", { x: 10, y: y0 - h / 2 - 12, "font-size": 24, fill: color, "font-family": FONT, "font-weight": 700 }, g, label);
    const a = svgEl("path", { fill: "none", stroke: C.cyan, "stroke-width": 2.5, opacity: 0.7 }, g);
    const b = svgEl("path", { fill: "none", stroke: phaseB ? C.pink : C.violet, "stroke-width": 2.5, opacity: 0.7 }, g);
    const s = svgEl("path", { fill: "none", stroke: "#fff", "stroke-width": 5 }, g);
    return { y0, h, phaseB, a, b, s };
  }
  const drawWaves = (p, t, width) => {
    const pts = (amp, ph) => Array.from({ length: 121 }, (_, i) => { const x = 10 + (i / 120) * (width - 20); return `${i ? "L" : "M"}${x.toFixed(1)},${(p.y0 - amp * Math.sin(i / 120 * Math.PI * 4 - t * 2.4 + ph)).toFixed(1)}`; }).join("");
    const A = p.h * 0.22, ph = p.phaseB ? Math.PI : 0;
    p.a.setAttribute("d", pts(A, 0)); p.b.setAttribute("d", pts(A, ph));
    p.s.setAttribute("d", pts(p.phaseB ? 0 : 2 * A, 0));
  };
  const wv = document.getElementById("waves");
  const wvP = [wavePanel(wv, 95, 110, "একই চিহ্ন → জোরদার (গঠনমূলক)", false, C.cyan), wavePanel(wv, 240, 110, "বিপরীত চিহ্ন → বাতিল (ধ্বংসাত্মক)", true, C.pink)];
  const wv2 = document.getElementById("waves2");
  const wv2P = [wavePanel(wv2, 140, 160, "গঠনমূলক ব্যতিচার: অ্যাম্প্লিচিউড জোরদার", false, C.cyan), wavePanel(wv2, 345, 160, "ধ্বংসাত্মক ব্যতিচার: অ্যাম্প্লিচিউড বাতিল", true, C.pink)];

  // ---- 10 born: probability bars
  const bb = document.getElementById("bornbars");
  const BB = { base: 300, top: 40 };
  svgEl("line", { x1: 40, y1: BB.base, x2: 480, y2: BB.base, stroke: C.dim, "stroke-width": 2 }, bb);
  const bornBars = [[0.75, C.cyan, "|0⟩"], [0.25, C.violet, "|1⟩"]].map(([v, c, l], i) => {
    const x = 110 + i * 200;
    svgEl("text", { x: x + 60, y: BB.base + 46, "text-anchor": "middle", "font-size": 36, fill: C.ink, "font-family": MATH }, bb, l);
    return { v, r: svgEl("rect", { x, width: 120, rx: 10, fill: c }, bb), t: svgEl("text", { x: x + 60, "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: C.ink, "font-family": "Inter" }, bb) };
  });

  // ---- 11 collapse: accumulating shots (deterministic simulated draws, P(0)=3/4)
  const shots = document.getElementById("shots");
  const SH = { base: 330, top: 60, total: 1000 };
  svgEl("line", { x1: 40, y1: SH.base, x2: 520, y2: SH.base, stroke: C.dim, "stroke-width": 2 }, shots);
  const shotBars = [C.cyan, C.violet].map((c, i) => {
    const x = 110 + i * 200;
    svgEl("text", { x: x + 60, y: SH.base + 44, "text-anchor": "middle", "font-size": 34, fill: C.ink, "font-family": "Inter", "font-weight": 700 }, shots, String(i));
    return { r: svgEl("rect", { x, width: 120, rx: 10, fill: c }, shots), t: svgEl("text", { x: x + 60, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: C.ink, "font-family": "Inter" }, shots) };
  });
  const shotCount = svgEl("text", { x: 280, y: 34, "text-anchor": "middle", "font-size": 26, fill: C.muted, "font-family": FONT }, shots);
  const OUTCOMES = Array.from({ length: SH.total }, (_, i) => (hash(i, 77) < 0.75 ? 0 : 1));
  const CUM0 = OUTCOMES.reduce((acc, o, i) => { acc.push((acc[i - 1] ?? 0) + (o === 0 ? 1 : 0)); return acc; }, []);

  // ---- 12 bloch
  const bs = blochSphere(document.getElementById("bloch"), 270, { axisLabels: true });
  const blab = { "0": [0, 0, 1.2], "1": [0, 0, -1.2], p: [1.24, 0, 0], m: [-1.24, 0, 0] };
  const blEls = { "0": document.getElementById("bl0"), "1": document.getElementById("bl1"), p: document.getElementById("blp"), m: document.getElementById("blm") };

  // ---- 13 multi: ket chips
  document.querySelectorAll(".kets[data-kets]").forEach((el) => { el.innerHTML = el.dataset.kets.split(",").map((k) => `<span class="k">|${k}⟩</span>`).join(""); });
  const k2 = [...document.querySelectorAll("#k2 .k")];

  // ---- 14 entangle: linked pair and correlated outcomes
  const pair = document.getElementById("pair");
  glowFilter(pair, "pairglow", 10);
  const link = svgEl("path", { fill: "none", stroke: C.violet, "stroke-width": 4, opacity: 0.8 }, pair);
  [[150, C.cyan, "q₀"], [450, C.pink, "q₁"]].forEach(([x, c, l]) => { svgEl("circle", { cx: x, cy: 120, r: 54, fill: c, opacity: 0.9, filter: "url(#pairglow)" }, pair); svgEl("text", { x, y: 136, "text-anchor": "middle", "font-size": 42, "font-weight": 800, "font-family": "Inter", fill: "#04131c" }, pair, l); });
  const pairRows = document.getElementById("pairrows");
  const PAIRS = [0, 1, 1, 0, 1, 0].map((b, i) => { const d = document.createElement("div"); d.className = "prow"; d.innerHTML = `<span>${b}</span><span>${b}</span><em>✓</em>`; pairRows.appendChild(d); return d; });

  // ---- 16 cnot: symbol and a larger circuit
  const cn = document.getElementById("cnotsym");
  const wire = (svg, x1, x2, y) => svgEl("line", { x1, y1: y, x2, y2: y, stroke: C.muted, "stroke-width": 3 }, svg);
  const gateBox = (svg, x, y, label, color, size = 64) => { const g = svgEl("g", {}, svg); svgEl("rect", { x: x - size / 2, y: y - size / 2, width: size, height: size, rx: 10, fill: color }, g); svgEl("text", { x, y: y + size * 0.19, "text-anchor": "middle", "font-size": size * 0.55, "font-weight": 800, "font-family": "Inter", fill: "#04131c" }, g, label); return g; };
  const cnotGate = (svg, x, yc, yt, r = 24) => { const g = svgEl("g", {}, svg); svgEl("line", { x1: x, y1: yc, x2: x, y2: yt + (yt > yc ? r : -r), stroke: C.ink, "stroke-width": 3 }, g); svgEl("circle", { cx: x, cy: yc, r: 11, fill: C.ink }, g); svgEl("circle", { cx: x, cy: yt, r, fill: "none", stroke: C.ink, "stroke-width": 3 }, g); svgEl("line", { x1: x - r, y1: yt, x2: x + r, y2: yt, stroke: C.ink, "stroke-width": 3 }, g); svgEl("line", { x1: x, y1: yt - r, x2: x, y2: yt + r, stroke: C.ink, "stroke-width": 3 }, g); return g; };
  const meterBox = (svg, x, y) => { const g = svgEl("g", {}, svg); svgEl("rect", { x: x - 30, y: y - 26, width: 60, height: 52, rx: 8, fill: "#0b1a3f", stroke: C.cyan, "stroke-width": 2.5 }, g); svgEl("path", { d: `M${x - 18},${y + 12} A20 20 0 0 1 ${x + 18},${y + 12}`, fill: "none", stroke: C.cyan, "stroke-width": 2.5 }, g); svgEl("line", { x1: x, y1: y + 12, x2: x + 14, y2: y - 12, stroke: C.cyan, "stroke-width": 2.5 }, g); return g; };
  wire(cn, 120, 470, 80); wire(cn, 120, 470, 190);
  svgEl("text", { x: 100, y: 88, "text-anchor": "end", "font-size": 26, fill: C.cyan, "font-family": FONT, "font-weight": 700 }, cn, "কন্ট্রোল");
  svgEl("text", { x: 100, y: 198, "text-anchor": "end", "font-size": 26, fill: C.pink, "font-family": FONT, "font-weight": 700 }, cn, "টার্গেট");
  cnotGate(cn, 300, 80, 190, 28);
  const truthRows = [...document.querySelectorAll(".truth .tr[data-k]")];
  const big = document.getElementById("bigcircuit");
  const BY = [50, 115, 180];
  BY.forEach((y, i) => { wire(big, 110, 1440, y); svgEl("text", { x: 90, y: y + 9, "text-anchor": "end", "font-size": 28, fill: C.muted, "font-family": MATH }, big, `q${i}`); });
  const bigParts = [gateBox(big, 260, BY[0], "H", C.pink), gateBox(big, 260, BY[2], "X", C.cyan), cnotGate(big, 470, BY[0], BY[1]), gateBox(big, 680, BY[1], "Z", C.violet), cnotGate(big, 890, BY[1], BY[2]), gateBox(big, 1100, BY[0], "H", C.pink), ...BY.map((y) => meterBox(big, 1330, y))];

  // ---- 17 interference: |0⟩ –H–H– and the amplitude paths
  const hh = document.getElementById("hhcirc");
  wire(hh, 120, 780, 60);
  svgEl("text", { x: 100, y: 72, "text-anchor": "end", "font-size": 38, fill: C.ink, "font-family": MATH }, hh, "|0⟩");
  const hh1 = gateBox(hh, 330, 60, "H", C.pink, 76), hh2 = gateBox(hh, 560, 60, "H", C.pink, 76);
  meterBox(hh, 760, 60);
  const pa = document.getElementById("paths");
  glowFilter(pa, "pglow", 8);
  const X0 = 150, X1 = 640, X2 = 1130, Y0 = 130, Y1 = 400;
  const node = (x, y, label, color) => { const g = svgEl("g", {}, pa); const c = svgEl("circle", { cx: x, cy: y, r: 52, fill: "#0b1a3f", stroke: color, "stroke-width": 3 }, g); svgEl("text", { x, y: y + 13, "text-anchor": "middle", "font-size": 38, fill: C.ink, "font-family": MATH }, g, label); return { g, c }; };
  const edge = (x1, y1, x2, y2, label, color, lx, ly) => { const g = svgEl("g", {}, pa); const l = svgEl("line", { x1: x1 + 54, y1, x2: x2 - 54, y2, stroke: color, "stroke-width": 4 }, g); svgEl("text", { x: lx, y: ly, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: color, "font-family": MATH }, g, label); return { g, l, len: Math.hypot(x2 - x1 - 108, y2 - y1) }; };
  const e1 = [edge(X0, Y0, X1, Y0, "+1/√2", C.cyan, (X0 + X1) / 2, Y0 - 18), edge(X0, Y0, X1, Y1, "+1/√2", C.cyan, (X0 + X1) / 2 - 40, (Y0 + Y1) / 2 + 40)];
  const e2a = [edge(X1, Y0, X2, Y0, "+½", C.cyan, (X1 + X2) / 2, Y0 - 18), edge(X1, Y1, X2, Y0, "+½", C.cyan, (X1 + X2) / 2 - 90, (Y0 + Y1) / 2 + 26)];
  const e2b = [edge(X1, Y0, X2, Y1, "+½", C.violet, (X1 + X2) / 2 + 90, (Y0 + Y1) / 2 + 26), edge(X1, Y1, X2, Y1, "−½", C.pink, (X1 + X2) / 2, Y1 + 44)];
  const n0 = node(X0, Y0, "|0⟩", C.ink), n10 = node(X1, Y0, "|0⟩", C.cyan), n11 = node(X1, Y1, "|1⟩", C.cyan);
  const n20 = node(X2, Y0, "|0⟩", C.cyan), n21 = node(X2, Y1, "|1⟩", C.pink);
  const sum0 = svgEl("text", { x: X2 + 80, y: Y0 + 12, "font-size": 36, "font-weight": 700, fill: C.cyan, "font-family": MATH }, pa, "½ + ½ = 1");
  const sum1 = svgEl("text", { x: X2 + 80, y: Y1 + 12, "font-size": 36, "font-weight": 700, fill: C.pink, "font-family": MATH }, pa, "½ − ½ = 0");
  const colLab = [["শুরু", X0], ["প্রথম H-এর পর", X1], ["দ্বিতীয় H-এর পর", X2]].map(([t, x]) => svgEl("text", { x, y: 520, "text-anchor": "middle", "font-size": 26, fill: C.muted, "font-family": FONT }, pa, t));

  // ---- 18 algo: illustrative amplitude amplification
  const amp = document.getElementById("amplify");
  const AM = { base: 280, top: 30, n: 8, good: 5 };
  svgEl("line", { x1: 20, y1: AM.base, x2: 580, y2: AM.base, stroke: C.dim, "stroke-width": 2 }, amp);
  const amBars = Array.from({ length: AM.n }, (_, i) => {
    const x = 40 + i * 68;
    svgEl("text", { x: x + 25, y: AM.base + 34, "text-anchor": "middle", "font-size": 22, fill: i === AM.good ? C.ok : C.muted, "font-family": "Inter", "font-weight": 700 }, amp, i === AM.good ? "✓" : String(i));
    return svgEl("rect", { x, width: 50, rx: 6, fill: i === AM.good ? C.ok : C.violet, opacity: i === AM.good ? 1 : 0.7 }, amp);
  });
  svgEl("text", { x: 300, y: 352, "text-anchor": "middle", "font-size": 22, fill: C.muted, "font-family": FONT }, amp, "সম্ভাব্য উত্তর · সবুজ = সঠিক উত্তর");

  // ---- 19 qiskit: code and Bell circuit
  const CODE = [
    ['<span class="kw">from</span> qiskit <span class="kw">import</span> QuantumCircuit', "c2"],
    ['<span class="kw">from</span> qiskit.quantum_info <span class="kw">import</span> Statevector', "c2+0.4"],
    ["", "c2+0.4"],
    ['qc = <span class="fn">QuantumCircuit</span>(<span class="num">2</span>)            <span class="cm"># দুটি কিউবিট: q0, q1</span>', "c3"],
    ['qc.<span class="fn">h</span>(<span class="num">0</span>)                         <span class="cm"># q0-তে হাদামার্ড</span>', "c4"],
    ['qc.<span class="fn">cx</span>(<span class="num">0</span>, <span class="num">1</span>)                     <span class="cm"># CNOT: কন্ট্রোল q0, টার্গেট q1</span>', "c5"],
    ["", "c5"],
    ['state = <span class="fn">Statevector</span>(qc)', "c6"],
    ['<span class="fn">print</span>(state.<span class="fn">probabilities_dict</span>(decimals=<span class="num">3</span>))', "c6+0.5"],
    ['<span class="out"># {\'00\': 0.5, \'11\': 0.5}</span>', "c6+1.6"],
  ];
  const codeEl = document.getElementById("code");
  const codeLines = CODE.map(([html, when]) => { const s = document.createElement("span"); s.className = "ln"; s.innerHTML = html || " "; s.dataset.in = when; codeEl.appendChild(s); return s; });
  const bc = document.getElementById("bellcirc");
  const BC = [100, 210];
  const bcWires = BC.map((y, i) => { const g = svgEl("g", {}, bc); wire(g, 110, 600, y); svgEl("text", { x: 90, y: y + 10, "text-anchor": "end", "font-size": 30, fill: C.muted, "font-family": MATH }, g, `q${i}`); svgEl("text", { x: 130, y: y - 22, "font-size": 24, fill: C.dim, "font-family": MATH }, g, "|0⟩"); return g; });
  const bcH = gateBox(bc, 250, BC[0], "H", C.pink, 70), bcX = cnotGate(bc, 420, BC[0], BC[1], 26);
  const bcLab = svgEl("text", { x: 540, y: 160, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: C.violet, "font-family": MATH }, bc, "|Φ⁺⟩");

  // ---- 20 results: histograms
  function hist(svg, vals, color) {
    const base = 300, top = 30, max = 0.6;
    svgEl("line", { x1: 70, y1: base, x2: 580, y2: base, stroke: C.dim, "stroke-width": 2 }, svg);
    [0.25, 0.5].forEach((v) => { const y = base - (v / max) * (base - top); svgEl("line", { x1: 70, y1: y, x2: 580, y2: y, stroke: "rgba(120,160,255,0.12)", "stroke-width": 1.5 }, svg); svgEl("text", { x: 62, y: y + 7, "text-anchor": "end", "font-size": 18, fill: C.dim, "font-family": "Inter" }, svg, v.toFixed(2)); });
    return ["00", "01", "10", "11"].map((k, i) => {
      const x = 100 + i * 122;
      svgEl("text", { x: x + 45, y: base + 42, "text-anchor": "middle", "font-size": 30, fill: C.ink, "font-family": MATH }, svg, `|${k}⟩`);
      return { v: vals[i], r: svgEl("rect", { x, width: 90, rx: 8, fill: vals[i] > 0.2 ? color : C.pink }, svg), t: svgEl("text", { x: x + 45, "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: C.ink, "font-family": "Inter" }, svg), base, top, max };
    });
  }
  const idealH = hist(document.getElementById("idealbars"), [0.5, 0, 0, 0.5], C.cyan);
  const noisyH = hist(document.getElementById("noisybars"), [0.47, 0.03, 0.03, 0.47], C.violet);

  // ---- particles (background)
  const canvas = document.getElementById("particles"); canvas.width = W; canvas.height = H;
  const pctx = canvas.getContext("2d");
  const PARTS = Array.from({ length: 70 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, r: 0.8 + hash(i, 3) * 2.2, vx: (hash(i, 4) - 0.5) * 8, vy: -3 - hash(i, 5) * 8, a: 0.12 + hash(i, 6) * 0.35, v: hash(i, 7) < 0.35 }));
  const drawParticles = (t) => {
    pctx.clearRect(0, 0, W, H);
    for (const p of PARTS) {
      const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + p.x);
      pctx.beginPath(); pctx.fillStyle = p.v ? `rgba(167,139,250,${p.a * tw})` : `rgba(34,211,238,${p.a * tw})`;
      pctx.arc((((p.x + p.vx * t) % W) + W) % W, (((p.y + p.vy * t) % H) + H) % H, p.r, 0, Math.PI * 2); pctx.fill();
    }
  };

  // ---- generic reveal
  const scenes = S.scenes.map((sc) => {
    const el = document.getElementById("s-" + sc.id);
    if (!el) console.error("missing scene element", sc.id);
    const items = [...el.querySelectorAll("[data-in],[data-out]")].map((e) => ({ e, tin: at(e.dataset.in, sc) ?? 0, tout: at(e.dataset.out, sc) }));
    return { sc, el, items };
  });
  const secEl = document.getElementById("sectionlabel"), subEl = document.getElementById("subtext"), subBox = document.getElementById("subs"), bar = document.getElementById("bar");

  function renderAt(t) {
    drawParticles(t);
    bar.style.width = `${(100 * clamp(t / S.duration)).toFixed(3)}%`;
    let active = null;
    for (const { sc, el, items } of scenes) {
      const local = t - sc.start, last = sc === S.scenes.at(-1);
      const fin = sc.start === 0 ? easeOut(local / 1.0) : easeOut(local / 0.7);
      const fout = last ? 1 : 1 - easeInOut((t - (sc.end - 0.6)) / 0.6);
      const a = t >= sc.start && t < sc.end + (last ? 1 : 0) ? Math.min(fin, fout) : 0;
      el.style.opacity = a.toFixed(3);
      el.style.visibility = a > 0 ? "visible" : "hidden";
      if (a <= 0) continue;
      if (!active || a > 0.5) active = sc;
      for (const { e, tin, tout } of items) {
        const pin = easeOut((local - tin) / 0.7);
        const pout = tout === null ? 1 : 1 - easeInOut((local - tout) / 0.5);
        const p = Math.min(pin, pout);
        e.style.opacity = p.toFixed(3);
        if (!e.classList.contains("seccard")) e.style.transform = `translateY(${((1 - pin) * 22 - (1 - pout) * 10).toFixed(2)}px)`;
        e.style.visibility = p > 0.001 ? "visible" : "hidden";
      }
      FX[sc.id]?.(local, sc);
    }
    const label = active && !["hook", "title", "outro"].includes(active.id) ? active.title : "";
    if (secEl.textContent !== label) secEl.textContent = label;
    secEl.style.opacity = label ? "1" : "0";
    let cue = null;
    for (const [s0, s1, text] of T.subs) if (t >= s0 && t < s1) cue = { text, s0, s1 };
    if (cue) {
      if (subEl.textContent !== cue.text) subEl.textContent = cue.text;
      subBox.style.opacity = Math.min(clamp((t - cue.s0) / 0.25), clamp((cue.s1 - t) / 0.2)).toFixed(3);
    } else subEl.textContent = "";
  }

  const FX = {
    hook(local, sc) { if (local > cueT(sc, 2) - 1) drawCloud(local); },
    title(local) {
      const th = 1.0 + 0.5 * Math.sin(local * 0.6), ph = local * 0.8;
      tb.draw({ yaw: -0.5 + local * 0.08, state: sph(th, ph) });
    },
    why(local, sc) {
      bitEls.forEach((s, i) => { const b = hash(i, Math.floor(local * 2.2 + i * 0.3)) < 0.5 ? 0 : 1; s.textContent = b; s.className = b ? "one" : ""; });
      halos.forEach((h, i) => h.setAttribute("r", (ATOMS[i][2] * (1.7 + 0.25 * Math.sin(local * 2 + i)) ).toFixed(1)));
      elecs.forEach((e, i) => { const [x, y, r] = ATOMS[i], a = local * (1.4 + i * 0.2) + i; e.setAttribute("cx", (x + Math.cos(a) * r * 1.7).toFixed(1)); e.setAttribute("cy", (y + Math.sin(a) * r * 0.9).toFixed(1)); });
      const c6 = cueT(sc, 6);
      GROW.forEach(({ n, bar }, i) => { const g = easeOut((local - c6 - 0.8 - i * 0.9) / 1.2); bar.style.width = `${(g * (n / 50) * 100).toFixed(1)}%`; });
    },
    bit(local, sc) {
      const c2 = cueT(sc, 2), c4 = cueT(sc, 4);
      const on = local > c2 + 1.6 && local < c4 ? Math.floor((local - c2 - 1.6) / 1.6) % 2 === 0 : false;
      knob.setAttribute("cx", on ? 160 : 100); knob.setAttribute("fill", on ? C.warn : C.ink);
      bulb.setAttribute("fill", on ? "#fbbf24" : "#1e293b"); bulb.setAttribute("filter", on ? "url(#swglow)" : "");
      bitText.textContent = on ? "1" : "0"; bitText.setAttribute("fill", on ? "#422006" : C.ink);
    },
    state(local, sc) {
      const c4 = cueT(sc, 4), g1 = easeOut((local - c4 - 0.3) / 1.0), g2 = easeOut((local - c4 - 1.2) / 1.0);
      setArrow(aL, aH, 0, 0, Math.max(1, 0.6 * CR * g1), 0, 18); aT.setAttribute("opacity", g1.toFixed(2));
      setArrow(bL, bH, 0, 0, 0, -Math.max(1, 0.8 * CR * g2), 18); bT.setAttribute("opacity", g2.toFixed(2));
    },
    dirac(local, sc) {
      const g0 = easeOut((local - cueT(sc, 2) - 0.3) / 0.9), g1 = easeOut((local - cueT(sc, 3) - 0.3) / 0.9), g2 = easeOut((local - cueT(sc, 4) - 0.3) / 1.2);
      setArrow(v0[0], v0[1], 0, 0, Math.max(1, VS * g0), 0, 20); vlab[0].setAttribute("opacity", g0.toFixed(2));
      setArrow(v1[0], v1[1], 0, 0, 0, -Math.max(1, VS * g1), 20); vlab[1].setAttribute("opacity", g1.toFixed(2));
      setArrow(vpsi[0], vpsi[1], 0, 0, Math.max(1, 0.6 * VS * g2), -0.8 * VS * g2, 20); vlab[2].setAttribute("opacity", g2.toFixed(2));
      [v0[0], v0[1]].forEach((e) => e.setAttribute("opacity", g0 > 0 ? 1 : 0));
      [v1[0], v1[1]].forEach((e) => e.setAttribute("opacity", g1 > 0 ? 1 : 0));
      [vpsi[0], vpsi[1]].forEach((e) => e.setAttribute("opacity", g2 > 0 ? 1 : 0));
      dashA.setAttribute("opacity", (g2 * 0.8).toFixed(2)); dashB.setAttribute("opacity", (g2 * 0.8).toFixed(2));
    },
    superpos(local, sc) {
      // θ: 0 (|0⟩) → sweeping superpositions (c2) → settles at π/4 for |+⟩ (c4)
      const c2 = cueT(sc, 2), c4 = cueT(sc, 4);
      let th = 0;
      if (local >= c2) th = (Math.PI / 4) * (1 - Math.cos((local - c2) * 1.1)) * 0.9 + 0.05;
      if (local >= c4) th = lerp(th, Math.PI / 4, easeInOut((local - c4) / 1.2));
      const a = Math.cos(th), b = Math.sin(th);
      [a, b].forEach((v, i) => {
        const { amp: ar, prob, at_, pt } = abars[i];
        drawBar(ar, at_, AB.base, AB.top, v, 1, v.toFixed(2));
        drawBar(prob, pt, AB.base, AB.top, v * v, 1, `${Math.round(v * v * 100)}%`);
      });
    },
    coin(local, sc) {
      const s = Math.cos(local * 5.2);
      coinBody.setAttribute("ry", (120 * Math.max(0.04, Math.abs(s))).toFixed(1));
      coinFace.textContent = s >= 0 ? "0" : "1";
      coinFace.setAttribute("transform", `scale(1 ${Math.max(0.04, Math.abs(s)).toFixed(3)})`);
      wvP.forEach((p) => drawWaves(p, local, 640));
    },
    born(local, sc) {
      bornBars.forEach(({ v, r, t }, i) => {
        const g = easeOut((local - cueT(sc, 4 + i) - 0.4) / 1.0);
        drawBar(r, t, BB.base, BB.top, v * g, 1, local > cueT(sc, 6) ? `${Math.round(v * 100)}%` : (v * g).toFixed(2));
        t.setAttribute("opacity", g.toFixed(2));
      });
    },
    collapse(local, sc) {
      const c3 = cueT(sc, 3);
      const n = Math.floor(clamp((local - c3 - 0.8) / Math.max(3, sc.end - sc.start - c3 - 2.2)) ** 1.5 * SH.total);
      const z = n ? CUM0[n - 1] : 0, o = n - z;
      [z, o].forEach((v, i) => drawBar(shotBars[i].r, shotBars[i].t, SH.base, SH.top, v, SH.total * 0.8, String(v)));
      shotCount.textContent = `শট: ${bn(n)} / ${bn(SH.total)}`;
    },
    bloch(local, sc) {
      const c = (k) => cueT(sc, k);
      let st = [0, 0, 1], trailOn = false, axis = null;
      const go = (from, to, t0, d) => { const g = easeInOut((local - t0) / d); const v = from.map((x, i) => lerp(x, to[i], g)); const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
      if (local >= c(3) + 2.2) st = go([0, 0, 1], [0, 0, -1].map((x, i) => (i === 0 ? 0.001 : x)), c(3) + 2.2, 1.6);
      if (local >= c(4)) { st = go([0.001, 0, -1], [1, 0, 0], c(4), 1.4); if (local >= c(4) + 2.4) st = go([1, 0, 0], [-1, 0.001, 0], c(4) + 2.4, 1.6); }
      if (local >= c(5)) { const u = local - c(5); st = sph(Math.PI / 2 + 0.9 * Math.sin(u * 0.7), Math.PI + u * 0.9); trailOn = true; }
      if (local >= c(6)) {
        const u = local - c(6), dur = cueT(sc, 7) - c(6);
        const half = Math.max(4, dur / 2);
        if (u < half) { const g = easeInOut((u - 0.6) / (half - 1.6)); st = rotate([0, 0, 1], [1, 0, 0], Math.PI * g); axis = { v: [1, 0, 0], o: clamp(u / 0.5) }; }
        else { const g = easeInOut((u - half - 0.4) / (half - 1.4)); const k = [Math.SQRT1_2, 0, Math.SQRT1_2]; st = rotate([0, 0, 1], k, Math.PI * g); axis = { v: k, o: clamp((u - half) / 0.5) }; }
        trailOn = true;
      }
      if (local >= c(7)) { st = sph(1.1 + 0.4 * Math.sin(local * 0.5), local * 0.6); trailOn = false; axis = null; }
      bs.draw({ yaw: -0.55 + 0.12 * Math.sin(local * 0.15), state: st, trailOn, axis });
      for (const [k, v] of Object.entries(blab)) {
        const p = bs.P(v), show = k === "0" || k === "1" ? local > c(3) : local > c(4);
        blEls[k].style.left = `${410 + p.sx * 820 / 660}px`; blEls[k].style.top = `${410 + p.sy * 820 / 660}px`;
        blEls[k].style.opacity = show ? "1" : "0";
      }
    },
    multi(local, sc) {
      const c2 = cueT(sc, 2);
      k2.forEach((k, i) => k.classList.toggle("on", local > c2 + [3.3, 4.6, 5.9, 7.0][i]));
    },
    entangle(local, sc) {
      link.setAttribute("d", `M204,120 ${Array.from({ length: 24 }, (_, i) => { const x = 204 + (i + 1) * (192 / 24); return `L${x.toFixed(1)},${(120 + 16 * Math.sin(i * 0.9 - local * 4)).toFixed(1)}`; }).join(" ")}`);
      const c3 = cueT(sc, 3), c4 = cueT(sc, 4);
      PAIRS.forEach((r, i) => {
        const g = clamp((local - c3 - 0.8 - i * 0.7) / 0.3);
        r.style.opacity = g.toFixed(2);
        r.querySelector("span:nth-child(2)").style.opacity = local > c4 ? "1" : "0.15";
        r.querySelector("em").style.opacity = local > c4 + 0.6 ? "1" : "0";
      });
    },
    cnot(local, sc) {
      const c2 = cueT(sc, 2), c3 = cueT(sc, 3), c4 = cueT(sc, 4);
      truthRows.forEach((r) => r.classList.toggle("on", local < c4 && ((r.dataset.k === "1" && local > c2 && local < c3) || (r.dataset.k === "0" && local > c3))));
      bigParts.forEach((p, i) => p.setAttribute("opacity", clamp((local - c4 - 0.4 - i * 0.22) / 0.4).toFixed(2)));
    },
    interf(local, sc) {
      const c = (k) => cueT(sc, k);
      hh1.setAttribute("opacity", local > c(3) - 0.2 && local < c(5) ? 1 : 0.45);
      hh2.setAttribute("opacity", local > c(5) - 0.2 ? 1 : 0.45);
      const showE = (es, t0) => es.forEach((e, i) => { const g = easeInOut((local - t0 - i * 0.3) / 0.9); e.l.setAttribute("stroke-dasharray", e.len); e.l.setAttribute("stroke-dashoffset", (e.len * (1 - g)).toFixed(1)); e.g.setAttribute("opacity", g > 0 ? 1 : 0); });
      showE(e1, c(3) + 0.3); showE(e2a, c(5) + 0.3); showE(e2b, c(6) + 0.3);
      [n10, n11].forEach((n) => n.g.setAttribute("opacity", clamp((local - c(3) - 1.0) / 0.5)));
      n20.g.setAttribute("opacity", clamp((local - c(5) - 1.0) / 0.5)); n21.g.setAttribute("opacity", clamp((local - c(6) - 1.0) / 0.5) * (local > c(7) ? 0.35 : 1));
      sum0.setAttribute("opacity", clamp((local - c(5) - 1.6) / 0.5)); sum1.setAttribute("opacity", clamp((local - c(6) - 1.6) / 0.5));
      n20.c.setAttribute("filter", local > c(7) ? "url(#pglow)" : ""); n20.c.setAttribute("stroke-width", local > c(7) ? 6 : 3);
      colLab.forEach((l, i) => l.setAttribute("opacity", i === 0 ? 1 : clamp((local - (i === 1 ? c(3) : c(5)) - 1) / 0.5)));
    },
    algo(local, sc) {
      wv2P.forEach((p) => drawWaves(p, local, 640));
      const g = easeInOut((local - cueT(sc, 2) - 1) / 8);
      const pg = lerp(1 / AM.n, 0.92, g), po = (1 - pg) / (AM.n - 1);
      amBars.forEach((r, i) => drawBar(r, null, AM.base, AM.top, i === AM.good ? pg : po, 1));
    },
    qiskit(local, sc) {
      const c = (k) => cueT(sc, k);
      bcWires.forEach((w) => w.setAttribute("opacity", clamp((local - c(3)) / 0.5)));
      bcH.setAttribute("opacity", clamp((local - c(4) - 0.3) / 0.5)); bcX.setAttribute("opacity", clamp((local - c(5) - 0.3) / 0.5)); bcLab.setAttribute("opacity", clamp((local - c(6)) / 0.5));
      const hot = local < c(4) ? 3 : local < c(5) ? 4 : local < c(6) ? 5 : 8;
      codeLines.forEach((l, i) => l.classList.toggle("hot", i === hot && local > c(3)));
    },
    results(local, sc) {
      const grow = (hs, t0) => hs.forEach(({ v, r, t, base, top, max }, i) => { const g = easeOut((local - t0 - i * 0.2) / 1.0); drawBar(r, t, base, top, v * g, max, (v * g).toFixed(2)); t.setAttribute("opacity", g.toFixed(2)); });
      grow(idealH, 0.6); grow(noisyH, cueT(sc, 2) + 0.6);
    },
  };

  window.renderAt = renderAt;
  window.ready = document.fonts.ready.then(() => { renderAt(0); return true; });
  const params = new URLSearchParams(location.search);
  if (params.has("play")) { const t0 = performance.now(); const loop = () => { renderAt(((performance.now() - t0) / 1000) % S.duration); requestAnimationFrame(loop); }; window.ready.then(loop); }
  else if (params.has("t")) window.ready.then(() => renderAt(parseFloat(params.get("t"))));
})();
