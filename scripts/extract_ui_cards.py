#!/usr/bin/env python3
"""
Extracts clean, chromeless supporting UI footage cards from authentic screenshots.
"""
from PIL import Image
import os

os.makedirs("scripts/video-assets/crops", exist_ok=True)
asset_dir = "scripts/video-assets"

# 1. Video Player from /learning (x: 100 to 1250, y: 120 to 800)
img_learn = Image.open(f"{asset_dir}/02_learn_learning.png")
w, h = img_learn.size
crop_video = img_learn.crop((80, 110, 1260, 780))
crop_video.save("scripts/video-assets/crops/crop_video_player.png")

# 2. AI Tutor chat panel from /learning (x: 1280 to 1840, y: 120 to 850)
crop_tutor = img_learn.crop((1280, 120, 1840, 850))
crop_tutor.save("scripts/video-assets/crops/crop_ai_tutor.png")

# 3. Code Editor from /practice (x: 100 to 1300, y: 120 to 850)
img_pract = Image.open(f"{asset_dir}/03_practise_lab.png")
crop_code = img_pract.crop((100, 120, 1300, 850))
crop_code.save("scripts/video-assets/crops/crop_code_editor.png")

# 4. Project Card from /projects (x: 100 to 950, y: 250 to 800)
img_proj = Image.open(f"{asset_dir}/04b_projects_hub.png")
crop_proj = img_proj.crop((100, 240, 1000, 800))
crop_proj.save("scripts/video-assets/crops/crop_project_card.png")

# 5. Verified Passport & Hash Ledger from /verify (x: 100 to 1820, y: 150 to 750)
img_verify = Image.open(f"{asset_dir}/07_verify_ledger.png")
crop_ledger = img_verify.crop((100, 140, 1400, 780))
crop_ledger.save("scripts/video-assets/crops/crop_evidence_ledger.png")

print("Cropped authentic UI supporting cards successfully:")
for f in os.listdir("scripts/video-assets/crops"):
    if f.endswith(".png"):
        im = Image.open(f"scripts/video-assets/crops/{f}")
        print(f"  {f}: {im.size}")
