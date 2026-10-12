// Narration for both language versions, one cue per sentence, grouped into
// the eight storyboard scenes. Timing per language lives in
// src/timing.<lang>.js (tools/timing.mjs --lang en|bn [--voice file]).
//
// The English narration condenses the brief's script to fit under five
// minutes; the Bengali narration is its translation. API details follow the
// Sonicium Entropy implementation (see sonicium_entropy_api_demo.md).
(function (root) {
  const SCRIPT = {
    fps: 30,
    langs: ["en", "bn"],
    scenes: [
      {
        id: "intro", basis: "illustrative",
        cues: {
          en: [
            "Modern online gaming platforms depend on reliable software, efficient infrastructure and well-designed systems for generating random outcomes.",
            "As platforms grow, operators keep evaluating technologies that strengthen their infrastructure and create room for differentiation.",
            "Sonicium Entropy, a technology initiative from Sonicium Quantum Lab Limited, offers API-based access to quantum-randomness data.",
            "In the next few minutes, we will show how a casino platform can evaluate it, connect to it, test it and assess its business value.",
          ],
          bn: [
            "আধুনিক অনলাইন গেমিং প্ল্যাটফর্ম নির্ভর করে নির্ভরযোগ্য সফটওয়্যার, দক্ষ অবকাঠামো এবং র‍্যান্ডম ফলাফল তৈরির সুপরিকল্পিত ব্যবস্থার ওপর।",
            "প্ল্যাটফর্ম যত বড় হয়, অপারেটররা তত নতুন প্রযুক্তি যাচাই করেন — যা অবকাঠামোকে শক্তিশালী করে এবং স্বতন্ত্র হওয়ার সুযোগ তৈরি করে।",
            "Sonicium Quantum Lab Limited-এর প্রযুক্তি উদ্যোগ Sonicium Entropy, API-এর মাধ্যমে কোয়ান্টাম-র‍্যান্ডমনেস ডেটা ব্যবহারের সুযোগ দেয়।",
            "পরবর্তী কয়েক মিনিটে আমরা দেখাব, একটি ক্যাসিনো প্ল্যাটফর্ম কীভাবে এটি যাচাই, সংযুক্ত ও পরীক্ষা করতে পারে এবং এর ব্যবসায়িক মূল্য নিরূপণ করতে পারে।",
          ],
        },
      },
      {
        id: "understand", basis: "verified",
        cues: {
          en: [
            "Quantum measurement is a physical process that can serve as a source of randomness.",
            "Sonicium Entropy measures superconducting quantum processors, health-tests the results, and uses them to seed a standards-based random bit generator.",
            "The output is delivered through one documented endpoint, with source details included in every response.",
            "For a casino platform, the real question is where this capability fits in the existing architecture, and what measurable value it adds.",
          ],
          bn: [
            "কোয়ান্টাম পরিমাপ একটি ভৌত প্রক্রিয়া, যা র‍্যান্ডমনেসের উৎস হিসেবে কাজ করতে পারে।",
            "Sonicium Entropy সুপারকন্ডাক্টিং কোয়ান্টাম প্রসেসরের পরিমাপ নেয়, ফলাফলের স্বাস্থ্য পরীক্ষা করে, এবং তা দিয়ে একটি মানসম্মত র‍্যান্ডম বিট জেনারেটর সিড করে।",
            "আউটপুট সরবরাহ হয় একটি ডকুমেন্টেড এন্ডপয়েন্টের মাধ্যমে, আর প্রতিটি রেসপন্সে থাকে উৎস-সংক্রান্ত তথ্য।",
            "একটি ক্যাসিনো প্ল্যাটফর্মের জন্য আসল প্রশ্ন হলো, বিদ্যমান স্থাপত্যে এটি কোথায় খাপ খায় এবং কী পরিমাপযোগ্য মূল্য যোগ করে।",
          ],
        },
      },
      {
        id: "usage", basis: "illustrative",
        cues: {
          en: [
            "Integration starts with the specific component that needs random data.",
            "Game engines, account systems, transactions and monitoring tools have different requirements, so Sonicium Entropy should be evaluated at one appropriate backend integration point, not connected everywhere.",
            "A controlled test application sends authenticated requests and measures latency, throughput, availability, error handling, format compatibility and cost.",
            "For live wagering, any change must also respect the game's approved outcome-generation design, the applicable regulations and independent testing requirements.",
          ],
          bn: [
            "সংযুক্তি শুরু হয় সেই নির্দিষ্ট অংশ থেকে, যার র‍্যান্ডম ডেটা প্রয়োজন।",
            "গেম ইঞ্জিন, অ্যাকাউন্ট সিস্টেম, লেনদেন ও মনিটরিং টুলের চাহিদা আলাদা; তাই Sonicium Entropy যাচাই করা উচিত একটি উপযুক্ত ব্যাকএন্ড সংযুক্তি-বিন্দুতে, সবখানে নয়।",
            "একটি নিয়ন্ত্রিত টেস্ট অ্যাপ্লিকেশন প্রমাণীকৃত অনুরোধ পাঠায় এবং ল্যাটেন্সি, থ্রুপুট, প্রাপ্যতা, ত্রুটি ব্যবস্থাপনা, ফরম্যাট সামঞ্জস্য ও খরচ পরিমাপ করে।",
            "লাইভ ওয়েজারিংয়ের ক্ষেত্রে যেকোনো পরিবর্তনকে গেমের অনুমোদিত ফলাফল-নকশা, প্রযোজ্য বিধিমালা এবং স্বাধীন পরীক্ষার শর্ত মেনে চলতে হবে।",
          ],
        },
      },
      {
        id: "api", basis: "verified",
        cues: {
          en: [
            "Connecting starts with API access: an account, a service tier and its usage limits.",
            "The platform receives an API key, which is stored server-side, in a secret manager or protected environment variable, and never in a browser, mobile app or public repository.",
            "The backend calls GET slash v1 slash random, sending the key as a Bearer token in the Authorization header, with the length and format it needs.",
            "The response returns the random data in hex or base64, along with its length, format, register and the time it was served.",
            "Errors are explicit: 401 for an invalid key, 429 with a Retry-After header for rate limits, and 503 while the entropy pool refills, so the client can back off and retry safely.",
            "Usage is tracked per key, and can be exported as a signed record for audit.",
          ],
          bn: [
            "সংযুক্তির প্রথম ধাপ API অ্যাক্সেস: একটি অ্যাকাউন্ট, সার্ভিস টিয়ার এবং তার ব্যবহার-সীমা।",
            "প্ল্যাটফর্ম একটি API key পায়, যা সার্ভারে — সিক্রেট ম্যানেজার বা সুরক্ষিত এনভায়রনমেন্ট ভেরিয়েবলে — রাখা হয়; কখনো ব্রাউজার, মোবাইল অ্যাপ বা পাবলিক রিপোজিটরিতে নয়।",
            "ব্যাকএন্ড GET /v1/random-এ অনুরোধ পাঠায়, Authorization হেডারে Bearer টোকেন হিসেবে key দিয়ে, প্রয়োজনীয় length ও format উল্লেখ করে।",
            "রেসপন্সে আসে hex বা base64 ফরম্যাটে র‍্যান্ডম ডেটা, সঙ্গে length, format, register এবং সরবরাহের সময়।",
            "ত্রুটিগুলো স্পষ্ট: অবৈধ key হলে 401, রেট লিমিটে Retry-After হেডারসহ 429, আর এন্ট্রপি পুল পূরণের সময় 503 — ফলে ক্লায়েন্ট নিরাপদে অপেক্ষা করে আবার চেষ্টা করতে পারে।",
            "প্রতিটি key-এর ব্যবহার আলাদাভাবে দেখা যায় এবং অডিটের জন্য স্বাক্ষরিত রেকর্ড হিসেবে এক্সপোর্ট করা যায়।",
          ],
        },
      },
      {
        id: "value", basis: "tobemeasured",
        cues: {
          en: [
            "The commercial value depends on how the platform uses the service and on the benefits it can measure.",
            "The most useful evaluation compares the current randomness setup with the proposed integration: engineering hours, integration cost, cost per million requests, latency, error rates and operating cost.",
            "To be clear, quantum randomness does not increase a casino's revenue or change the mathematical edge of its games.",
            "The business case rests on measurable infrastructure value, suitable applications and a commercially viable service agreement.",
          ],
          bn: [
            "বাণিজ্যিক মূল্য নির্ভর করে প্ল্যাটফর্ম সেবাটি কীভাবে ব্যবহার করে এবং কোন সুবিধা পরিমাপ করতে পারে তার ওপর।",
            "সবচেয়ে কার্যকর মূল্যায়ন হলো বর্তমান র‍্যান্ডমনেস ব্যবস্থার সঙ্গে প্রস্তাবিত সংযুক্তির তুলনা: ইঞ্জিনিয়ারিং ঘণ্টা, সংযুক্তির খরচ, প্রতি মিলিয়ন অনুরোধের খরচ, ল্যাটেন্সি, ত্রুটির হার এবং পরিচালন ব্যয়।",
            "স্পষ্ট করে বলা দরকার: কোয়ান্টাম র‍্যান্ডমনেস ক্যাসিনোর আয় বাড়ায় না, গেমের গাণিতিক সুবিধাও বদলায় না।",
            "ব্যবসায়িক যুক্তি দাঁড়ায় পরিমাপযোগ্য অবকাঠামোগত মূল্য, উপযুক্ত প্রয়োগ এবং বাণিজ্যিকভাবে টেকসই সার্ভিস চুক্তির ওপর।",
          ],
        },
      },
      {
        id: "roi", basis: "scenario",
        cues: {
          en: [
            "Consider an illustrative example: ten million requests a month, a hypothetical service fee of five hundred dollars, and two thousand dollars to integrate.",
            "With one hundred dollars a month in operating costs, the first-year total is nine thousand two hundred dollars, or about seventy-seven dollars per million requests.",
            "If the platform independently verifies one thousand dollars a month in benefits, the illustrative first-year return is about thirty percent.",
            "These figures show the method only. They are not Sonicium Entropy prices, customer results or guaranteed returns.",
          ],
          bn: [
            "একটি দৃষ্টান্তমূলক উদাহরণ ধরা যাক: মাসে এক কোটি অনুরোধ, কাল্পনিক মাসিক ফি পাঁচশো ডলার, আর সংযুক্তির খরচ দুই হাজার ডলার।",
            "মাসে একশো ডলার পরিচালন ব্যয় যোগ করলে প্রথম বছরের মোট খরচ নয় হাজার দুইশো ডলার, অর্থাৎ প্রতি মিলিয়ন অনুরোধে প্রায় সাতাত্তর ডলার।",
            "প্ল্যাটফর্ম যদি স্বাধীনভাবে মাসে এক হাজার ডলারের সুবিধা যাচাই করে, তাহলে প্রথম বছরের দৃষ্টান্তমূলক রিটার্ন প্রায় ত্রিশ শতাংশ।",
            "এই সংখ্যাগুলো শুধু হিসাবের পদ্ধতি দেখায়; এগুলো Sonicium Entropy-এর মূল্য, গ্রাহকের ফলাফল বা নিশ্চিত রিটার্ন নয়।",
          ],
        },
      },
      {
        id: "stages", basis: "illustrative",
        cues: {
          en: [
            "Evaluation works best in three stages.",
            "First, a technical proof of concept confirms connectivity, authentication, response formats and baseline performance.",
            "Second, a controlled pilot measures real workload performance, reliability, operating cost and compatibility.",
            "Third, a commercial evaluation agrees pricing, service limits, support and production requirements.",
          ],
          bn: [
            "মূল্যায়ন সবচেয়ে ভালো হয় তিনটি ধাপে।",
            "প্রথমত, একটি টেকনিক্যাল প্রুফ অব কনসেপ্ট সংযোগ, প্রমাণীকরণ, রেসপন্স ফরম্যাট ও মৌলিক পারফরম্যান্স নিশ্চিত করে।",
            "দ্বিতীয়ত, একটি নিয়ন্ত্রিত পাইলট বাস্তব ওয়ার্কলোডে পারফরম্যান্স, নির্ভরযোগ্যতা, পরিচালন ব্যয় ও সামঞ্জস্য পরিমাপ করে।",
            "তৃতীয়ত, একটি বাণিজ্যিক মূল্যায়নে মূল্য, সার্ভিস-সীমা, সহায়তা এবং প্রোডাকশনের শর্ত নির্ধারিত হয়।",
          ],
        },
      },
      {
        id: "next", basis: "brand", onscreen: [2, 3, 4],
        cues: {
          en: [
            "The next step is a focused technical discussion to define the use case, review the documentation, agree on a test workload and set the metrics that matter.",
            "We invite your technical and business teams to explore the platform and plan an evaluation together.",
            "Sonicium Entropy.",
            "Quantum randomness. API-driven integration. A new opportunity for technology collaboration.",
            "Visit soniciumentropy.com to begin the conversation.",
          ],
          bn: [
            "পরবর্তী ধাপ একটি কেন্দ্রীভূত কারিগরি আলোচনা — ব্যবহারের ক্ষেত্র নির্ধারণ, ডকুমেন্টেশন পর্যালোচনা, টেস্ট ওয়ার্কলোডে সম্মতি এবং গুরুত্বপূর্ণ মেট্রিক ঠিক করা।",
            "আপনার কারিগরি ও ব্যবসায়িক দলকে আমরা আমন্ত্রণ জানাই প্ল্যাটফর্মটি দেখতে এবং একসঙ্গে একটি মূল্যায়ন-পরিকল্পনা করতে।",
            "Sonicium Entropy।",
            "কোয়ান্টাম র‍্যান্ডমনেস। API-চালিত সংযুক্তি। প্রযুক্তি সহযোগিতার নতুন সুযোগ।",
            "কথোপকথন শুরু করতে ভিজিট করুন soniciumentropy.com।",
          ],
        },
      },
    ],
  };
  root.SCRIPT = SCRIPT;
  if (typeof module !== "undefined") module.exports = SCRIPT;
})(typeof window !== "undefined" ? window : globalThis);
