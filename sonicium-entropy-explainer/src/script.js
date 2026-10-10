// Single source of truth for timing, narration and subtitles.
// Loaded by src/index.html (window.SCRIPT) and by tools/make_srt.mjs (via node:vm).
//
// Each scene carries a `basis` tag shown on screen:
//   "verified"     – the scene states facts checked against the Sonicium Entropy
//                    repository (API controller, SDK READMEs, research docs).
//   "illustrative" – the scene is a conceptual diagram, not a product claim.
//
// Times are in seconds.
(function (root) {
  const SCRIPT = {
    fps: 30,
    duration: 88,
    scenes: [
      {
        id: "challenge",
        start: 0,
        end: 10,
        basis: "illustrative",
        title: "ডেটা সেন্টারের নিরাপত্তা: বহুস্তরের দায়িত্ব",
        cues: [
          [0.6, 5.0, "আধুনিক ডেটা সেন্টারে প্রতি মুহূর্তে অসংখ্য এনক্রিপ্টেড সংযোগ চলে।"],
          [5.0, 9.8, "এই নিরাপত্তা নির্ভর করে ক্রিপ্টোগ্রাফি, অ্যাক্সেস কন্ট্রোল, কী ম্যানেজমেন্ট ও নিরাপদ বাস্তবায়নের ওপর।"],
        ],
      },
      {
        id: "why",
        start: 10,
        end: 21,
        basis: "illustrative",
        title: "কেন র‍্যান্ডমনেস গুরুত্বপূর্ণ",
        cues: [
          [10.4, 15.6, "ক্রিপ্টোগ্রাফিক কী, সেশন টোকেন, ননস ও চ্যালেঞ্জ — সবকিছুর ভিত্তি অনুমান-অযোগ্য র‍্যান্ডম মান।"],
          [15.6, 20.8, "র‍্যান্ডমনেস দুর্বল বা অনুমানযোগ্য হলে, শক্তিশালী অ্যালগরিদমও ঝুঁকিতে পড়তে পারে।"],
        ],
      },
      {
        id: "intro",
        start: 21,
        end: 32,
        basis: "verified",
        title: "পরিচিতি: Sonicium Entropy",
        cues: [
          [21.4, 26.4, "Sonicium Entropy একটি কোয়ান্টাম-র‍্যান্ডমনেস API — প্রমাণীকৃত অনুরোধের মাধ্যমে সফটওয়্যারে র‍্যান্ডম ডেটা সরবরাহ করে।"],
          [26.4, 31.8, "কোয়ান্টাম হার্ডওয়্যারের এনট্রপি দিয়ে NIST SP 800-90A DRBG সিড করা হয়; প্রতিটি API কী-তে Q63 অথবা Q135 রেজিস্টার নির্দিষ্ট থাকে।"],
        ],
      },
      {
        id: "api",
        start: 32,
        end: 50,
        basis: "verified",
        title: "লাইভ API ইন্টিগ্রেশন",
        cues: [
          [32.4, 37.0, "১. অনুমোদিত অ্যাপ্লিকেশন HTTPS-এর মাধ্যমে /v1/random এন্ডপয়েন্টে অনুরোধ পাঠায়।"],
          [37.0, 41.5, "২. API, Authorization হেডারের Bearer API কী যাচাই করে।"],
          [41.5, 46.0, "৩. সার্ভিস hex বা base64 ফরম্যাটে র‍্যান্ডম ডেটা ও তার উৎস-তথ্য ফেরত দেয়।"],
          [46.0, 49.8, "৪. অ্যাপ্লিকেশন দৈর্ঘ্য, ফরম্যাট ও হেলথ-চেক যাচাই করে তবেই ডেটা ব্যবহার করে।"],
        ],
      },
      {
        id: "usecases",
        start: 50,
        end: 61,
        basis: "illustrative",
        title: "ডেটা সেন্টারে সম্ভাব্য ব্যবহার",
        cues: [
          [50.4, 55.4, "সম্ভাব্য ব্যবহার: কী জেনারেশন, সেশন টোকেন ও ননস, চ্যালেঞ্জ-রেসপন্স এবং নিয়ন্ত্রিত সিকিউরিটি টেস্টিং।"],
          [55.4, 60.8, "মনে রাখুন: Sonicium Entropy র‍্যান্ডম ডেটা সরবরাহ করে — এটি পুরো ডেটা সেন্টার এনক্রিপ্ট করে না, ফায়ারওয়াল, HSM বা KMS-এর বিকল্পও নয়।"],
        ],
      },
      {
        id: "layers",
        start: 61,
        end: 70,
        basis: "illustrative",
        title: "স্তরভিত্তিক নিরাপত্তায় Sonicium Entropy",
        cues: [
          [61.4, 65.4, "সঠিক উৎসের র‍্যান্ডমনেস ক্রিপ্টোগ্রাফিক ওয়ার্কফ্লোর র‍্যান্ডমনেস-অংশকে শক্তিশালী করতে পারে।"],
          [65.4, 69.8, "তবে সামগ্রিক ঝুঁকি কমানো নির্ভর করে ইন্টিগ্রেশন, এনট্রপি যাচাই, কী সুরক্ষা, অ্যাক্সেস কন্ট্রোল ও অপারেশনাল নিরাপত্তার ওপর।"],
        ],
      },
      {
        id: "workflow",
        start: 70,
        end: 80,
        basis: "verified",
        title: "এন্টারপ্রাইজ ইন্টিগ্রেশন ওয়ার্কফ্লো",
        cues: [
          [70.4, 75.0, "এন্টারপ্রাইজ ইন্টিগ্রেশনে: TLS, সিক্রেট ম্যানেজারে API কী, ন্যূনতম-অধিকার নীতি ও নির্দিষ্ট টাইমআউট।"],
          [75.0, 79.8, "রেট-লিমিটে Retry-After মেনে নিরাপদ রিট্রাই, রেসপন্স যাচাই, আর গোপন তথ্যহীন অডিট লগ।"],
        ],
      },
      {
        id: "closing",
        start: 80,
        end: 88,
        basis: "brand",
        title: "Sonicium Entropy",
        cues: [
          [80.6, 87.6, "ডেটা সেন্টার ও ক্লাউড প্রোভাইডারদের জন্য — ইন্টিগ্রেশন ও পাইলট সম্ভাবনা জানতে ভিজিট করুন soniciumentropy.com"],
        ],
      },
    ],
  };
  root.SCRIPT = SCRIPT;
  if (typeof module !== "undefined") module.exports = SCRIPT;
})(typeof window !== "undefined" ? window : globalThis);
