#!/usr/bin/env python3
"""
Combines:
1. Voiceover (Samantha -16 LUFS)
2. Ambient music bed
3. Timed SFX events
Outputs broadcast-normalized audio master.
"""
import numpy as np
import scipy.io.wavfile as wavfile
import os

sr = 48000
duration = 30.0
total_samples = int(sr * duration)

def load_wav(path):
    rate, data = wavfile.read(path)
    if data.ndim == 1:
        data = np.vstack([data, data]).T
    data = data.astype(np.float32) / 32768.0
    return data

# Master stereo buffers
master_l = np.zeros(total_samples, dtype=np.float32)
master_r = np.zeros(total_samples, dtype=np.float32)

# 1. Add Music Bed
music = load_wav("scripts/video-assets/audio/music_bed.wav")
music_len = min(len(music), total_samples)
# Music level: soft bed (-22 dB relative)
master_l[:music_len] += music[:music_len, 0] * 0.40
master_r[:music_len] += music[:music_len, 1] * 0.40

# 2. Add Voiceover
voice = load_wav("scripts/video-assets/audio/voiceover_master.wav")
voice_len = min(len(voice), total_samples)
# Voice level: clear, prominent
master_l[:voice_len] += voice[:voice_len, 0] * 0.85
master_r[:voice_len] += voice[:voice_len, 1] * 0.85

# 3. Add Timed SFX
sfx_events = [
    (0.5, "sub_impact", 0.65),
    (3.8, "whoosh", 0.45),
    (5.5, "ui_click", 0.40),
    (8.8, "whoosh", 0.45),
    (10.2, "ui_click", 0.35),
    (12.0, "success_chime", 0.50),
    (14.8, "whoosh", 0.45),
    (17.5, "ui_click", 0.35),
    (19.5, "lock_seal", 0.60),
    (21.8, "whoosh", 0.45),
    (22.5, "sub_impact", 0.70),
    (23.5, "success_chime", 0.45),
]

for t_sec, sfx_name, vol in sfx_events:
    sfx_data = load_wav(f"scripts/video-assets/audio/sfx/{sfx_name}.wav")
    start_idx = int(t_sec * sr)
    end_idx = min(start_idx + len(sfx_data), total_samples)
    actual_len = end_idx - start_idx
    if actual_len > 0:
        master_l[start_idx:end_idx] += sfx_data[:actual_len, 0] * vol
        master_r[start_idx:end_idx] += sfx_data[:actual_len, 1] * vol

# Master fade out
fade_len = int(1.2 * sr)
fade_env = np.linspace(1.0, 0.0, fade_len)
master_l[-fade_len:] *= fade_env
master_r[-fade_len:] *= fade_env

stereo = np.vstack([master_l, master_r]).T

# Normalize peak to -1.5 dB (0.84)
peak = np.max(np.abs(stereo))
if peak > 0:
    stereo = (stereo / peak) * 0.84

out_wav = "scripts/video-assets/audio/master_soundtrack.wav"
wavfile.write(out_wav, sr, (stereo * 32767).astype(np.int16))
print(f"Master soundtrack generated: {out_wav}")
