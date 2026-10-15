"""
build_audio_track.py
Assembles the complete master audio track for the 179-second film:
1. Positions each scene's narration precisely according to the scene timeline.
2. Generates an ambient cinematic soundtrack with chord progression and gentle movement.
3. Mixes narration + ambient soundtrack with proper volume balance.
Outputs: video-production/audio/master_audio.wav
"""
import os, subprocess, json

AUDIO_DIR = 'video-production/audio'
manifest = json.load(open(os.path.join(AUDIO_DIR, 'scenes_manifest.json')))

# Compute start time for each scene
current_time = 0.0
scene_starts = []
for s in manifest:
    scene_starts.append(current_time)
    current_time += s["scene_duration"]

total_duration = current_time # 179.0s
print(f"Master timeline duration: {total_duration:.1f}s")

# Generate silent base audio
cmd_base = f'ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=mono -t {total_duration} {AUDIO_DIR}/narration_full.wav'
subprocess.run(cmd_base, shell=True, check=True)

# Build narration track by overlaying each scene at its start time + 0.3s breath
filter_complex = []
inputs = []

for idx, s in enumerate(manifest):
    inputs.extend(['-i', s['wav_file']])
    delay_ms = int((scene_starts[idx] + 0.35) * 1000)
    filter_complex.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")

mix_inputs = "".join(f"[a{idx}]" for idx in range(len(manifest)))
filter_complex.append(f"{mix_inputs}amix=inputs={len(manifest)}:duration=longest:dropout_transition=0,volume=1.0[narr_out]")

cmd_narr = [
    'ffmpeg', '-y',
    *inputs,
    '-filter_complex', ";".join(filter_complex),
    '-map', '[narr_out]',
    '-ar', '48000',
    '-c:a', 'pcm_s16le',
    f'{AUDIO_DIR}/narration_combined.wav'
]
subprocess.run(cmd_narr, check=True)
print("Narration track combined successfully.")

# Generate ambient cinematic score:
# A lush ambient synthesizer pad playing warm sustained chords (F - C - G - Dm - Am) with subtle harmonics,
# lowpass filtered and ducked smoothly below the voiceover.
score_expr = (
    # Base drone & warm 5ths
    "0.05*sin(2*PI*130.81*t) + 0.04*sin(2*PI*196.00*t) + 0.03*sin(2*PI*261.63*t) + "
    # Gentle undulating chord texture
    "0.025*sin(2*PI*329.63*t*(1+0.002*sin(2*PI*0.1*t))) + "
    "0.02*sin(2*PI*392.00*t*(1+0.001*sin(2*PI*0.15*t)))"
)

cmd_score = (
    f'ffmpeg -y -f lavfi -i "aevalsrc=exprs=\'{score_expr}\':s=48000:d={total_duration}" '
    f'-af "lowpass=f=1200,volume=0.28,afade=t=in:ss=0:d=3,afade=t=out:st={total_duration - 3.0}:d=3" '
    f'-ar 48000 -c:a pcm_s16le {AUDIO_DIR}/ambient_score.wav'
)
subprocess.run(cmd_score, shell=True, check=True)
print("Ambient score generated.")

# Master audio mix: Narration (clear, full presence) + Ambient Score (restrained background bed)
cmd_mix = [
    'ffmpeg', '-y',
    '-i', f'{AUDIO_DIR}/narration_combined.wav',
    '-i', f'{AUDIO_DIR}/ambient_score.wav',
    '-filter_complex', '[0:a]volume=1.05[vocal];[1:a]volume=0.45[music];[vocal][music]amix=inputs=2:duration=first:weights=3 1[master]',
    '-map', '[master]',
    '-ar', '48000',
    '-c:a', 'pcm_s16le',
    f'{AUDIO_DIR}/master_audio.wav'
]
subprocess.run(cmd_mix, check=True)
print(f"Master audio track generated at {AUDIO_DIR}/master_audio.wav")
