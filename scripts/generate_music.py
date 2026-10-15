#!/usr/bin/env python3
"""
Synthesizes a warm, elegant, modern ed-tech ambient music bed (30 seconds)
in D-major / A-major with lush harmonic chords, warm sub-bass, and gentle chime textures.
"""
import numpy as np
import scipy.io.wavfile as wavfile
import os

sr = 48000
duration = 30.0
total_samples = int(sr * duration)
t = np.linspace(0, duration, total_samples, endpoint=False)

# Left and Right stereo channels
left = np.zeros(total_samples, dtype=np.float32)
right = np.zeros(total_samples, dtype=np.float32)

# Chords progression (Dmaj9 -> A/C# -> Bm7 -> Gmaj7 -> Dmaj9)
# Chord intervals in seconds
chords = [
    # (start, end, root_freq, notes)
    (0.0, 7.0, 146.83, [146.83, 220.00, 277.18, 370.00, 440.00, 554.37]),      # Dmaj9
    (7.0, 14.0, 110.00, [110.00, 164.81, 220.00, 277.18, 329.63, 440.00]),    # A/C#
    (14.0, 21.0, 123.47, [123.47, 185.00, 220.00, 293.66, 370.00, 440.00]),   # Bm7
    (21.0, 27.0, 98.00, [98.00, 146.83, 196.00, 246.94, 293.66, 392.00]),     # Gmaj7
    (27.0, 30.0, 146.83, [146.83, 220.00, 293.66, 370.00, 440.00, 587.33]),   # Dmaj resolve
]

for start_t, end_t, root_f, notes in chords:
    idx_start = int(start_t * sr)
    idx_end = int(end_t * sr)
    dur = end_t - start_t
    t_chord = np.linspace(0, dur, idx_end - idx_start, endpoint=False)
    
    # Warm bell envelope: gentle attack, long sustain, smooth release
    attack = np.minimum(t_chord / 0.8, 1.0)
    release = np.minimum((dur - t_chord) / 1.0, 1.0)
    env = attack * release
    
    # Warm sub-bass
    sub_bass = 0.22 * np.sin(2 * np.pi * (root_f / 2) * t_chord) * env
    left[idx_start:idx_end] += sub_bass
    right[idx_start:idx_end] += sub_bass
    
    # Harmonic notes
    for i, f in enumerate(notes):
        pan = 0.3 + 0.4 * (i / len(notes)) # Spread across stereo field
        detune_l = 1.0008
        detune_r = 0.9992
        # Rich fundamental + warm second harmonic
        tone_l = (0.08 / (i + 1)**0.5) * (np.sin(2 * np.pi * f * detune_l * t_chord) + 0.3 * np.sin(4 * np.pi * f * t_chord))
        tone_r = (0.08 / (i + 1)**0.5) * (np.sin(2 * np.pi * f * detune_r * t_chord) + 0.3 * np.sin(4 * np.pi * f * t_chord))
        
        left[idx_start:idx_end] += tone_l * env * (1.0 - pan)
        right[idx_start:idx_end] += tone_r * env * pan

# Arpeggio sparkle pulses every 1.5 seconds
arp_notes = [440.0, 554.37, 659.25, 740.0, 880.0, 1108.7]
for pulse_t in np.arange(1.0, 28.0, 1.5):
    idx_p = int(pulse_t * sr)
    dur_p = 1.2
    idx_p_end = min(idx_p + int(dur_p * sr), total_samples)
    t_p = np.linspace(0, dur_p, idx_p_end - idx_p, endpoint=False)
    env_p = np.exp(-4.0 * t_p)
    note_idx = int((pulse_t * 2) % len(arp_notes))
    f_arp = arp_notes[note_idx]
    sparkle = 0.04 * np.sin(2 * np.pi * f_arp * t_p) * env_p
    left[idx_p:idx_p_end] += sparkle * 0.7
    right[idx_p:idx_p_end] += sparkle * 0.3

# Overall master fade-in and fade-out
fade_in = np.minimum(t / 1.5, 1.0)
fade_out = np.minimum((30.0 - t) / 2.0, 1.0)
master_env = fade_in * fade_out
left *= master_env
right *= master_env

# Normalize peak to -12 dB
stereo = np.vstack([left, right]).T
peak = np.max(np.abs(stereo))
if peak > 0:
    stereo = (stereo / peak) * 0.25 # Clean headroom

wav_data = (stereo * 32767).astype(np.int16)
os.makedirs("scripts/video-assets/audio", exist_ok=True)
wavfile.write("scripts/video-assets/audio/music_bed.wav", sr, wav_data)
print("Synthesized music bed successfully: scripts/video-assets/audio/music_bed.wav")
