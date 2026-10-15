"""
generate_narration_v2.py
Synthesizes narration audio for all 9 scenes at calibrated rate 188.
Outputs WAV files and timing manifest.
"""
import os, subprocess, json

AUDIO_DIR = 'video-production/audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

SCENES = [
    {
        "id": 1,
        "title": "Cinematic Opening",
        "scene_duration": 15.5,
        "text": "Learning is fundamental. But in a competitive, technology-driven world, how do we prove what we can actually build and do? Welcome to SEVA Skill Passport. Proof of Course to Proof of Ability. Powered by Team OG — Opportunity and Growth."
    },
    {
        "id": 2,
        "title": "The Real-World Problem",
        "scene_duration": 24.0,
        "text": "Every year, millions of students complete online courses and receive completion certificates. But a certificate only confirms attendance. It cannot show the architectural decisions made in code, the edge cases tested, or the practical problem-solving demonstrated during real development. For both learners and evaluators, there is a missing link between passive study and verified competency."
    },
    {
        "id": 3,
        "title": "Case Study & Consultation",
        "scene_duration": 24.5,
        "text": "Our team explored the challenges of demonstrating practical skills beyond course-completion certificates. Through our case-study investigation and consultation, we sought perspectives and suggestions to better understand the problem. This informed our goal: to connect learning with clearer evidence of practical ability."
    },
    {
        "id": 4,
        "title": "Introducing Our Solution",
        "scene_duration": 16.0,
        "text": "Introducing SEVA Skill Passport: a unified digital learning and capability verification framework. Moving learners from basic course completion to tangible, cryptographic skill evidence that can be independently inspected by educators and hiring teams."
    },
    {
        "id": 5,
        "title": "Live Prototype Walkthrough",
        "scene_duration": 27.0,
        "text": "Here is our live working prototype, running locally. Beginning with our full-screen branded welcome intro, learners explore structured tracks like Full Stack Development. Our zero-friction onboarding includes one-click demo access. Inside the dashboard, student progress is tracked with active lesson milestones. Every challenge and code submission is linked to verifiable cryptographic proof, providing an authentic evidence portfolio."
    },
    {
        "id": 6,
        "title": "Existing Approaches & Our Uniqueness",
        "scene_duration": 23.0,
        "text": "Existing platforms—from traditional learning management systems to portfolio websites—solve individual pieces of the puzzle. SEVA Skill Passport connects them into a continuous journey: Course Learning leads to Practical Sandboxes, leading to Project Assessments, resulting in an immutable Skill Passport. A unified continuum from curriculum to cryptographic proof."
    },
    {
        "id": 7,
        "title": "Technology Stack & Architecture",
        "scene_duration": 21.5,
        "text": "Built on modern production technologies: Next.js App Router, React, and TypeScript for responsive interfaces, styled with Tailwind CSS, backed by Supabase and PostgreSQL, and secured with SHA-256 cryptographic evidence hashing. Developed iteratively as a working prototype with modular services."
    },
    {
        "id": 8,
        "title": "Potential Impact & Roadmap",
        "scene_duration": 19.0,
        "text": "Our intended benefits focus on transparent skill representation, empowering learners and simplifying evaluation. Our roadmap advances from prototype validation to student testing, richer assessment rubrics, and institutional integration. Driven by Team OG — Opportunity and Growth."
    },
    {
        "id": 9,
        "title": "Final Brand Reveal",
        "scene_duration": 8.5,
        "text": "SEVA Skill Passport. Proof of Course to Proof of Ability. Building a clearer bridge between learning and demonstrated ability."
    }
]

manifest = []
total_scene_time = sum(s["scene_duration"] for s in SCENES)
print(f"Total planned video duration: {total_scene_time:.1f}s ({int(total_scene_time//60)}m {total_scene_time%60:.1f}s)")

for s in SCENES:
    sid = s["id"]
    aiff_path = f"/tmp/scene_{sid}.aiff"
    wav_path = os.path.join(AUDIO_DIR, f"narration_scene_{sid}.wav")
    
    # Generate speech with say
    escaped = s["text"].replace('"', '\\"')
    cmd_say = f'say -v "Daniel" -r 188 -o "{aiff_path}" "{escaped}"'
    subprocess.run(cmd_say, shell=True, check=True)
    
    # Convert to 48kHz WAV
    cmd_conv = f'ffmpeg -y -i "{aiff_path}" -ar 48000 -ac 1 -c:a pcm_s16le "{wav_path}" 2>/dev/null'
    subprocess.run(cmd_conv, shell=True, check=True)
    if os.path.exists(aiff_path):
        os.remove(aiff_path)
        
    # Get exact duration
    out = subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{wav_path}"', shell=True).decode().strip()
    dur = float(out)
    
    print(f"Scene {sid} ({s['title']}): Voice = {dur:.2f}s | Scene = {s['scene_duration']:.1f}s")
    s_copy = dict(s)
    s_copy["voice_duration"] = dur
    s_copy["wav_file"] = wav_path
    manifest.append(s_copy)

with open(os.path.join(AUDIO_DIR, 'scenes_manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)

print("Audio generation complete.")
