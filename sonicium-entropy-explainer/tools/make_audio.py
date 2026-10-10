"""Synthesises the soundtrack: a restrained ambient pad, a soft pulse and quiet
transition swells at each scene boundary. Everything is generated here, so the
audio has no third-party licensing.

    python3 tools/make_audio.py            # -> output/soundtrack.wav
    python3 tools/make_audio.py --voice vo.wav   # also mixes a narration track (ducked music)
"""
import argparse
import os
import re
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000


def scene_starts():
    src = open(os.path.join(ROOT, "src", "script.js"), encoding="utf-8").read()
    duration = float(re.search(r"duration:\s*([\d.]+)", src).group(1))
    starts = [float(x) for x in re.findall(r"start:\s*([\d.]+)", src)]
    return duration, starts


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pad(t, freqs, rng):
    out = np.zeros_like(t)
    for f in freqs:
        for detune in (-0.12, 0.0, 0.12):
            ph = rng.uniform(0, 2 * np.pi)
            fr = f * 2 ** (detune / 12)
            # soft saw-ish tone: a few decaying harmonics
            for h, amp in ((1, 1.0), (2, 0.35), (3, 0.12)):
                out += amp * np.sin(2 * np.pi * fr * h * t + ph)
    return out / (len(freqs) * 3 * 1.5)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # one-pole, run twice for 12 dB/oct
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def build(duration):
    rng = np.random.default_rng(7)
    n = int(SR * (duration + 1.0))
    t = np.arange(n) / SR
    # Am9 – Fmaj7 – Cmaj7 – G6, 8 s per chord
    chords = [[57, 64, 67, 71, 72], [53, 60, 64, 67, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 66]]
    music = np.zeros(n)
    seg = 8.0
    for k in range(int(np.ceil((duration + 1) / seg)) + 1):
        a, b = k * seg - 2.0, (k + 1) * seg + 2.0
        i0, i1 = max(0, int(a * SR)), min(n, int(b * SR))
        if i0 >= i1:
            continue
        tt = t[i0:i1]
        env = np.clip((tt - a) / 2.0, 0, 1) * np.clip((b - tt) / 2.0, 0, 1)
        music[i0:i1] += env * pad(tt, [note(m) for m in chords[k % 4]], rng)
    # sub pulse on the beat (~96 bpm), very quiet
    beat = 60 / 96
    ph = (t % beat) / beat
    root = np.array([note(chords[int(x // seg) % 4][0] - 12) for x in t[:: SR // 10]])
    root = np.repeat(root, SR // 10)[:n]
    pulse = np.sin(2 * np.pi * root * t) * np.exp(-ph * 6) * 0.18
    # shimmering high "quantum" ticks
    ticks = np.zeros(n)
    for k, s in enumerate(np.arange(0.5, duration, beat / 2)):
        if rng.random() < 0.35:
            i = int(s * SR)
            L = int(0.25 * SR)
            if i + L < n:
                f = note(84 + int(rng.choice([0, 3, 7, 10, 12])))
                tt = np.arange(L) / SR
                ticks[i : i + L] += 0.05 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14)
    mix = music * 0.55 + pulse + ticks
    # global fade in/out
    mix *= np.clip(t / 2.5, 0, 1) * np.clip((duration + 0.5 - t) / 3.0, 0, 1)
    return mix, n


def swells(duration, starts, n):
    rng = np.random.default_rng(3)
    out = np.zeros(n)
    noise = rng.standard_normal(int(1.2 * SR))
    noise = lowpass(noise, 1800)
    L = len(noise)
    tt = np.arange(L) / SR
    env = np.sin(np.pi * np.clip(tt / 1.2, 0, 1)) ** 2
    whoosh = noise * env * 0.07
    for s in starts[1:]:
        i = int((s - 0.7) * SR)
        if 0 <= i and i + L < n:
            out[i : i + L] += whoosh
    # gentle chime on the closing brand reveal
    i = int((starts[-1] + 0.4) * SR)
    L2 = int(3.0 * SR)
    tt = np.arange(L2) / SR
    chime = sum(np.sin(2 * np.pi * note(m) * tt) for m in (76, 83, 88)) * np.exp(-tt * 1.6) * 0.05
    out[i : i + L2] += chime[: n - i]
    return out


def read_wav(path):
    with wave.open(path) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16 if sw == 2 else np.int32)
    data = data.reshape(-1, ch).mean(axis=1) / (32768.0 if sw == 2 else 2**31)
    if sr != SR:
        x = np.arange(len(data)) / sr
        data = np.interp(np.arange(int(len(data) * SR / sr)) / SR, x, data)
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", help="optional narration WAV, aligned to t=0")
    ap.add_argument("--out", default=os.path.join(ROOT, "output", "soundtrack.wav"))
    args = ap.parse_args()
    duration, starts = scene_starts()
    music, n = build(duration)
    fx = swells(duration, starts, n)
    left = music * 0.92 + fx
    right = music + fx * 0.92
    if args.voice:
        v = read_wav(args.voice)[:n]
        v = np.pad(v, (0, n - len(v)))
        # duck music under the voice
        env = np.convolve(np.abs(v), np.ones(SR // 5) / (SR // 5), mode="same")
        duck = 1 - 0.65 * np.clip(env * 20, 0, 1)
        left, right = left * duck + v, right * duck + v
    peak = max(np.abs(left).max(), np.abs(right).max())
    gain = 0.5 / peak if not args.voice else 0.89 / peak
    st = np.stack([left, right], axis=1) * gain
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with wave.open(args.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print("wrote", args.out)


if __name__ == "__main__":
    main()
