#!/usr/bin/env python3
import subprocess

# Voiceover is at scripts/video-assets/audio/voiceover_master.wav
# Music bed is at scripts/video-assets/audio/music_bed.wav
# Mix: duck music by -6dB during speech using sidechaincompress filter or simple volume balance
cmd = [
    "ffmpeg", "-y",
    "-i", "scripts/video-assets/audio/voiceover_master.wav",
    "-i", "scripts/video-assets/audio/music_bed.wav",
    "-filter_complex",
    "[1:a]volume=0.35[music];"
    "[0:a]volume=1.0[voice];"
    "[music][voice]amix=inputs=2:duration=first:dropout_transition=2,"
    "loudnorm=I=-16:TP=-1.5:LRA=11[out]",
    "-map", "[out]",
    "-t", "30",
    "scripts/video-assets/audio/final_audio_master.wav"
]
subprocess.run(cmd, check=True)
print("Mixed final audio master: scripts/video-assets/audio/final_audio_master.wav")
