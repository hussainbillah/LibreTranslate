# Sonicium Quantum Lab and Sonicium Entropy: Bengali government briefing

An institutional video, 6:54 long and timed to its ElevenLabs Bengali voice-over, for the Government of Bangladesh (Ministry of Posts, Telecommunications and IT, and the relevant ICT, cybersecurity and research authorities). It introduces Sonicium Quantum Lab and Sonicium Entropy, explains how the technology works, and puts forward a phased pilot proposal. It is rendered from code: HTML/CSS/SVG scenes are captured frame by frame in headless Chromium, then encoded with ffmpeg.

| Deliverable | Path |
|---|---|
| Final video (1920×1080, 30 fps, H.264 + AAC, 414.4 s, with voice-over) | `output/sonicium-bangladesh-briefing-bn.mp4` |
| Bengali subtitles | `output/sonicium-bangladesh-briefing-bn.srt` |
| Voice-over and its script | `output/voiceover.mp3`, `voiceover-script-bn.txt` |
| Storyboard, timing and verification log | `storyboard.md` |
| Scenes (editable) | `src/index.html`, `src/style.css`, `src/animate.js` |
| Narration sentences grouped into scenes | `src/script.js` |
| Length, scene bounds, cue times and subtitle chunks (generated) | `src/timing.js` |
| Assets | `src/assets/sql-logo.png` (official SQL logo, cropped from soniciumquantumlab.com `public/og-image.png`), `src/assets/map.js` (Natural Earth, public domain), `src/fonts/` (Noto Sans Bengali, Inter, JetBrains Mono; SIL OFL) |

## Build

```bash
node tools/timing.mjs --voice output/voiceover.mp3   # timing measured from the voice-over
node tools/make_srt.mjs               # .srt from the same timings
node tools/check.mjs                  # credential, claims, spelling and cue checks
python3 tools/make_audio.py --voice output/voiceover.mp3   # voice + music ducked underneath
node tools/render.mjs                 # full render, ~20 min
node tools/render.mjs --stills 30,90,140   # review PNGs in output/stills/
```

Dependencies: Node 20+ with Playwright and Chromium (`CHROMIUM_PATH` overrides the browser), ffmpeg (libx264 and AAC), and Python 3 with numpy. `tools/build_map.mjs` regenerates the map data. It needs `world-atlas`, `topojson-client` and `d3-geo`, installed under `tools/`. Its output is committed, so you only need it if you change the map.

To preview in a browser, open `src/index.html?play`, or `?t=95` to view a single frame.

## Voice-over and timing

The narration is the ElevenLabs recording `output/voiceover.mp3` (409.9 s) of `voiceover-script-bn.txt`. The video length and every scene bound come from the recording. Nothing is fixed in seconds:

- `src/script.js` holds the script's 56 sentences, one cue each, grouped into nine scenes.
- `tools/timing.mjs --voice` finds the speech blocks with ffmpeg silencedetect and aligns them to the sentences in order, using length and pause depth. It writes the cue times, the scene bounds (each scene starts just before its first sentence), the total length (the voice plus a 4.5 s musical tail), and subtitle chunks. Long sentences are split near the middle, preferring a comma or a dash.
- Every reveal and highlight is anchored to a cue (for example `data-in="c2+0.5"`), so the visuals follow the voice.

To change the narration, edit `voiceover-script-bn.txt` and the matching sentences in `src/script.js`, record the new voice-over as `output/voiceover.mp3`, and re-run the build steps above. `timing.mjs` reports any sentence whose measured length looks wrong for its text.

## Integrity rules this video follows

- **Labels:** every scene is labelled as verified, actual test result, illustrative, or proposal. Generated visuals are never presented as real footage or hardware. The processor die says so explicitly on screen.
- **No credentials:** the only key that appears is the fictional placeholder `YOUR_API_KEY`. `tools/check.mjs` fails the build on anything key-shaped.
- **Workflow matches the implementation:** the API serves NIST SP 800-90A DRBG output seeded from health-tested quantum bits, not raw measurement bits.
- **Statistical results stay in context:** the SP 800-22 result is shown with its own report's caveats. It validates the DRBG, does not prove the source's entropy, and is not a certification.
- **Quantum randomness is not presented as a replacement:** it does not replace post-quantum cryptography, HSMs, KMS or encryption. The video states that the two are different technologies.
- **No unverified claims:** there are no endorsements, partnerships, certifications, awards, deployments, revenue or job figures, and no "first in Bangladesh" claims. The hardware is described honestly as accessed through the cloud.
