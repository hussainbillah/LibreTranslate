# Sonicium Quantum Lab and Sonicium Entropy: 5-minute Bengali government briefing

An institutional video, exactly 5:00 long, for the Government of Bangladesh (Ministry of Posts, Telecommunications and IT, and the relevant ICT, cybersecurity and research authorities). It introduces Sonicium Quantum Lab and Sonicium Entropy, explains how the technology works, and puts forward a phased pilot proposal. It is rendered from code: HTML/CSS/SVG scenes are captured frame by frame in headless Chromium, then encoded with ffmpeg.

| Deliverable | Path |
|---|---|
| Final video (1920×1080, 30 fps, H.264 + AAC, 300 s) | `output/sonicium-bangladesh-briefing-bn.mp4` |
| Bengali subtitles | `output/sonicium-bangladesh-briefing-bn.srt` |
| Narration script (one sentence per line, scenes separated by blank lines) | `narration-bn.txt` |
| Storyboard, timing and verification log | `storyboard.md` |
| Scenes (editable) | `src/index.html`, `src/style.css`, `src/animate.js` |
| Narration text and scene bounds | `src/script.js` |
| Cue timing (generated) | `src/timing.js` |
| Assets | `src/assets/sq-logo.png` (official logo, cropped from soniciumquantumlab.com), `src/assets/map.js` (Natural Earth, public domain), `src/fonts/` (Noto Sans Bengali, Inter, JetBrains Mono; SIL OFL) |

## Build

```bash
node tools/timing.mjs                 # cue times (estimated, or --voice output/voiceover.mp3)
node tools/make_srt.mjs               # .srt from the same timings
node tools/check.mjs                  # credential, claims, spelling and cue checks
python3 tools/make_audio.py           # music only; add --voice output/voiceover.mp3 to mix narration
node tools/render.mjs                 # full render, ~14 min
node tools/render.mjs --stills 30,90,140   # review PNGs in output/stills/
```

Dependencies: Node 20+ with Playwright and Chromium (`CHROMIUM_PATH` overrides the browser), ffmpeg (libx264 and AAC), and Python 3 with numpy. `tools/build_map.mjs` regenerates the map data. It needs `world-atlas`, `topojson-client` and `d3-geo`, installed under `tools/`. Its output is committed, so you only need it if you change the map.

To preview in a browser, open `src/index.html?play`, or `?t=95` to view a single frame.

## Voice-over

**This render has no spoken narration.** It carries music and burned-in Bengali subtitles only. This build environment can reach only package registries, so no professional Bengali TTS voice was available. The timing system is built so a recorded voice drops straight in:

1. Generate the narration from `narration-bn.txt`, for example with ElevenLabs, as you did for the earlier explainer, or with a voice artist. Use a composed, authoritative voice. The text is sized for a 5-minute runtime at the pace of your previous ElevenLabs track. If a scene runs long, a speed of about 1.05 helps.
2. Save it as `output/voiceover.mp3`, starting at 0:00. Leave a natural pause of about 0.4 s between sentences; the aligner uses these pauses.
3. Run:
   ```bash
   node tools/timing.mjs --voice output/voiceover.mp3   # warns if a line spills out of its scene
   node tools/make_srt.mjs
   python3 tools/make_audio.py --voice output/voiceover.mp3   # music ducked under the voice
   node tools/render.mjs
   ```

Scene bounds stay fixed at the storyboard times. Every reveal and highlight is anchored to a narration cue (for example `data-in="c2+0.5"`), not to a fixed second, so the visuals follow the recorded voice automatically.

## Integrity rules this video follows

- **Labels:** every scene is labelled as verified, actual test result, illustrative, or proposal. Generated visuals are never presented as real footage or hardware. The processor die says so explicitly on screen.
- **No credentials:** the only key that appears is the fictional placeholder `YOUR_API_KEY`. `tools/check.mjs` fails the build on anything key-shaped.
- **Workflow matches the implementation:** the API serves NIST SP 800-90A DRBG output seeded from health-tested quantum bits, not raw measurement bits.
- **Statistical results stay in context:** the SP 800-22 result is shown with its own report's caveats. It validates the DRBG, does not prove the source's entropy, and is not a certification.
- **Quantum randomness is not presented as a replacement:** it does not replace post-quantum cryptography, HSMs, KMS or encryption. The video states that the two are different technologies.
- **No unverified claims:** there are no endorsements, partnerships, certifications, awards, deployments, revenue or job figures, and no "first in Bangladesh" claims. The hardware is described honestly as accessed through the cloud.
