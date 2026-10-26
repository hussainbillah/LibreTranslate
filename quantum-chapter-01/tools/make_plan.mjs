// Writes quantum_chapter01_production_plan.md: the scene-by-scene timeline
// (times measured from the voice-over by tools/timing.mjs --voice), the
// visual-generation prompts, on-screen text and equations, transitions, the
// style guide, editing/sync instructions and the QC checklist.
//
//   node tools/make_plan.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
vm.runInNewContext(readFileSync(join(ROOT, "src/timing.js"), "utf8").replace("window.TIMING", "globalThis.TIMING"), ctx);
const S = ctx.SCRIPT, T = ctx.TIMING;
const ts = (s) => { const m = Math.floor(s / 60), x = s - m * 60; return `${String(m).padStart(2, "0")}:${x.toFixed(1).padStart(4, "0")}`; };
const strip = (t) => t; // keep ZWJ: it makes র-ফলা + য-ফলা render correctly

// Per-scene direction. "prompt" is written for an AI video/image generator and
// describes only the visual layer; on-screen text and equations are added in
// the edit (generators do not render Bengali or maths reliably).
const PLAN = {
  hook: {
    visual: "Black-navy void. The series title and chapter title fade up in the centre, then give way to a slowly rotating 3D probability cloud (a dumbbell-shaped 2p-like orbital of cyan and violet points around a bright nucleus) on the right. Three question cards and a chapter road-map appear on the left.",
    motion: "Slow push-in on the title (≈5%), cross-dissolve to the cloud. The cloud rotates ~10°/s; points twinkle. Cards slide up 20 px and fade in on their sentences.",
    text: "কোয়ান্টাম পাঠমালা · অধ্যায় ১ · কিউবিট, সুপারপজিশন ও পরিমাপ → “প্রকৃতির অতি ক্ষুদ্র কণার কোয়ান্টাম বৈশিষ্ট্য…” → কোয়ান্টাম কম্পিউটিং (Quantum Computing) → three questions → road-map কিউবিট → সুপারপজিশন → পরিমাপ → এনট্যাঙ্গলমেন্ট → গেট ও ব্যতিচার",
    math: "—",
    transition: "Soft dissolve (0.7 s) with a low whoosh into the title card.",
    prompt: "Cinematic macro visualization of an electron probability cloud, a dumbbell-shaped p-orbital made of thousands of tiny glowing cyan and violet points around a bright white nucleus, deep navy-black background, subtle depth of field, slow rotation, scientific documentary style, no text, 16:9.",
  },
  title: {
    visual: "Chapter title card: “অধ্যায় ১ — কিউবিট, সুপারপজিশন ও পরিমাপ / Qubits, Superposition & Measurement” on the left; a glowing Bloch sphere with a pink state vector drifting on the right.",
    motion: "Title lines fade up in sequence; the Bloch vector precesses slowly; camera static.",
    text: "স্বাগতম · কোয়ান্টাম পাঠমালা · অধ্যায় ১ · কিউবিট, সুপারপজিশন ও পরিমাপ · Qubits, Superposition & Measurement",
    math: "—",
    transition: "Dissolve; section card ‘১’ takes over.",
    prompt: "Elegant glass-like Bloch sphere floating in dark space, thin cyan latitude and longitude rings, a glowing magenta arrow from the centre to the surface, soft volumetric light, premium science-documentary title background, negative space on the left for text, no text, 16:9.",
  },
  why: {
    visual: "Section card ‘১ কেন কোয়ান্টাম কম্পিউটিং?’. Left: phone, laptop and supercomputer icons; a live stream of flipping classical bits; card ‘bit ∈ {0, 1}’. Right: a molecule with glowing atoms and orbiting electrons; a growth chart of 2ⁿ amplitudes for n = 10, 30, 50.",
    motion: "Icons rise in; bits flip ~2×/s; electrons orbit; growth bars extend on the last sentence.",
    text: "মোবাইল ফোন · ল্যাপটপ · সুপারকম্পিউটার · ক্লাসিক্যাল কম্পিউটার · একটি বিট: শূন্য, নয়তো এক · প্রকৃতির ক্ষুদ্রতম জগৎ: কোয়ান্টাম পদার্থবিজ্ঞান · n টি দ্বি-অবস্থা কণার পূর্ণ অবস্থা লিখতে 2ⁿ টি জটিল সংখ্যা",
    math: "bit ∈ {0, 1};  2¹⁰ = 1,024;  2³⁰ ≈ 1.07 × 10⁹;  2⁵⁰ ≈ 1.13 × 10¹⁵",
    transition: "Cut on the scene boundary with a 0.6 s cross-fade.",
    prompt: "Split composition: on the left, sleek minimal icons of a smartphone, laptop and server rack outlined in cyan; on the right, a ball-and-stick molecule with glowing atoms wrapped in soft electron clouds, dark navy background, clean educational infographic style, no text, 16:9.",
  },
  feynman: {
    visual: "Historical cards: 1980 Paul Benioff · Yuri Manin; 1981 Richard Feynman, ‘Simulating Physics with Computers’ (published 1982). A loop diagram ‘প্রকৃতি ⇄ কোয়ান্টাম কম্পিউটার’. Right: myth banner ‘সব কাজে দ্রুত নয়’, three everyday tasks marked ‘ক্লাসিক্যাল ✓’, and the box ‘নির্দিষ্ট কিছু সমস্যা’.",
    motion: "Cards stagger in; dashed loop arrows flow; myth banner pops with a gentle scale.",
    text: "সম্ভব হতে পারে · কোয়ান্টাম কম্পিউটার সব কাজে দ্রুত নয় · ইমেইল / ভিডিও / সাধারণ হিসাব — ক্লাসিক্যাল ✓ · কোয়ান্টাম ব্যবস্থার সিমুলেশন · কিছু নির্দিষ্ট গাণিতিক সমস্যা",
    math: "—",
    transition: "Section card ‘২’.",
    prompt: "Abstract diagram of nature and a quantum computer mirroring each other: on one side swirling atoms, on the other a cryogenic quantum processor chandelier glowing softly, connected by flowing dashed light arrows, dark background, documentary infographic, no people, no text, 16:9.",
  },
  bit: {
    visual: "Left: a light switch wired to a bulb that toggles 0 ⇄ 1. Right: the word ‘কিউবিট’ with a glowing qubit orb, then the two basis kets |0⟩ and |1⟩ and an anatomy label of the ket symbol.",
    motion: "Switch flips every 1.6 s during the switch sentences (bulb glows on ‘1’); kets fade up on their sentences.",
    text: "বন্ধ = 0 · চালু = 1 · ক্লাসিক্যাল বিট: যেকোনো মুহূর্তে 0 অথবা 1 · কিউবিট — qubit = quantum bit · কেট জিরো · কেট ওয়ান · | ভার্টিক্যাল বার · ⟩ অ্যাঙ্গেল ব্র‍্যাকেট · ket",
    math: "|0⟩,  |1⟩",
    transition: "Cross-fade.",
    prompt: "Minimal glowing light switch connected by a thin wire to a bulb, beside a luminous cyan-violet sphere representing a qubit, dark navy studio background, clean 3D motion-graphics style, no text, 16:9.",
  },
  state: {
    visual: "Large equation |ψ⟩ = α|0⟩ + β|1⟩ with α in cyan and β in violet; labels ‘অ্যাম্প্লিচিউড’ and ‘জটিল সংখ্যা’. A complex plane draws α = 0.6 on the real axis and β = 0.8i on the imaginary axis. Normalisation |α|² + |β|² = 1 with the worked check 0.36 + 0.64 = 1.",
    motion: "Equation fades in; α and β arrows grow from the origin; check line fades in; badge pops.",
    text: "α, β = অ্যাম্প্লিচিউড · জটিল সংখ্যা হতে পারে · উদাহরণ: α = 0.6, β = 0.8i · নর্মালাইজেশন (Normalization)",
    math: "|ψ⟩ = α|0⟩ + β|1⟩;  α, β ∈ ℂ;  |α|² + |β|² = 1;  0.6² + |0.8i|² = 0.36 + 0.64 = 1",
    transition: "Section card ‘৩’.",
    prompt: "Glowing complex plane with real and imaginary axes and a dashed unit circle, two luminous arrows (cyan along the real axis, violet along the imaginary axis), dark background, mathematical motion-graphics style, no text, 16:9.",
  },
  dirac: {
    visual: "Column vectors |0⟩ = (1, 0)ᵀ and |1⟩ = (0, 1)ᵀ; a 2D plane where |0⟩ and |1⟩ are perpendicular arrows and |ψ⟩ = (α, β)ᵀ is their combination; three cards: state = vector, gate = matrix × vector (X(1,0)ᵀ = (0,1)ᵀ), probability = |α|², |β|².",
    motion: "Arrows draw on their sentences; dashed projections show α and β components.",
    text: "ডিরাক নোটেশন (Dirac / bra–ket notation) · অবস্থা · গেটের প্রভাব · সম্ভাবনা",
    math: "|0⟩ = (1, 0)ᵀ;  |1⟩ = (0, 1)ᵀ;  |ψ⟩ = α(1, 0)ᵀ + β(0, 1)ᵀ = (α, β)ᵀ;  X(1, 0)ᵀ = (0, 1)ᵀ",
    transition: "Section card ‘৪’.",
    prompt: "Clean 2D vector diagram on a dark grid: two perpendicular glowing arrows (cyan and violet) from a common origin and a magenta diagonal arrow with dashed projection lines, minimal mathematical animation style, no text, 16:9.",
  },
  superpos: {
    visual: "Amplitude (solid) and probability (light) bars for |0⟩ and |1⟩. They start at the basis state (α = 1, β = 0), sweep through superpositions, and settle at |+⟩ = (|0⟩ + |1⟩)/√2 with 50% / 50%.",
    motion: "Bars animate continuously with θ; settle smoothly on the |+⟩ sentence; probability cards fade in.",
    text: "কোয়ান্টাম কম্পিউটিংয়ের অন্যতম গুরুত্বপূর্ণ ধারণা · α ≠ 0 এবং β ≠ 0 ⇒ সুপারপজিশন · একটি বিশেষ অবস্থা · 50% · 50%",
    math: "|+⟩ = (|0⟩ + |1⟩)/√2;  P(0) = |1/√2|² = ½;  P(1) = |1/√2|² = ½",
    transition: "Cross-fade.",
    prompt: "Two glowing vertical bars of light, cyan and violet, smoothly exchanging height like a balance, with soft reflections on a dark glossy floor, abstract data-visualization style, no text, 16:9.",
  },
  coin: {
    visual: "Banner ‘দুটি লুকানো ক্লাসিক্যাল উত্তর নয়’. Left: a spinning gold coin (classical uncertainty from ignorance, p = ½, no sign or phase). Right: |+⟩ and |−⟩, which give the same 50/50 statistics but differ in the sign of the |1⟩ amplitude; two wave panels showing reinforcement (same sign) and cancellation (opposite sign).",
    motion: "Coin spins continuously (squash on its edge, face alternates 0/1); waves scroll; the sum wave grows or flattens.",
    text: "সুপারপজিশন মানে … দুটি লুকানো ক্লাসিক্যাল উত্তর নয় · ঘুরতে থাকা মুদ্রা · অনিশ্চয়তা মূলত আমাদের অজ্ঞতা · একই চিহ্ন → জোরদার · বিপরীত চিহ্ন → বাতিল · ব্যতিচার (Interference)",
    math: "|+⟩ = (|0⟩ + |1⟩)/√2;  |−⟩ = (|0⟩ − |1⟩)/√2;  p = ½",
    transition: "Section card ‘৫’.",
    prompt: "A gold coin spinning on its edge in slow motion on a dark reflective surface, next to two overlapping luminous sine waves that combine into a brighter wave, documentary physics visualization, no text, 16:9.",
  },
  born: {
    visual: "Flow: qubit → measurement meter → ‘0 অথবা 1’. Then the worked example |ψ⟩ = (√3/2)|0⟩ + (i/2)|1⟩ with P(0) = 3/4 and P(1) = 1/4, probability bars 75% / 25%, and 3/4 + 1/4 = 1.",
    motion: "Flow nodes appear left to right; each calculation fades in on its sentence; bars grow on the matching sentence and switch to percentages.",
    text: "পরিমাপ · ক্লাসিক্যাল ফল: 0 অথবা 1 · বর্ন নিয়ম (Born rule) · 75% · 25% · নর্মালাইজেশন শর্তের ব্যবহারিক অর্থ",
    math: "P(0) = |α|², P(1) = |β|²;  |ψ⟩ = (√3/2)|0⟩ + (i/2)|1⟩;  P(0) = |√3/2|² = 3/4;  P(1) = |i/2|² = |i|²/4 = 1/4;  3/4 + 1/4 = 1",
    transition: "Cross-fade.",
    prompt: "A minimalist glowing measurement dial (analog meter icon) receiving a soft quantum glow and emitting a single sharp digital bit, with two clean probability bars in the background, dark science-infographic style, no text, 16:9.",
  },
  collapse: {
    visual: "Before → measurement (result 0) → after: (√3/2)|0⟩ + (i/2)|1⟩ becomes |0⟩. ‘একবার পরিমাপ = একটি বিট’. A histogram of 1,000 simulated shots of the same circuit fills toward the expected 75% : 25%.",
    motion: "Boxes appear in sequence; shot counter accelerates as the histogram fills (deterministic simulated draws).",
    text: "পরিমাপের আগে → পরে · আগের সুপারপজিশনের তথ্য আর একইভাবে পাওয়া যায় না · একবার পরিমাপ = একটি বিট, সব তথ্য নয় · একই সার্কিট বহুবার চালিয়ে পরিসংখ্যান · সিমুলেটেড শট · প্রত্যাশিত অনুপাত ৭৫% : ২৫%",
    math: "(√3/2)|0⟩ + (i/2)|1⟩ → |0⟩ (for outcome 0)",
    transition: "Section card ‘৬’.",
    prompt: "Particles of light falling into two glowing bins and stacking into a histogram, one bin clearly three times taller than the other, dark background, elegant data-art style, no text, 16:9.",
  },
  bloch: {
    visual: "Large 3D Bloch sphere with x, y, z axes. The state vector moves north |0⟩ → south |1⟩ → equator |+⟩ → |−⟩, then wanders with a trail (every point is a state). Rotation demo: X as a 180° rotation about x (|0⟩ → |1⟩), then H as a 180° rotation about the (x + z)/√2 axis (|0⟩ → |+⟩), axis drawn in amber. Side panel with the parametrisation and the misconception box (one measurement yields one classical bit).",
    motion: "Camera orbits gently (±7°); vector moves with ease-in-out; rotation axis fades in during each rotation.",
    text: "ব্লখ গোলক (Bloch sphere) · উত্তর মেরু |0⟩ · দক্ষিণ মেরু |1⟩ · বিষুবরেখা |+⟩, |−⟩ · প্রতিটি বিন্দু একটি নির্দিষ্ট (বিশুদ্ধ) কিউবিট অবস্থা · একক-কিউবিট গেট = ঘূর্ণন · ভুল ধারণা: অসংখ্য বিন্দু = অসীম তথ্য (struck through) · একটি কিউবিট মেপে পাওয়া যায় একটি ক্লাসিক্যাল বিট",
    math: "|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩;  X = 180° about x;  H = 180° about (x + z)/√2",
    transition: "Section card ‘৭’.",
    prompt: "Photorealistic transparent glass sphere with thin glowing cyan meridian and equator lines, three faint coordinate axes, a bright magenta arrow from the centre to the north pole leaving a light trail as it sweeps across the surface, dark space background, cinematic slow orbit, no text, 16:9.",
  },
  multi: {
    visual: "Rows of basis-state chips doubling: 1 qubit (|0⟩, |1⟩) → 2 qubits (|00⟩, |01⟩, |10⟩, |11⟩, each lighting up exactly as it is spoken) → 3 qubits (8 states) → n qubits (2ⁿ).",
    motion: "Rows slide in; the four two-qubit kets highlight in sync with the narration.",
    text: "১ কিউবিট 2 · ২ কিউবিট 4 · ৩ কিউবিট 8 · n কিউবিট 2ⁿ",
    math: "|00⟩, |01⟩, |10⟩, |11⟩;  |000⟩ … |111⟩;  2ⁿ",
    transition: "Cross-fade.",
    prompt: "A branching tree of glowing nodes that doubles at every level (2, 4, 8, 16 …), cyan light pulses travelling down the branches, dark background, abstract exponential-growth visualization, no text, 16:9.",
  },
  entangle: {
    visual: "Two qubit orbs q₀ and q₁ joined by an oscillating violet link; Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2; a table of six simulated joint measurements where the first qubit is random and the second always matches; two labs A and B joined by a dashed line with the note that no faster-than-light messaging is possible and classical communication is needed.",
    motion: "Link waves continuously; table rows appear one by one, the second column and ✓ marks appear on the ‘matches’ sentence.",
    text: "এনট্যাঙ্গলমেন্ট (কোয়ান্টাম জড়াজড়ি) · বেল স্টেট · প্রথম: 0 বা 1, প্রতিটি ৫০% · একই ভিত্তিতে মাপলে ফল মিলে যায় · আলোর চেয়ে দ্রুত বার্তা পাঠানো যায় না · ফল নিয়ন্ত্রণ করা যায় না · সাধারণ (ক্লাসিক্যাল) যোগাযোগ লাগে",
    math: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
    transition: "Section card ‘৮’.",
    prompt: "Two luminous spheres, one cyan and one magenta, connected by a delicate oscillating violet thread of light across a dark void, with two distant laboratory benches on either side, poetic but scientific documentary look, no text, 16:9.",
  },
  gates1: {
    visual: "Three gate cards: X (cyan), Z (violet), H (pink) — gate symbol, matrix, and action on the basis states.",
    motion: "Cards rise in on their sentences; action lines appear on the explaining sentence.",
    text: "ক্লাসিক্যাল লজিক গেট NOT · AND · OR → কোয়ান্টাম গেট · কোয়ান্টাম NOT গেট · |1⟩-এর অ্যাম্প্লিচিউডের চিহ্ন বদলায় · হাদামার্ড গেট",
    math: "X = [[0, 1], [1, 0]], X|0⟩ = |1⟩, X|1⟩ = |0⟩;  Z = [[1, 0], [0, −1]], Z|0⟩ = |0⟩, Z|1⟩ = −|1⟩;  H = (1/√2)[[1, 1], [1, −1]], H|0⟩ = |+⟩, H|1⟩ = |−⟩",
    transition: "Cross-fade.",
    prompt: "Three floating glossy tiles labelled only by colour (cyan, violet, pink) arranged in a row, each emitting a soft glow, quantum-circuit wires running behind them, dark tech background, premium motion-graphics style, no text, 16:9.",
  },
  cnot: {
    visual: "CNOT symbol (control dot, target ⊕) with the truth table on |control target⟩: 00→00, 01→01, 10→11, 11→10; rows highlight as the control-1 and control-0 rules are spoken. Then a larger 3-qubit example circuit (H, X, CNOTs, Z, measurements) builds left to right.",
    motion: "Rows highlight; circuit elements appear in sequence (≈0.2 s apart).",
    text: "CNOT (controlled-NOT · সি-নট) · কন্ট্রোল · টার্গেট · কন্ট্রোল = 1 → টার্গেট উল্টে যায় · কন্ট্রোল = 0 → অপরিবর্তিত",
    math: "|c, t⟩ → |c, t ⊕ c⟩",
    transition: "Section card ‘৯’.",
    prompt: "A clean horizontal quantum circuit diagram drawn in light on a dark background: parallel wires, coloured square gates, a control dot connected by a vertical line to a target circle with a plus, measurement meters at the end, smooth reveal from left to right, no text, 16:9.",
  },
  interf: {
    visual: "Circuit |0⟩ — H — H — meter on top. Below, an amplitude path diagram: |0⟩ splits into |0⟩ and |1⟩ (+1/√2 each); the second H sends four paths: into |0⟩ +½ and +½ (constructive, sum 1); into |1⟩ +½ and −½ (destructive, sum 0). Final |0⟩ glows; identity H·H = I.",
    motion: "Each H gate lights in turn; path lines draw like light filaments; the |1⟩ node dims after cancellation.",
    text: "শুরু · প্রথম H-এর পর · দ্বিতীয় H-এর পর · পরিচয় রূপান্তর (identity)",
    math: "H|0⟩ = (|0⟩ + |1⟩)/√2;  HH|0⟩: |0⟩ amplitude ½ + ½ = 1, |1⟩ amplitude ½ − ½ = 0;  H H = I",
    transition: "Cross-fade.",
    prompt: "Light paths splitting and recombining like a Mach–Zehnder interferometer drawn as glowing cyan filaments on a dark background, two paths merging into a bright spot while two others cancel into darkness, elegant physics visualization, no text, 16:9.",
  },
  algo: {
    visual: "Two large wave panels (constructive vs destructive). Right: an illustrative bar chart of 8 candidate answers where the correct one (green) grows while the others shrink, labelled ‘ধারণাগত চিত্র’. Caveat box: not every problem benefits; it depends on problem structure and algorithm design.",
    motion: "Waves scroll; bars redistribute smoothly over ~8 s.",
    text: "গঠনমূলক / ধ্বংসাত্মক ব্যতিচার · অ্যালগরিদমের কৌশল: গেট সাজিয়ে ভুল উত্তরের সম্ভাবনা ↓, সঠিক উত্তরের ↑ · ধারণাগত চিত্র · এই সুবিধা সব সমস্যায় নয় · নির্ভর করে সমস্যার গঠন ও অ্যালগরিদমের নকশার ওপর",
    math: "—",
    transition: "Section card ‘১০’.",
    prompt: "Eight thin columns of light where one green column steadily rises while the others fade down, overlaid with faint interfering wave patterns, dark background, abstract algorithm visualization, no text, 16:9.",
  },
  qiskit: {
    visual: "Dark code editor with the Qiskit program typed line by line in sync with the narration (circuit with 2 qubits → h(0) → cx(0, 1) → Statevector probabilities); the matching circuit builds on the right; state evolution |00⟩ → (|00⟩ + |10⟩)/√2 → (|00⟩ + |11⟩)/√2.",
    motion: "Lines appear on their sentences; the active line is highlighted; gates appear on the circuit at the same moments.",
    text: "Qiskit · কোয়ান্টাম সার্কিট তৈরি ও পরীক্ষার সফটওয়্যার কাঠামো · code comments in Bengali · কেট-এ প্রথম অঙ্ক = প্রথম কিউবিট (q0)",
    math: "|00⟩ →(H⊗I) (|00⟩ + |10⟩)/√2 →(CNOT) (|00⟩ + |11⟩)/√2",
    transition: "Cross-fade.",
    prompt: "Close-up of a sleek dark code editor on a monitor with syntax-highlighted Python, soft cyan screen glow on a dark desk, shallow depth of field, modern developer documentary style, code unreadable/blurred, 16:9.",
  },
  results: {
    visual: "Two histograms: ideal model (|00⟩ 0.50, |01⟩ 0, |10⟩ 0, |11⟩ 0.50) and an illustrative real-hardware example with small |01⟩ and |10⟩ bars, clearly labelled as illustrative, not measured.",
    motion: "Bars grow on their sentences.",
    text: "আদর্শ গাণিতিক মডেল · |01⟩ ও |10⟩-এর সম্ভাবনা শূন্য · বাস্তব কোয়ান্টাম হার্ডওয়্যার · চিত্রায়িত উদাহরণ, মাপা তথ্য নয় · গেটের ত্রুটি · পরিমাপের ত্রুটি · পরিবেশের প্রভাব",
    math: "P(00) = P(11) = 0.5; P(01) = P(10) = 0",
    transition: "Section card ‘উপসংহার’.",
    prompt: "A dilution refrigerator quantum computer (gold chandelier of cables and plates) in a dark lab with soft rim light, slow dolly-in, cinematic documentary look, no text, 16:9.",
  },
  summary: {
    visual: "Recap grid of six concept tiles timed to the narration (qubit, superposition, Born rule, entanglement, gates, interference), then two takeaway banners.",
    motion: "Tiles appear in narration order; banners slide up.",
    text: "কিউবিট · সুপারপজিশন · বর্ন নিয়ম · এনট্যাঙ্গলমেন্ট · গেট · ব্যতিচার · কোয়ান্টাম কম্পিউটার একবারে সব উত্তর পড়ে ফেলতে পারে না · শক্তি আসে … কাঙ্ক্ষিত ফলের সম্ভাবনা বাড়ানো থেকে",
    math: "α|0⟩ + β|1⟩;  |+⟩;  P(0) = |α|²;  (|00⟩ + |11⟩)/√2;  X, Z, H, CNOT;  HH|0⟩ = |0⟩",
    transition: "Cross-fade.",
    prompt: "A calm constellation of six glowing icons connected by thin light lines over a deep navy background, recap/summary motion-graphics style, no text, 16:9.",
  },
  outro: {
    visual: "‘অধ্যায় ১ সম্পন্ন’ check, next-chapter card (কোয়ান্টাম সার্কিটের মডেল · ডয়েচ-জোজা অ্যালগরিদম), thanks, and ‘দেখা হবে পরবর্তী অধ্যায়ে’; the film ends with the last spoken word.",
    motion: "Elements fade up on their sentences; hold to the end of the voice-over.",
    text: "অধ্যায় ১ সম্পন্ন · প্রথম গুরুত্বপূর্ণ ধাপ · পরবর্তী অধ্যায় · কোয়ান্টাম সার্কিটের মডেল · ডয়েচ-জোজা অ্যালগরিদম (Deutsch–Jozsa) · কোয়ান্টাম পাঠমালার সঙ্গে থাকার জন্য ধন্যবাদ · দেখা হবে পরবর্তী অধ্যায়ে",
    math: "—",
    transition: "End of film (music tail fades with the voice).",
    prompt: "Slow pull-back from a glowing qubit sphere into a starfield of faint cyan particles, calm closing shot, dark navy palette, no text, 16:9.",
  },
};

