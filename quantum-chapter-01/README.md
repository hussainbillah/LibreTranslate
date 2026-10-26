# কোয়ান্টাম পাঠমালা — অধ্যায় ১: কিউবিট, সুপারপজিশন ও পরিমাপ

A Bengali educational video for Chapter 01 of the quantum computing book, built on the supplied ElevenLabs voice-over (11:11.8). The voice-over is the main audio track and was not shortened, rewritten, regenerated or replaced.

HTML/SVG/KaTeX scenes are rendered frame by frame in headless Chromium and encoded with ffmpeg.

| Deliverable | Path |
|---|---|
| Final video, 1920×1080, 30 fps, H.264 + AAC, 11:11.8 | `output/quantum_chapter01_qubits_superposition_measurement.mp4` |
| Production plan | `quantum_chapter01_production_plan.md` |
| Bengali subtitles (measured times) | `output/quantum_chapter01_subtitles_bn.srt` |
| Original voice-over (unchanged) | `output/voiceover.mp3` |

The production plan covers:
- the scene-by-scene timeline with measured narration times;
- visuals, animation and camera, on-screen text and equations, and transitions for each scene;
- AI visual-generation prompts;
- a style guide;
- editing and sync instructions;
- a QC checklist.

## How the timing was obtained

Timing comes from the recording itself, not from an estimated reading speed.

1. `tools/timing.mjs --voice output/voiceover.mp3` finds the 233 speech blocks with ffmpeg `silencedetect`.
2. A dynamic-programming alignment assigns them, in order, to the 138 spoken sentences and headings in `src/script.js`, using:
   - each sentence's spoken length, with Bengali digits read as words;
   - the depth of the pauses;
   - the recording's long pauses before section headings, which are read about 1.6× slower.
3. Three sentence starts were read off the pause map by hand and pinned with `at:` in `src/script.js`:
   - 0:08.1 "কল্পনা করুন…";
   - 0:40.1 "স্বাগতম…";
   - 6:21.3, the four spoken kets |00⟩ … |11⟩.

No speech recogniser was available in the build environment, so the alignment works at sentence level. Where the narrator runs a heading straight into the next sentence without a pause, the boundary can be one short phrase early or late. Equations and visual reveals are tied to sentence starts, so this does not move anything on screen by more than a phrase.

## Scientific content

- The notation follows the narration: |0⟩, |1⟩, α|0⟩ + β|1⟩, |α|² + |β|² = 1, |+⟩, |−⟩, |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.
- Superposition is shown as amplitudes and state vectors, not as an object in two places at once.
- Measurement is shown as one random outcome per shot, with statistics over many shots (1,000 simulated shots, 75% : 25%).
- The Bloch sphere shows X and H as 180° rotations about x and (x + z)/√2.
- The interference scene derives HH|0⟩ = |0⟩ from path amplitudes (½ + ½ = 1, ½ − ½ = 0).
- The Qiskit code on screen runs as shown on Qiskit 1.x/2.x and prints `{'00': 0.5, '11': 0.5}`.
- The real-hardware histogram is labelled as an illustrative example, not measured data.
- `tools/check.mjs` fails the build in these cases:
  - on-screen text asserts a misconception the chapter warns about (faster-than-light messaging, "faster at everything", reading all answers at once);
  - Bengali র‍্য is spelled without ZWJ;
  - subtitles overlap or run too fast;
  - the video length differs from the voice-over.

## Project structure

```
src/index.html, style.css, animate.js   22 scenes, deterministic animation engine (Bloch sphere, circuits, charts)
src/script.js                          the narration, one cue per spoken sentence/heading, grouped into scenes
src/timing.js                          generated: scene bounds, cue times, subtitle chunks (measured)
src/vendor/katex/                      KaTeX 0.16.11 for equations (MIT licence, local copy)
src/fonts/                             Noto Sans Bengali, Inter, JetBrains Mono (SIL OFL)
tools/timing.mjs                       voice-over alignment
tools/make_srt.mjs                     subtitles
tools/make_audio.py                    soundtrack: voice untouched + music bed 24 dB below speech
tools/make_plan.mjs                    production plan from the script, timing and scene direction
tools/check.mjs                        claim, spelling, subtitle and duration checks
tools/render.mjs                       full render, or --stills t1,t2 for review PNGs
```

## Build

```bash
node tools/timing.mjs --voice output/voiceover.mp3
node tools/make_srt.mjs && node tools/check.mjs && node tools/make_plan.mjs
ffmpeg -y -i output/voiceover.mp3 -ar 48000 -ac 1 output/voiceover_48k.wav
python3 tools/make_audio.py --voice output/voiceover_48k.wav
node tools/render.mjs                    # about 20 minutes
```

Dependencies:
- Node 20+ with Playwright and Chromium
- ffmpeg (libx264, AAC)
- Python 3 with numpy
