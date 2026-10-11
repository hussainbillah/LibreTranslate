# Sonicium Entropy: investor presentation film (Bengali)

A data-driven investor film for Sonicium Entropy (Sonicium Quantum Lab Ltd.). HTML/SVG scenes are rendered frame by frame in headless Chromium and encoded with ffmpeg. Every chart reads its numbers from an editable JSON model.

| Deliverable | Path | Status |
|---|---|---|
| Final video, 1920×1080, 30 fps | `output/sonicium_entropy_investor_video.mp4` | Rendered with **estimated** timing and music. Re-render once the voice-over is recorded (see below). |
| Bengali narration | `output/sonicium_entropy_voiceover_bn.wav` | **Not yet produced.** No Bengali TTS voice is reachable from this build environment. It is created from your recording with the steps below. |
| Bengali subtitles | `output/sonicium_entropy_subtitles_bn.srt` | Generated from `src/timing.js` and regenerated after alignment |
| Storyboard and timing | `sonicium_entropy_investor_storyboard.md` | |
| Market research, sources, methodology | `sonicium_entropy_market_research.md` | |
| Editable model: market data, prices, scenarios, targets | `sonicium_entropy_financial_model.json` | |
| Narration script | `voiceover-script-bn.txt` | |

## Project structure

```
src/index.html, style.css, animate.js   scenes, styling, animation engine and data-driven charts
src/script.js                          narration sentences grouped into the 8 scenes
src/timing.js                          generated: length, scene bounds, cue times, subtitle chunks
src/data.js                            generated: every derived number on screen
src/assets/                            SQL logo (soniciumquantumlab.com), Natural Earth map data
src/fonts/                             Noto Sans Bengali, Inter, JetBrains Mono (SIL OFL)
tools/build_data.mjs                   financial model JSON → src/data.js
tools/timing.mjs                       timing (estimate, or --voice to align to a recording)
tools/make_audio.py                    music, and the voice mix with ducking (--voice)
tools/make_srt.mjs, check.mjs          subtitles; credential, claim and spelling checks
tools/render.mjs                       full render, or --stills t1,t2 for review PNGs
```

## Build

```bash
node tools/build_data.mjs            # after editing sonicium_entropy_financial_model.json
node tools/timing.mjs                # estimated timing, or: --voice output/voiceover.mp3
node tools/make_srt.mjs
node tools/check.mjs
python3 tools/make_audio.py          # music only, or: --voice output/voiceover.mp3
node tools/render.mjs                # ~17 min for a ~6 min film
```

Dependencies: Node 20+ with Playwright and Chromium, ffmpeg (libx264 and AAC), and Python 3 with numpy.

## Adding the voice-over (as with the government briefing)

1. Generate the narration from `voiceover-script-bn.txt` in ElevenLabs. Include the title line, and leave natural pauses between sentences.
2. Save it as `output/voiceover.mp3`, then run:
   ```bash
   node tools/timing.mjs --voice output/voiceover.mp3     # aligns all 44 sentences and reports any outliers
   node tools/make_srt.mjs && node tools/check.mjs
   python3 tools/make_audio.py --voice output/voiceover.mp3
   ffmpeg -i output/voiceover.mp3 -ar 48000 output/sonicium_entropy_voiceover_bn.wav
   node tools/render.mjs
   ```

Scene lengths and every reveal follow the recording automatically.

## Updating numbers

Change a forecast, a price, a SAM share or a scenario assumption in `sonicium_entropy_financial_model.json`, then run `node tools/build_data.mjs` and re-render. Nothing else needs editing.

## Integrity rules followed

- **Sources are kept separate:** third-party forecasts, verified product facts and our own assumptions are each labelled on screen and in the research file.
- **No unsupported throughput claims:** the requested "10,000 req/s" and "18 GB/s" claims are not shown. The repository does not support them; see the research file, §7.
- **No fabricated business facts:** there are no customers, contracts, investor logos, certifications, funding amounts or valuations, and no "world's first" or "market leader" claims.
- **No credentials:** the only API key shown is `YOUR_API_KEY`.