let ci = 0;
const L = [];
L.push("# কোয়ান্টাম পাঠমালা — অধ্যায় ১: কিউবিট, সুপারপজিশন ও পরিমাপ", "## Production plan (timeline, prompts, style guide, editing, QC)", "");
L.push(`Generated by \`tools/make_plan.mjs\`. Every time below is **measured from the supplied voice-over** (\`output/voiceover.mp3\`, ${ts(T.duration)} = 11:11.8). The voice-over was not shortened, rewritten, regenerated or replaced.`, "");
L.push("**How the times were measured:**");
L.push("- `tools/timing.mjs --voice` found the speech blocks with ffmpeg `silencedetect`.");
L.push("- A dynamic-programming alignment matched them, in order, to the 138 spoken sentences and headings of the script. It uses three cues:");
L.push("  - sentence length;");
L.push("  - pause depth;");
L.push("  - the recording's ~0.8–1.0 s pauses before section headings.");
L.push("- Three sentence starts were confirmed by hand from the pause map and pinned:");
L.push("  - 0:08.1 \"কল্পনা করুন…\";");
L.push("  - 0:40.1 \"স্বাগতম…\";");
L.push("  - 6:21.3 \"দুটি কিউবিটের ক্ষেত্রে…\", where the four spoken kets |00⟩…|11⟩ are four separate speech blocks.");
L.push("- The audio was not transcribed by a speech recogniser, so a boundary can be off by one short phrase where the narration runs two sentences together without a pause.", "");
L.push("Rendered result: `output/quantum_chapter01_qubits_superposition_measurement.mp4` (1920×1080, 30 fps, H.264 + AAC). The prompts below are for rebuilding or extending the visuals in an AI video workflow.", "");

