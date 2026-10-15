#!/usr/bin/env python3
"""
Generates bespoke sound effects for SEVA Skill Passport 30s Explainer:
- Sub impact (Hook & Brand reveal)
- Soft whooshes (Transitions)
- UI clicks & test pass chimes
- Lock / cryptographic seal click
"""
import numpy as np
import scipy.io.wavfile as wavfile
import os

sr = 48000
os.makedirs("scripts/video-assets/audio/sfx", exist_ok=True)

def save_wav(name, data):
    # Normalize and convert to 16-bit PCM
    peak = np.max(np.abs(data))
    if peak > 0:
        data = (data / peak) * 0.85
    wavfile.write(f"scripts/video-assets/audio/sfx/{name}.wav", sr, (data * 32767).astype(np.int16))
    print(f"Generated SFX: {name}.wav")

# 1. Sub Impact (0.8s) - warm bass drop
t_sub = np.linspace(0, 0.8, int(sr * 0.8), endpoint=False)
f_sub = 80.0 * np.exp(-3.0 * t_sub) + 30.0
sub = np.sin(2 * np.pi * f_sub * t_sub) * np.exp(-4.0 * t_sub)
save_wav("sub_impact", sub)

# 2. Whoosh (0.5s) - smooth filtered air sweep
t_w = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
noise = np.random.uniform(-1, 1, len(t_w))
# Bell-shaped amplitude envelope
env_w = np.sin(np.pi * (t_w / 0.5))**2
# Pitch modulation
f_sweep = 400 + 800 * np.sin(np.pi * (t_w / 0.5))
whoosh = noise * env_w * (0.3 + 0.7 * np.sin(2 * np.pi * f_sweep * t_w))
save_wav("whoosh", whoosh)

# 3. UI Click / Tap (0.08s) - crisp modern UI tap
t_c = np.linspace(0, 0.08, int(sr * 0.08), endpoint=False)
click = np.sin(2 * np.pi * 2200 * t_c) * np.exp(-70.0 * t_c)
save_wav("ui_click", click)

# 4. Success Chime (0.7s) - golden harmonic bell
t_ch = np.linspace(0, 0.7, int(sr * 0.7), endpoint=False)
env_ch = np.exp(-5.0 * t_ch)
chime = (np.sin(2 * np.pi * 1046.5 * t_ch) + 
         0.5 * np.sin(2 * np.pi * 1318.5 * t_ch) + 
         0.3 * np.sin(2 * np.pi * 1567.98 * t_ch) + 
         0.2 * np.sin(2 * np.pi * 2093.0 * t_ch)) * env_ch
save_wav("success_chime", chime)

# 5. Lock / Cryptographic Seal (0.3s) - dual mechanical click
t_l = np.linspace(0, 0.3, int(sr * 0.3), endpoint=False)
l1 = np.sin(2 * np.pi * 1800 * t_l) * np.exp(-60.0 * t_l)
t_delay = np.maximum(0, t_l - 0.07)
l2 = np.sin(2 * np.pi * 900 * t_delay) * np.exp(-40.0 * t_delay) * (t_l > 0.07)
lock = l1 + 0.8 * l2
save_wav("lock_seal", lock)

print("All SFX generated successfully.")
