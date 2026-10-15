#!/usr/bin/env python3
"""
Generates timed voiceover tracks for SEVA Skill Passport 30s Explainer.
Uses macOS 'say' with Samantha voice, normalized to broadcast standards (-16 LUFS).
"""
import os
import subprocess

segments = [
    {
        "id": "s1",
        "text": "Learning a skill is just the beginning.",
        "start_sec": 0.8,
        "voice": "Samantha",
        "rate": 155
    },
    {
        "id": "s2",
        "text": "SEVA Skill Passport helps you take the next step. Learn through structured lessons.",
        "start_sec": 4.2,
        "voice": "Samantha",
        "rate": 158
    },
    {
        "id": "s3",
        "text": "Practise with hands-on labs. Build real projects.",
        "start_sec": 9.4,
        "voice": "Samantha",
        "rate": 155
    },
    {
        "id": "s4",
        "text": "Test your skills through assessments. Then bring your demonstrated abilities together in a shareable Skill Passport, backed by evidence.",
        "start_sec": 15.2,
        "voice": "Samantha",
        "rate": 158
    },
    {
        "id": "s5",
        "text": "SEVA Skill Passport. Learn Skills. Build Ability. Prove What You Can Do.",
        "start_sec": 22.6,
        "voice": "Samantha",
        "rate": 150
    }
]

os.makedirs("scripts/video-assets/audio", exist_ok=True)

# 1. Generate individual audio segments
inputs = []
filter_complex = []
for i, seg in enumerate(segments):
    aiff_path = f"scripts/video-assets/audio/{seg['id']}.aiff"
    subprocess.run(["say", "-v", seg["voice"], "-r", str(seg["rate"]), "-o", aiff_path, seg["text"]], check=True)
    
    wav_path = f"scripts/video-assets/audio/{seg['id']}.wav"
    subprocess.run(["ffmpeg", "-y", "-i", aiff_path, "-ar", "48000", "-ac", "2", wav_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    delay_ms = int(seg["start_sec"] * 1000)
    inputs.extend(["-i", wav_path])
    filter_complex.append(f"[{i}]adelay={delay_ms}|{delay_ms}[a{i}]")

# Mix all into a 30s track
mix_inputs = "".join([f"[a{i}]" for i in range(len(segments))])
filter_complex.append(f"{mix_inputs}amix=inputs={len(segments)}:normalize=0,apad=whole_dur=30,loudnorm=I=-16:TP=-1.5:LRA=11[out]")

full_filter = ";".join(filter_complex)
cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", full_filter, "-map", "[out]", "-t", "30", "scripts/video-assets/audio/voiceover_master.wav"]
subprocess.run(cmd, check=True)
print("Voiceover generated successfully: scripts/video-assets/audio/voiceover_master.wav")