L.push("## 1. Scene timeline (00:00 – 11:11)", "");
L.push("| # | Scene | Start | End | Length |", "|---|---|---|---|---|");
S.scenes.forEach((sc, i) => { const [a, b] = T.scenes[i]; L.push(`| ${i + 1} | ${sc.title === "সূচনা" ? "সূচনা (hook)" : sc.title} — \`${sc.id}\` | ${ts(a)} | ${ts(b)} | ${(b - a).toFixed(1)} s |`); });
L.push("");

L.push("## 2. Scene-by-scene detail", "");
S.scenes.forEach((sc, i) => {
  const [a, b] = T.scenes[i], p = PLAN[sc.id];
  L.push(`### ${i + 1}. ${sc.title} (${ts(a)} – ${ts(b)})`, "");
  L.push("**Narration (measured times)**", "");
  L.push("| Time | Spoken text |", "|---|---|");
  sc.cues.forEach((c) => { const [x] = T.cues[ci++]; L.push(`| ${ts(x)} | ${c.h ? "*(heading)* " : ""}${strip(c.t)} |`); });
  L.push("");
  L.push(`- **Visuals:** ${p.visual}`);
  L.push(`- **Animation and camera:** ${p.motion}`);
  L.push(`- **On-screen text:** ${p.text}`);
  L.push(`- **Equations and diagrams:** ${p.math}`);
  L.push(`- **Transition to the next scene:** ${p.transition}`);
  L.push(`- **Visual-generation prompt:** _${p.prompt}_`, "");
});

