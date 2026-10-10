// Single source of truth for timing, narration and subtitles.
// Loaded by src/index.html (window.SCRIPT) and by tools/make_srt.mjs (via node:vm).
//
// Each scene carries a `basis` tag shown on screen:
//   "verified"     – the scene states facts checked against the Sonicium Entropy
//                    repository (API controller, SDK READMEs, research docs).
//   "illustrative" – the scene is a conceptual diagram, not a product claim.
//
// Times are in seconds. Scene start/end and cue start/end follow the
// voice-over. `design` (per scene) and the 4th cue element are the times the
// scene animations were authored against; animate.js time-warps between the
// two so every animated beat lands on its spoken line.
(function (root) {
  const SCRIPT = {
    fps: 30,
    duration: 128,
    // Timed to the ElevenLabs voice-over (125.8 s); see storyboard.md.
    voiceover: "output/voiceover.mp3",
    scenes: [
      {
        id: "challenge",
        start: 0.0,
        end: 11.08,
        design: [0, 10],
        basis: "illustrative",
        title: "ডেটা সেন্টারের নিরাপত্তা: বহুস্তরের দায়িত্ব",
        cues: [
          [0.00, 4.24, "আধুনিক ডেটা সেন্টারে প্রতি মুহূর্তে অসংখ্য এনক্রিপ্টেড সংযোগ চলে।", 0.6],
          [4.29, 11.06, "এই নিরাপত্তা নির্ভর করে ক্রিপ্টোগ্রাফি, অ্যাক্সেস কন্ট্রোল, কী ম্যানেজমেন্ট ও নিরাপদ বাস্তবায়নের ওপর।", 5.0],
        ],
      },
      {
        id: "why",
        start: 11.08,
        end: 29.31,
        design: [10, 21],
        basis: "illustrative",
        title: "কেন র‍্যান্ডমনেস গুরুত্বপূর্ণ",
        cues: [
          [11.38, 19.88, "ক্রিপ্টোগ্রাফিক কী, সেশন টোকেন, ননস ও চ্যালেঞ্জ — সবকিছুর ভিত্তি অনুমান-অযোগ্য র‍্যান্ডম মান।", 10.4],
          [19.93, 29.29, "র‍্যান্ডমনেস দুর্বল বা অনুমানযোগ্য হলে, শক্তিশালী অ্যালগরিদমও ঝুঁকিতে পড়তে পারে।", 15.6],
        ],
      },
      {
        id: "intro",
        start: 29.31,
        end: 46.19,
        design: [21, 32],
        basis: "verified",
        title: "পরিচিতি: Sonicium Entropy",
        cues: [
          [29.61, 37.08, "Sonicium Entropy একটি কোয়ান্টাম-র‍্যান্ডমনেস API — প্রমাণীকৃত অনুরোধের মাধ্যমে সফটওয়্যারে র‍্যান্ডম ডেটা সরবরাহ করে।", 21.4],
          [37.13, 46.17, "কোয়ান্টাম হার্ডওয়্যারের এনট্রপি দিয়ে NIST SP 800-90A DRBG সিড করা হয়; প্রতিটি API কী-তে Q63 অথবা Q135 রেজিস্টার নির্দিষ্ট থাকে।", 26.4],
        ],
      },
      {
        id: "api",
        start: 46.19,
        end: 72.68,
        design: [32, 50],
        basis: "verified",
        title: "লাইভ API ইন্টিগ্রেশন",
        cues: [
          [46.49, 56.70, "১. অনুমোদিত অ্যাপ্লিকেশন HTTPS-এর মাধ্যমে /v1/random এন্ডপয়েন্টে অনুরোধ পাঠায়।", 32.4],
          [56.75, 59.58, "২. API, Authorization হেডারের Bearer API কী যাচাই করে।", 37.0],
          [59.62, 67.32, "৩. সার্ভিস hex বা base64 ফরম্যাটে র‍্যান্ডম ডেটা ও তার উৎস-তথ্য ফেরত দেয়।", 41.5],
          [67.37, 72.66, "৪. অ্যাপ্লিকেশন দৈর্ঘ্য, ফরম্যাট ও হেলথ-চেক যাচাই করে তবেই ডেটা ব্যবহার করে।", 46.0],
        ],
      },
      {
        id: "usecases",
        start: 72.68,
        end: 90.72,
        design: [50, 61],
        basis: "illustrative",
        title: "ডেটা সেন্টারে সম্ভাব্য ব্যবহার",
        cues: [
          [72.98, 80.98, "সম্ভাব্য ব্যবহার: কী জেনারেশন, সেশন টোকেন ও ননস, চ্যালেঞ্জ-রেসপন্স এবং নিয়ন্ত্রিত সিকিউরিটি টেস্টিং।", 50.4],
          [81.03, 90.70, "মনে রাখুন: Sonicium Entropy র‍্যান্ডম ডেটা সরবরাহ করে — এটি পুরো ডেটা সেন্টার এনক্রিপ্ট করে না, ফায়ারওয়াল, HSM বা KMS-এর বিকল্পও নয়।", 55.4],
        ],
      },
      {
        id: "layers",
        start: 90.72,
        end: 105.13,
        design: [61, 70],
        basis: "illustrative",
        title: "স্তরভিত্তিক নিরাপত্তায় Sonicium Entropy",
        cues: [
          [91.02, 97.99, "সঠিক উৎসের র‍্যান্ডমনেস ক্রিপ্টোগ্রাফিক ওয়ার্কফ্লোর র‍্যান্ডমনেস-অংশকে শক্তিশালী করতে পারে।", 61.4],
          [98.04, 105.11, "তবে সামগ্রিক ঝুঁকি কমানো নির্ভর করে ইন্টিগ্রেশন, এনট্রপি যাচাই, কী সুরক্ষা, অ্যাক্সেস কন্ট্রোল ও অপারেশনাল নিরাপত্তার ওপর।", 65.4],
        ],
      },
      {
        id: "workflow",
        start: 105.13,
        end: 118.37,
        design: [70, 80],
        basis: "verified",
        title: "এন্টারপ্রাইজ ইন্টিগ্রেশন ওয়ার্কফ্লো",
        cues: [
          [105.43, 111.81, "এন্টারপ্রাইজ ইন্টিগ্রেশনে: TLS, সিক্রেট ম্যানেজারে API কী, ন্যূনতম-অধিকার নীতি ও নির্দিষ্ট টাইমআউট।", 70.4],
          [111.86, 118.35, "রেট-লিমিটে Retry-After মেনে নিরাপদ রিট্রাই, রেসপন্স যাচাই, আর গোপন তথ্যহীন অডিট লগ।", 75.0],
        ],
      },
      {
        id: "closing",
        start: 118.37,
        end: 128.0,
        design: [80, 88],
        basis: "brand",
        title: "Sonicium Entropy",
        cues: [
          [118.67, 126.16, "ডেটা সেন্টার ও ক্লাউড প্রোভাইডারদের জন্য — ইন্টিগ্রেশন ও পাইলট সম্ভাবনা জানতে ভিজিট করুন soniciumentropy.com", 80.6],
        ],
      },
    ],
  };
  root.SCRIPT = SCRIPT;
  if (typeof module !== "undefined") module.exports = SCRIPT;
})(typeof window !== "undefined" ? window : globalThis);
