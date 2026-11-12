# Quantum Computing — Chapter 1: Qubits, Superposition, and Measurement (English)

The English edition of Chapter 1, built on the supplied ElevenLabs voice-over (`output/voiceover.mp3`, 11:08.8). It follows the visual design of the Bengali edition (`../quantum-chapter-01/`) and is re-scripted scene by scene to the English narration.

| Deliverable | Path |
|---|---|
| Video, 1920×1080, 30 fps, H.264 + AAC, 11:08.8 | `output/quantum_chapter01_en_qubits_superposition_measurement.mp4` |
| English subtitles (measured times) | `output/quantum_chapter01_subtitles_en.srt` |
| Original voice-over (unchanged) | `output/voiceover.mp3` |

## Audio sync

- The video length equals the voice-over, and every scene, equation and subtitle starts on the sentence that introduces it.
- `tools/timing.mjs --voice output/voiceover.mp3` measured the 212 speech blocks in the recording with ffmpeg `silencedetect`. It aligned them, in order, to the 140 spoken sentences and headings in `src/script.js` by sentence length and pause depth.
- Lines written as symbols (`|ψ⟩ = α|0⟩ + β|1⟩`, `|α|² + |β|² = 1`, `P(0) = |α|²`, `P(1) = |β|²`) are spoken in the recording; the alignment confirms each one.
- Known limit: at 8:09 the narrator runs "…depending on their relative phases" straight into the next sentence. That subtitle boundary can be about 2 s early.

## Soundtrack

- The narration is not processed: no trimming, time-stretch, gain change or EQ.
- A very light music bed sits 30 dB below the speech level and ducks further under the voice (`tools/make_audio.py`).

## Content notes

- The credits for Hussein Billah and Sonicium Quantum Lab Limited (SQLL), with the final SQLL logo, appear where the narration names them.
- The real-hardware histogram is labelled as an illustrative example, not measured data.
- The Qiskit code on screen is valid for Qiskit 1.x/2.x and prints `{'00': 0.5, '11': 0.5}`.

## Build

```bash
node tools/timing.mjs --voice output/voiceover.mp3
node tools/make_srt.mjs && node tools/check.mjs
ffmpeg -y -i output/voiceover.mp3 -ar 48000 -ac 1 output/voiceover_48k.wav
python3 tools/make_audio.py --voice output/voiceover_48k.wav
node tools/render.mjs
```