L.push("## 3. Visual style guide", "");
L.push("**Palette**", "");
L.push("| Role | Colour |", "|---|---|");
L.push("| Background | Deep navy to black: #030712 → #071028, radial highlight #10245a |");
L.push("| Primary accent (qubits, \\|0⟩, constructive) | Cyan #22d3ee |");
L.push("| Second accent (\\|1⟩, entanglement links) | Violet #a78bfa |");
L.push("| State vectors, H gate, destructive interference | Magenta #f472b6 |");
L.push("| Correct / success | Green #34d399 |");
L.push("| Misconception and caveat boxes | Amber #fbbf24 |");
L.push("| Text | #e8f0ff, secondary text #9db0d6 |");
L.push("");
L.push("**Typography**");
L.push("- Bengali: Noto Sans Bengali (600/700 for headings).");
L.push("- Latin and scientific terms: Inter.");
L.push("- Code: JetBrains Mono.");
L.push("- Equations: KaTeX (Computer Modern style).");
L.push("- Minimum size: 22 px for on-screen notes and 38 px for subtitles at 1080p.");
L.push("");
L.push("**Language rules**");
L.push("- Bengali carries the explanations.");
L.push("- English is used for standard terms, in a smaller secondary weight: qubit, Bloch sphere, Born rule, CNOT, Qiskit.");
L.push("- Mathematical symbols and code stay in their standard form.");
L.push("");
L.push("**Layout**");
L.push("- Chrome: the series name sits top-left and the current section top-right.");
L.push("- Each section opens with a full-screen numbered card while the heading is spoken.");
L.push("- Content sits between y = 130 and y = 900; the subtitle band sits at the bottom.");
L.push("");
L.push("**Motion**");
L.push("- Elements fade in and rise 20 px over 0.7 s, starting on the sentence that introduces them.");
L.push("- Scenes cross-fade over 0.6–0.7 s.");
L.push("- Continuous motion is slow: Bloch camera ±7°, cloud ~10°/s, particles drifting upward.");
L.push("- No fast cuts, no shake.");
L.push("");
L.push("**Scientific imagery**");
L.push("- Superposition is shown as amplitudes and state vectors, never as an object physically in two places.");
L.push("- Measurement always shows two possible outcomes and statistics over many shots.");
L.push("- Illustrative data is labelled as such.", "");

