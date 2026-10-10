# Sonicium Entropy: Bengali data-center explainer

A 128-second Bengali explainer video, timed to the ElevenLabs voice-over in `output/voiceover.mp3`, for **Sonicium Entropy** (Sonicium Quantum Lab Ltd.). It shows how the quantum-seeded randomness API fits into data-center security workflows. The video is generated from code: HTML/CSS scenes are rendered frame by frame in headless Chromium and encoded with ffmpeg.

| Deliverable | Path |
|---|---|
| 16:9 master (1920×1080, 30 fps, H.264 + AAC) | `output/sonicium-entropy-bn-16x9.mp4` |
| 9:16 social cut (1080×1920) | `output/sonicium-entropy-bn-9x16.mp4` |
| Bengali subtitles | `output/sonicium-entropy-bn.srt` |
| Soundtrack (generated music and SFX, rebuilt by `tools/make_audio.py`, not committed) | `output/soundtrack.wav` |
| Storyboard, timing and verification log | `storyboard.md` |
| Scene source | `src/index.html`, `src/style.css`, `src/animate.js` |
| Narration, subtitles and timing (single source of truth) | `src/script.js` |
| API integration demos | `api-demo/sonicium_demo.py` (stdlib), `api-demo/sonicium_demo.mjs` (`@sonicium/sdk`) |

## Dependencies

- Node 20+ with `playwright` (local or global) and a Chromium build. Set `CHROMIUM_PATH` to use a specific binary.
- ffmpeg with libx264 and AAC.
- Python 3.9+ with `numpy`, used for the soundtrack only.
- Fonts are vendored in `src/fonts/` from @fontsource: Noto Sans Bengali, Inter and JetBrains Mono, all SIL OFL 1.1. Nothing is loaded from the network, and Chromium's HarfBuzz shaping renders Bengali conjuncts and `র‍্য` (with ZWJ) correctly.

## Build

```bash
python3 tools/make_audio.py                 # output/soundtrack.wav
node tools/make_srt.mjs                     # output/sonicium-entropy-bn.srt
node tools/check.mjs                        # leak, claims, spelling and cue checks
node tools/render.mjs --format 16x9         # ~5 min
node tools/render.mjs --format 9x16
node tools/render.mjs --format 16x9 --stills 8,30,44   # PNG stills for review
```

To preview a scene live, open `src/index.html?play` (or `?format=9x16&play`, or `?t=44` for a single frame) in a browser.

To edit text or timing, change `src/script.js` and re-run the steps above. The burned-in subtitles and the `.srt` file both come from that file.

## Narration (voice-over)

The masters carry the ElevenLabs Bengali voice-over (`output/voiceover.mp3`, 125.8 s), with the music ducked underneath it, plus burned-in subtitles.

How the timing works:

- `src/script.js` holds the voice timing: scene `start`/`end` and cue `start`/`end`. These were measured from the pauses in the voice-over: 17 spoken sentences, each separated by a pause of about 0.4–0.5 s.
- Each scene also keeps `design` times, and each cue keeps a fourth value: the times the animations were authored against. `animate.js` time-warps between the two, so every animated beat (for example, the API steps ১–৪) lands on its spoken line.

To use a different voice-over:

1. Measure the sentence starts, for example with `ffmpeg -i vo.mp3 -af silencedetect=noise=-35dB:d=0.35 -f null -`.
2. Update the cue start/end times and the scene bounds in `src/script.js`. Leave the `design` values alone.
3. Run `python3 tools/make_audio.py --voice vo.mp3`, then `node tools/make_srt.mjs`, then both `render.mjs` commands.

## API demo and the placeholder key

The video and all code use the fictional placeholder `YOUR_API_KEY`. No real key appears anywhere in this directory, and `tools/check.mjs` fails the build if anything key-shaped (`sk_…` followed by a long token) or a literal bearer token shows up.

The demos read the key **only** from the `SONICIUM_API_KEY` environment variable, and they refuse to run with the placeholder:

```bash
# Load the key from your secret manager. Never paste it into code or shell history.
export SONICIUM_API_KEY="$(vault kv get -field=api_key secret/sonicium)"   # or AWS/GCP/Azure secrets CLI
python3 api-demo/sonicium_demo.py --length 32 --format hex
python3 api-demo/sonicium_demo.py --dry-run     # offline: validates the built-in sample response
```

What the Python demo does, based on the verified contract (see `storyboard.md` → *Verification log*):

- `GET https://api.soniciumentropy.com/v1/random?length=…&format=hex|base64` with `Authorization: Bearer $SONICIUM_API_KEY`. It refuses any non-HTTPS base URL.
- 30 s timeout. It retries only what is safe: network errors, 502, 503, and 429 *with* `Retry-After`. A 429 without that header means the monthly quota is spent, and it does not retry.
- It validates the documented fields, format, length, the decoded byte count, the register (`Q63`/`Q135`), and `healthCheck.rct`/`apt == "passed"`. An `"unknown"` health status is rejected unless you pass `--allow-unknown-health`. Decide that policy for your own environment.
- Audit logs carry status, length, register and attempt. They never include the key or the random bytes.

To rotate or replace a key, issue a new key in the Sonicium Entropy dashboard, update the secret in your secret manager, restart the consuming service, then revoke the old key. Give each service its own key: the register is fixed per key, and separate keys keep usage least-privilege and auditable.

## Content rules this project follows

- The on-screen "যাচাইকৃত" badge marks scenes whose statements were checked against the Sonicium Entropy repository. "ধারণাগত চিত্র" marks conceptual diagrams.
- Sonicium Entropy is shown as a source of random data that **complements** firewalls, HSM, KMS, access control and monitoring. It replaces none of them.
- The video contains no performance figures, certifications, customers, partners, testimonials, or absolute-security claims.
- The repository has no logo file, so the brand mark is typographic and uses the web app's `--electric` blue (`#2563eb`). Replace `.wordmark` and `.bigmark` in `src/style.css` with the official logo when one is available.
