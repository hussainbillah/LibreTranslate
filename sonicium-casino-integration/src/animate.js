// Deterministic animation engine for the casino-integration film (EN / BN).
// window.renderAt(t) draws the frame at time t; nothing reads the wall clock.
//   ?lang=en|bn  language (text from t-en / t-bn attributes, timing.<lang>.js)
// Reveals are anchored to narration cues: data-in="c2+0.5", data-out="c3".
(function () {
  const S = window.SCRIPT, T = window.TIMING, D = window.DATA, LANG = window.LANG;
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; parent?.appendChild(e); return e; };
  const FONT = "Inter, Noto Sans Bengali";
  const tr = (en, bn) => (LANG === "bn" ? bn : en);
  const money = (v, d = 0) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---- language
  document.querySelectorAll("[t-en]").forEach((el) => { el.innerHTML = el.getAttribute("t-" + LANG); });

  // ---- timing
  let ci = 0;
  S.duration = T.duration;
  S.scenes.forEach((sc, i) => { [sc.start, sc.end] = T.scenes[i]; sc.first = ci; sc.times = sc.cues[LANG].map(() => T.cues[ci++]); });
  if (ci !== T.cues.length) console.error("timing does not match script — run tools/timing.mjs --lang " + LANG);
  const hiddenCue = new Set(S.scenes.flatMap((sc) => (sc.onscreen ?? []).map((k) => sc.first + k)));
  const cueT = (sc, k) => sc.times[k][0] - sc.start;
  const at = (spec, sc) => {
    if (spec === undefined) return null;
    const m = /^c(\d+)([+-][\d.]+)?$/.exec(spec.trim());
    return m ? cueT(sc, +m[1]) + (m[2] ? parseFloat(m[2]) : 0) : parseFloat(spec);
  };

  // ---- icons
  const ICONS = {
    lock: '<rect x="9" y="20" width="30" height="22" rx="4"/><path d="M15 20v-6a9 9 0 0 1 18 0v6"/><circle cx="24" cy="31" r="3"/>',
    chip: '<rect x="13" y="13" width="22" height="22" rx="3"/><rect x="19" y="19" width="10" height="10" rx="1"/><path d="M18 6v7M24 6v7M30 6v7M18 35v7M24 35v7M30 35v7M6 18h7M6 24h7M6 30h7M35 18h7M35 24h7M35 30h7"/>',
    gauge: '<path d="M8 32a16 16 0 0 1 32 0"/><path d="M24 32l8-10"/><circle cx="24" cy="32" r="2.5"/>',
    check: '<path d="M24 6 40 12v12c0 9-7 15-16 18C15 39 8 33 8 24V12Z"/><path d="m17 24 5 5 9-10"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon] ?? ""}</svg>`; });

  // ---- 1: platform infrastructure diagram
  const inf = document.getElementById("infrasvg");
  const box = (x, y, w, h, title, sub, opts = {}) => {
    const g = svgEl("g", {}, inf);
    svgEl("rect", { x, y, width: w, height: h, rx: 20, fill: opts.fill ?? "#fff", stroke: opts.stroke ?? "#c9d8ef", "stroke-width": 2.5 }, g);
    svgEl("text", { x: x + w / 2, y: y + (sub ? h / 2 - 4 : h / 2 + 9), "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: opts.color ?? "#0f2a5f", "font-family": FONT }, g, title);
    if (sub) svgEl("text", { x: x + w / 2, y: y + h / 2 + 26, "text-anchor": "middle", "font-size": 18, fill: opts.subColor ?? "#4a5b7c", "font-family": FONT }, g, sub);
    return g;
  };
  box(150, 20, 400, 90, tr("Players", "খেলোয়াড়"), tr("web · mobile apps", "ওয়েব · মোবাইল অ্যাপ"));
  const plat = svgEl("g", {}, inf);
  svgEl("rect", { x: 40, y: 170, width: 620, height: 230, rx: 24, fill: "#f3f7fe", stroke: "#9fb4d8", "stroke-width": 2.5 }, plat);
  svgEl("text", { x: 350, y: 210, "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#0f2a5f", "font-family": FONT }, plat, tr("Casino platform", "ক্যাসিনো প্ল্যাটফর্ম"));
  [tr("Game services", "গেম সার্ভিস"), tr("Accounts", "অ্যাকাউন্ট"), tr("Payments", "পেমেন্ট")].forEach((t, i) => {
    svgEl("rect", { x: 70 + i * 195, y: 240, width: 175, height: 70, rx: 14, fill: "#fff", stroke: "#c9d8ef", "stroke-width": 2 }, plat);
    svgEl("text", { x: 157 + i * 195, y: 283, "text-anchor": "middle", "font-size": 21, "font-weight": 600, fill: "#0f2a5f", "font-family": FONT }, plat, t);
  });
  const leds = Array.from({ length: 18 }, (_, i) => svgEl("circle", { cx: 90 + i * 30, cy: 360, r: 6, fill: "#c9d8ef" }, plat));
  box(150, 460, 400, 90, tr("Approved backend service", "অনুমোদিত ব্যাকএন্ড সার্ভিস"), tr("server-side · holds the API key", "সার্ভার-সাইড · API key এখানে"));
  box(150, 610, 400, 90, "Sonicium Entropy API", "GET /v1/random", { fill: "#0f2a5f", stroke: "#0f2a5f", color: "#fff", subColor: "#a5c8ff" });
  const links = [[350, 110, 350, 170], [350, 400, 350, 460], [350, 550, 350, 610]].map(([x1, y1, x2, y2]) => svgEl("line", { x1, y1, x2, y2, stroke: "#06b6d4", "stroke-width": 4, "stroke-dasharray": "8 8" }, inf));
  const infPk = [0, 1, 2].map(() => svgEl("circle", { r: 8, fill: "#06b6d4" }, inf));

  // ---- 3: architecture packet
  const arch = document.getElementById("arch"), apacket = document.getElementById("apacket"), anodes = [...arch.querySelectorAll(".anode")];

  // ---- 4: API steps
  const steps = [...document.querySelectorAll("#s-api .steps li")];

  // ---- 6: ROI calculator
  const set = (id, v) => { document.getElementById(id).textContent = v; };
  const I = D.inputs, O = D.out;
  const countups = [
    ["in-req", I.monthly_api_requests, (v) => Math.round(v).toLocaleString("en-US")],
    ["in-fee", I.monthly_service_fee_usd, (v) => money(v)],
    ["in-int", I.initial_integration_cost_usd, (v) => money(v)],
    ["in-ops", I.monthly_operating_cost_usd, (v) => money(v)],
    ["in-ben", I.monthly_measurable_benefit_usd, (v) => money(v)],
    ["o-mrc", O.monthly_recurring_cost, (v) => money(v)],
    ["o-fyc", O.first_year_total_cost, (v) => money(v)],
    ["o-vol", O.first_year_requests / 1e6, (v) => `${Math.round(v)}M`],
    ["o-cpm", O.cost_per_million_requests, (v) => money(v, 2)],
    ["o-ab", O.annual_measurable_benefit, (v) => money(v)],
    ["o-net", O.net_first_year_benefit, (v) => money(v)],
    ["o-roi", O.first_year_roi_percent, (v) => `${v.toFixed(1)}%`],
  ].map(([id, target, fmt]) => ({ el: document.getElementById(id), target, fmt, host: document.getElementById(id).closest("[data-in]") }));
  document.getElementById("roinote").innerHTML = tr(
    `<b>Method only.</b> Sample assumptions from the brief — not Sonicium Entropy prices, not a quotation, not measured savings. For orientation: the catalog Business plan ($199/month) covers 2 million requests a month, so 10 million a month would fall under an Enterprise agreement.`,
    `<b>শুধু পদ্ধতি।</b> ব্রিফের নমুনা অনুমান — Sonicium Entropy-এর মূল্য, কোটেশন বা পরিমাপিত সাশ্রয় নয়। প্রসঙ্গত: ক্যাটালগের Business প্ল্যান ($199/মাস) মাসে ২০ লাখ অনুরোধ পর্যন্ত; মাসে ১ কোটি অনুরোধ হলে Enterprise চুক্তি প্রযোজ্য।`,
  );
  const rc = document.getElementById("roichart");
  const months = D.months, cMax = Math.max(...months.map((m) => Math.max(m.cost, m.benefit))) * 1.08;
  const cx = (m) => 14 + m * 19, cy = (v) => 168 - (v / cMax) * 118;
  svgEl("line", { x1: 14, y1: 168, x2: 246, y2: 168, stroke: "#c9d8ef", "stroke-width": 2 }, rc);
  const costPath = svgEl("path", { d: months.map((r, i) => `${i ? "L" : "M"}${cx(r.m)},${cy(r.cost)}`).join(" "), fill: "none", stroke: "#b45309", "stroke-width": 4 }, rc);
  const benPath = svgEl("path", { d: months.map((r, i) => `${i ? "L" : "M"}${cx(r.m)},${cy(r.benefit)}`).join(" "), fill: "none", stroke: "#047857", "stroke-width": 4 }, rc);
  svgEl("text", { x: 14, y: 16, "font-size": 14, "font-weight": 700, fill: "#b45309", "font-family": FONT }, rc, tr("cumulative cost", "ক্রমযোজিত খরচ"));
  svgEl("text", { x: 14, y: 34, "font-size": 14, "font-weight": 700, fill: "#047857", "font-family": FONT }, rc, tr("cumulative benefit", "ক্রমযোজিত সুবিধা"));
  const be = D.breakEvenMonth;
  const beMark = svgEl("g", { opacity: 0 }, rc);
  if (be) {
    svgEl("line", { x1: cx(be), y1: 46, x2: cx(be), y2: 168, stroke: "#2563eb", "stroke-width": 2, "stroke-dasharray": "5 5" }, beMark);
    svgEl("text", { x: cx(be) + 5, y: 158, "font-size": 13, "font-weight": 700, fill: "#2563eb", "font-family": FONT }, beMark, tr(`break-even ≈ m${be}`, `ব্রেক-ইভেন ≈ মাস ${String(be).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])}`));
  }
  svgEl("text", { x: 246, y: 186, "text-anchor": "end", "font-size": 12, fill: "#8a9bbd", "font-family": FONT }, rc, tr("months 0–12", "মাস ০–১২"));
  const cLen = costPath.getTotalLength(), bLen = benPath.getTotalLength();

  // ---- 7: stages
  const stages = [...document.querySelectorAll(".stage")], sfill = document.getElementById("sfill");

  // ---- particles
  const canvas = document.getElementById("particles"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const PARTS = Array.from({ length: 46 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, r: 1.5 + hash(i, 3) * 3, vx: (hash(i, 4) - 0.5) * 12, vy: -5 - hash(i, 5) * 12, a: 0.12 + hash(i, 6) * 0.3 }));
  const drawParticles = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const p of PARTS) { ctx.beginPath(); ctx.fillStyle = `rgba(6,182,212,${p.a})`; ctx.arc((((p.x + p.vx * t) % W) + W) % W, (((p.y + p.vy * t) % H) + H) % H, p.r, 0, Math.PI * 2); ctx.fill(); }
  };

  // ---- generic reveal
  const scenes = S.scenes.map((sc) => {
    const el = document.getElementById("s-" + sc.id);
    const items = [...el.querySelectorAll("[data-in],[data-out]")].map((e) => ({ e, tin: at(e.dataset.in, sc) ?? 0, tout: at(e.dataset.out, sc) }));
    return { sc, el, items };
  });
  const basisEl = document.getElementById("basis"), subEl = document.getElementById("subtext"), subBox = document.getElementById("subs"), bar = document.getElementById("bar");
  const BASIS = {
    illustrative: tr("Conceptual illustration", "ধারণাগত চিত্র"),
    verified: tr("✓ Verified against Sonicium Entropy source & docs", "✓ যাচাইকৃত: Sonicium Entropy সোর্স কোড ও ডকুমেন্টেশন"),
    tobemeasured: tr("Metrics to be measured by the client", "মেট্রিক — ক্লায়েন্ট পরিমাপ করবেন"),
    scenario: tr("Illustrative scenario — not a forecast", "দৃষ্টান্তমূলক দৃশ্যপট — পূর্বাভাস নয়"),
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
        e._local = local - tin;
      }
      FX[sc.id]?.(local, sc);
    }
    const basis = active?.basis ?? "";
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

  const packetAlong = (container, nodes, packet, local, speed) => {
    const r0 = container.getBoundingClientRect();
    const xs = nodes.map((n) => { const r = n.getBoundingClientRect(); return r.left + r.width / 2 - r0.left; });
    const cyc = ((local * speed) % 1) * (xs.length - 1), i = Math.min(xs.length - 2, Math.floor(cyc));
    packet.style.opacity = "1";
    packet.style.transform = `translateX(${(xs[i] + (xs[i + 1] - xs[i]) * easeInOut(cyc - i) - 9).toFixed(1)}px)`;
    nodes.forEach((n, k) => n.classList.toggle("on", k === Math.round(cyc)));
  };

  const FX = {
    intro(local) {
      const tick = Math.floor(local * 5);
      leds.forEach((l, i) => l.setAttribute("fill", hash(i, tick) > 0.5 ? "#06b6d4" : "#c9d8ef"));
      links.forEach((l) => l.setAttribute("stroke-dashoffset", (-local * 30).toFixed(1)));
      [[110, 170], [400, 460], [550, 610]].forEach(([y1, y2], i) => {
        const p = ((local * 0.6 + i * 0.33) % 1);
        infPk[i].setAttribute("cx", 350); infPk[i].setAttribute("cy", (y1 + (y2 - y1) * p).toFixed(1));
        infPk[i].setAttribute("opacity", (Math.sin(p * Math.PI) * clamp(local - 1)).toFixed(2));
      });
    },
    usage(local) { if (local > 1) packetAlong(arch, anodes, apacket, local, 0.2); else apacket.style.opacity = "0"; },
    api(local, sc) {
      const c = (k) => cueT(sc, k);
      const on = local >= c(4) ? 5 : local >= c(3) ? 4 : local >= c(2) ? 3 : local >= c(1) ? 2 : local >= c(0) + 1.2 ? 1 : 0;
      steps.forEach((li, i) => { li.className = i === on ? "on" : i < on ? "done" : ""; });
    },
    roi() {
      for (const u of countups) {
        const p = easeOut((u.host?._local ?? 0) / 1.2);
        u.el.textContent = u.fmt(u.target * p);
      }
      const chartHost = rc.closest("[data-in]"), lp = clamp((chartHost._local ?? 0) / 2.5);
      costPath.setAttribute("stroke-dasharray", cLen); costPath.setAttribute("stroke-dashoffset", (cLen * (1 - lp)).toFixed(1));
      benPath.setAttribute("stroke-dasharray", bLen); benPath.setAttribute("stroke-dashoffset", (bLen * (1 - lp)).toFixed(1));
      beMark.setAttribute("opacity", clamp(lp * 3 - 2).toFixed(2));
    },
    stages(local, sc) {
      const n = local >= cueT(sc, 3) ? 3 : local >= cueT(sc, 2) ? 2 : local >= cueT(sc, 1) ? 1 : 0;
      sfill.style.width = `${(n / 3) * 100}%`;
      stages.forEach((s, i) => s.classList.toggle("on", i < n));
    },
  };

  window.renderAt = renderAt;
  window.ready = document.fonts.ready.then(() => { renderAt(0); return true; });
  const params = new URLSearchParams(location.search);
  if (params.has("play")) { const t0 = performance.now(); const loop = () => { renderAt(((performance.now() - t0) / 1000) % S.duration); requestAnimationFrame(loop); }; window.ready.then(loop); }
  else if (params.has("t")) window.ready.then(() => renderAt(parseFloat(params.get("t"))));
})();