L.push("## 4. Editing and audio-synchronisation instructions", "");
L.push("1. **Main track:** use `output/voiceover.mp3` unchanged, with no time-stretch, trims, gain riding, EQ or noise reduction. The film starts at 0:00.0 with the first word and ends at 11:11.8 with the last.");
L.push("2. **Cue sheet:** place visuals from the narration table above, or import `output/quantum_chapter01_subtitles_bn.srt`, which carries the same times.");
L.push("   - Reveal each element on the sentence that introduces it.");
L.push("   - Section cards cover the spoken heading.");
L.push("3. **Music bed:** keep it 24 dB below the narration's speech level, ducking a further 6 dB under speech (`tools/make_audio.py`). No music stingers over words.");
L.push("4. **Sound effects:** use soft whooshes at scene changes only, at least 20 dB under the voice, and a quiet chime at the close.");
L.push("5. **Mix target:** voice peaks are untouched (the mix only lowers everything if the sum would clip). Check intelligibility on laptop speakers and headphones.");
L.push("6. **Re-rendering:** after any change to the visuals, run:");
L.push("   ```bash");
L.push("   node tools/timing.mjs --voice output/voiceover.mp3");
L.push("   node tools/make_srt.mjs && node tools/check.mjs");
L.push("   python3 tools/make_audio.py --voice output/voiceover_48k.wav");
L.push("   node tools/render.mjs");
L.push("   ```", "");

L.push("## 5. Quality-control checklist", "");
const QC = [
  ["Scientific accuracy", [
    "|0⟩, |1⟩, α|0⟩ + β|1⟩ and |α|² + |β|² = 1 are shown exactly as narrated.",
    "Born-rule example: |√3/2|² = 3/4 and |i/2|² = 1/4, giving 75% / 25%, and 3/4 + 1/4 = 1.",
    "|+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2. H|0⟩ = |+⟩ and H|1⟩ = |−⟩.",
    "X, Z and H matrices are correct. Z|1⟩ = −|1⟩.",
    "CNOT truth table on |control target⟩: 10 → 11 and 11 → 10.",
    "HH|0⟩ path amplitudes: ½ + ½ = 1 for |0⟩ and ½ − ½ = 0 for |1⟩, so HH = I.",
    "Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. The ideal outcome is 0.5 / 0 / 0 / 0.5. The hardware-noise chart is labelled as illustrative.",
    "Bloch sphere: |0⟩ north, |1⟩ south, |±⟩ on the equator. The parametrisation is cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩. X and H are drawn as 180° rotations about the correct axes.",
    "No claims beyond the narration:",
    "  - superposition is shown as amplitudes, not two hidden answers;",
    "  - measurement shows random outcomes plus statistics;",
    "  - entanglement carries no faster-than-light messaging;",
    "  - quantum computers are not faster at everything.",
    "Qiskit code is valid for Qiskit 1.x/2.x: `QuantumCircuit(2)`, `h(0)`, `cx(0, 1)`, `Statevector(qc).probabilities_dict(decimals=3)` → `{'00': 0.5, '11': 0.5}`.",
  ]],
  ["Bengali text rendering", [
    "Conjuncts render in Noto Sans Bengali. র‍্য uses ZWJ (ব্র‍্যাকেট); `tools/check.mjs` enforces this.",
    "Subtitles have at most 66 letters per line and no overlaps; checked by `tools/check.mjs`.",
    "No tofu (□) glyphs in any still: review stills at each scene end.",
  ]],
  ["Audio synchronisation", [
    "Video length equals the voice-over (671.8 s); checked by `tools/check.mjs`.",
    "Each reveal falls on its sentence. Spot-check: the four two-qubit kets light up at 6:24.6, 6:25.9, 6:27.2 and 6:28.3.",
    "Section cards appear during the spoken headings.",
    "Music never masks speech (24 dB below).",
  ]],
  ["Visual consistency", [
    "One palette, one type system, the same chrome on every scene.",
    "Scenes vary (diagram, equation, 3D sphere, circuit, code, chart) with no repeated layout in consecutive scenes.",
    "Nothing touches the subtitle band. Equations are at least 34 px.",
  ]],
];
for (const [h, items] of QC) {
  L.push(`**${h}**`, "");
  for (const x of items) L.push(x.startsWith("  - ") ? `  ${x}` : `- [x] ${x}`);
  L.push("");
}

writeFileSync(join(ROOT, "quantum_chapter01_production_plan.md"), L.join("\n") + "\n");
console.log("wrote quantum_chapter01_production_plan.md");
