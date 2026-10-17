#!/usr/bin/env python3
"""
scripts/render_product_demo_video.py

Professional 68-Second Real Product Demo Video Generator for SEVA Skill Passport.
Complies strictly with Part 7, 8, & 9 of the official specification:
- Real authentic screenshots from running application
- Broadcast standard 1920x1080 @ 30fps (2040 frames, 68.0 seconds)
- Video codec: H.264 (MP4, yuv420p, crf 18)
- Audio codec: AAC (192kbps), royalty-free ambient music bed + synchronized subtle UI SFX
- Scenes 1 through 8 sequential learner journey
- Output destination: presentation-assets/product-demo/seva-skill-passport-demo.mp4
"""

import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_DURATION = 68.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 2040 frames

OUTPUT_DIR = 'presentation-assets/product-demo'
FINAL_MP4 = os.path.join(OUTPUT_DIR, 'seva-skill-passport-demo.mp4')
TEMP_AUDIO = os.path.join(OUTPUT_DIR, 'demo_soundtrack_master.wav')

os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Color Palette & Styling
# -----------------------------------------------------------------------------
BURGUNDY = (136, 19, 55)
BURGUNDY_DARK = (88, 12, 35)
GOLD = (202, 138, 4)
GOLD_BRIGHT = (245, 158, 11)
WHITE = (255, 255, 255)
CREAM = (255, 253, 247)
DARK_BG = (15, 23, 42)
TEXT_MUTED = (148, 163, 184)

# -----------------------------------------------------------------------------
# Typography
# -----------------------------------------------------------------------------
FONT_HEADING = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_REGULAR = '/System/Library/Fonts/Supplemental/Arial.ttf'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size)
        except Exception:
            return ImageFont.load_default()

font_title_hero = get_font(FONT_HEADING, 52)
font_title_badge = get_font(FONT_HEADING, 22)
font_subtitle = get_font(FONT_REGULAR, 26)
font_tagline = get_font(FONT_HEADING, 36)
font_url = get_font(FONT_HEADING, 28)
font_watermark = get_font(FONT_HEADING, 15)

# -----------------------------------------------------------------------------
# Asset Loading
# -----------------------------------------------------------------------------
print("Loading high-resolution genuine application screenshots...")

raw_screens = {
    'homepage': Image.open('presentation-assets/website-screenshots/01-homepage.png').convert('RGB'),
    'courses': Image.open('presentation-assets/website-screenshots/03-course-catalogue.png').convert('RGB'),
    'login': Image.open('video-production/raw-captures/04_login_page.png').convert('RGB'),
    'course_detail': Image.open('presentation-assets/website-screenshots/04-course-detail.png').convert('RGB'),
    'checkout': Image.open('presentation-assets/website-screenshots/14-course-purchase.png').convert('RGB'),
    'learning': Image.open('presentation-assets/website-screenshots/05-learning-module.png').convert('RGB'),
    'practice': Image.open('presentation-assets/website-screenshots/06-coding-challenge.png').convert('RGB'),
    'assessment_results': Image.open('presentation-assets/website-screenshots/07-assessment-results.png').convert('RGB'),
    'dashboard': Image.open('presentation-assets/website-screenshots/02-student-dashboard.png').convert('RGB'),
    'growth_card': Image.open('presentation-assets/website-screenshots/08-competency-overview.png').convert('RGB'),
    'passport': Image.open('presentation-assets/website-screenshots/09-skill-passport.png').convert('RGB'),
    'verify': Image.open('presentation-assets/website-screenshots/11-credential-verification.png').convert('RGB'),
}

# Ensure all screens are exact 1920x1080
screens = {}
for k, img in raw_screens.items():
    if img.size != (WIDTH, HEIGHT):
        screens[k] = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    else:
        screens[k] = img

# Logo
logo_img = Image.open('public/images/seva-skill-passport-logo-transparent.png').convert('RGBA')
logo_aspect = logo_img.width / logo_img.height
target_logo_h = 70
target_logo_w = int(target_logo_h * logo_aspect)
logo_resized = logo_img.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)

# -----------------------------------------------------------------------------
# Scene Timing Definition (Total 68.0s = 2040 frames)
# -----------------------------------------------------------------------------
# Scene 1: Discover SEVA Skill Passport (0 - 8.0s: frames 0 - 240)
# Scene 2: Register or Log In (8.0 - 16.0s: frames 240 - 480)
# Scene 3: Unlock the Complete Course (16.0 - 24.5s: frames 480 - 735)
# Scene 4: Access the Curriculum (24.5 - 32.5s: frames 735 - 975)
# Scene 5: Learn and Practise (32.5 - 41.5s: frames 975 - 1245)
# Scene 6: Complete an Assessment (41.5 - 50.5s: frames 1245 - 1515)
# Scene 7: Show Updated Results (50.5 - 60.5s: frames 1515 - 1815)
# Scene 8: Closing & Verification (60.5 - 68.0s: frames 1815 - 2040)

SCENES = [
    {
        'id': 1,
        'name': 'Discover SEVA Skill Passport',
        'start_f': 0,
        'end_f': 240,
        'caption': 'EXPLORE COURSES',
        'subtitle': 'Explore industry-aligned curriculums starting at a one-time fee of just ₹100.',
        'bg1': 'homepage',
        'bg2': 'courses',
        'split_f': 120,
    },
    {
        'id': 2,
        'name': 'Register or Log In',
        'start_f': 240,
        'end_f': 480,
        'caption': 'ONE ACCOUNT. RETURN ANYTIME.',
        'subtitle': 'Single persistent account. Seamless repeat login with data and progress preserved.',
        'bg1': 'login',
        'bg2': 'dashboard',
        'split_f': 360,
    },
    {
        'id': 3,
        'name': 'Unlock the Complete Course',
        'start_f': 480,
        'end_f': 735,
        'caption': 'UNLOCK THE FULL COURSE — ₹100',
        'subtitle': 'One ₹100 payment unlocks all 12 modules and 111+ lessons. Zero per-lesson fees.',
        'bg1': 'course_detail',
        'bg2': 'checkout',
        'split_f': 600,
    },
    {
        'id': 4,
        'name': 'Access the Curriculum',
        'start_f': 735,
        'end_f': 975,
        'caption': 'ONE PAYMENT. COMPLETE COURSE ACCESS.',
        'subtitle': 'Navigate freely across modules and practice units with zero repeat payment prompts.',
        'bg1': 'learning',
        'bg2': 'learning',
        'split_f': 855,
    },
    {
        'id': 5,
        'name': 'Learn and Practise',
        'start_f': 975,
        'end_f': 1245,
        'caption': 'LEARN AND PRACTISE',
        'subtitle': 'Interactive lesson workspaces with hands-on Monaco coding labs and automated test execution.',
        'bg1': 'learning',
        'bg2': 'practice',
        'split_f': 1110,
    },
    {
        'id': 6,
        'name': 'Complete an Assessment',
        'start_f': 1245,
        'end_f': 1515,
        'caption': 'PROVE YOUR SKILLS',
        'subtitle': 'Submit proctored technical assessments with instant grading and verified competence metrics.',
        'bg1': 'practice',
        'bg2': 'assessment_results',
        'split_f': 1365,
    },
    {
        'id': 7,
        'name': 'Show Updated Results',
        'start_f': 1515,
        'end_f': 1815,
        'caption': 'TRACK YOUR PROGRESS',
        'subtitle': 'Results persist across sessions: 68% course progress, multi-skill radar, and verified credentials.',
        'bg1': 'growth_card',
        'bg2': 'passport',
        'split_f': 1665,
    },
    {
        'id': 8,
        'name': 'Official Closing & Verification',
        'start_f': 1815,
        'end_f': 2040,
        'caption': 'SEVA SKILL PASSPORT',
        'subtitle': 'Learn. Practise. Prove Your Skills. — https://skillpassport17.vercel.app',
        'bg1': 'verify',
        'bg2': None,
        'split_f': 1935,
    },
]

# -----------------------------------------------------------------------------
# Frame Rendering Logic
# -----------------------------------------------------------------------------
def get_current_scene(frame_num):
    for sc in SCENES:
        if sc['start_f'] <= frame_num < sc['end_f']:
            return sc
    return SCENES[-1]

def apply_subtle_zoom(image, progress, max_zoom=1.03):
    scale = 1.0 + (max_zoom - 1.0) * progress
    w, h = image.size
    new_w = int(w * scale)
    new_h = int(h * scale)
    scaled = image.resize((new_w, new_h), Image.Resampling.BILINEAR)
    crop_x = (new_w - w) // 2
    crop_y = (new_h - h) // 2
    return scaled.crop((crop_x, crop_y, crop_x + w, crop_y + h))

def draw_pill_badge(draw, text, x, y, bg_color=BURGUNDY, text_color=WHITE, font=font_title_badge):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x = 22
    pad_y = 10
    pill_w = tw + pad_x * 2
    pill_h = th + pad_y * 2
    
    # Shadow
    draw.rounded_rectangle([x + 3, y + 3, x + pill_w + 3, y + pill_h + 3], radius=12, fill=(0, 0, 0, 140))
    # Fill
    draw.rounded_rectangle([x, y, x + pill_w, y + pill_h], radius=12, fill=bg_color, outline=GOLD, width=2)
    # Text
    draw.text((x + pad_x, y + pad_y - 2), text, font=font, fill=text_color)
    return pill_w, pill_h

def render_frame(f):
    scene = get_current_scene(f)
    scene_len = scene['end_f'] - scene['start_f']
    progress = (f - scene['start_f']) / max(1, scene_len)
    
    # Select background image based on split_f
    if scene['bg2'] is not None and f >= scene['split_f']:
        bg_key = scene['bg2']
        sub_progress = (f - scene['split_f']) / max(1, scene['end_f'] - scene['split_f'])
    else:
        bg_key = scene['bg1']
        split = scene['split_f'] if scene['bg2'] else scene['end_f']
        sub_progress = (f - scene['start_f']) / max(1, split - scene['start_f'])

    base_img = screens[bg_key]
    
    # If final closing part of scene 8, create high-impact closing brand card
    if scene['id'] == 8 and f >= scene['split_f']:
        frame = Image.new('RGB', (WIDTH, HEIGHT), DARK_BG)
        f_draw = ImageDraw.Draw(frame)
        
        # Subtle vignette / glow
        for r in range(400, 0, -20):
            alpha = int(25 * (1.0 - r / 400))
            f_draw.ellipse([WIDTH//2 - r*2, HEIGHT//2 - r, WIDTH//2 + r*2, HEIGHT//2 + r], fill=(88, 12, 35, alpha))
            
        # Draw logo centered
        logo_x = (WIDTH - logo_resized.width) // 2
        logo_y = 300
        frame.paste(logo_resized, (logo_x, logo_y), logo_resized)
        
        # Main Tagline
        t1 = "SEVA SKILL PASSPORT"
        b1 = f_draw.textbbox((0, 0), t1, font=font_title_hero)
        w1 = b1[2] - b1[0]
        f_draw.text(((WIDTH - w1) // 2, 420), t1, font=font_title_hero, fill=WHITE)
        
        # Motto
        t2 = "Learn. Practise. Prove Your Skills."
        b2 = f_draw.textbbox((0, 0), t2, font=font_tagline)
        w2 = b2[2] - b2[0]
        f_draw.text(((WIDTH - w2) // 2, 500), t2, font=font_tagline, fill=GOLD_BRIGHT)
        
        # Divider line
        f_draw.line([(WIDTH//2 - 200, 570), (WIDTH//2 + 200, 570)], fill=GOLD, width=2)
        
        # URL
        t3 = "https://skillpassport17.vercel.app"
        b3 = f_draw.textbbox((0, 0), t3, font=font_url)
        w3 = b3[2] - b3[0]
        f_draw.text(((WIDTH - w3) // 2, 600), t3, font=font_url, fill=CREAM)
        
        # Micro badge
        t4 = "OFFICIAL SEVA FIRST 2026 INNOVATION CHALLENGE PROTOTYPE"
        b4 = f_draw.textbbox((0, 0), t4, font=font_watermark)
        w4 = b4[2] - b4[0]
        f_draw.text(((WIDTH - w4) // 2, 670), t4, font=font_watermark, fill=TEXT_MUTED)
        
        return frame

    # Apply gentle motion
    frame = apply_subtle_zoom(base_img, sub_progress, max_zoom=1.025)
    draw = ImageDraw.Draw(frame)
    
    # -------------------------------------------------------------------------
    # Top Bar: Brand Watermark & Verified Badge
    # -------------------------------------------------------------------------
    # Glassmorphism Top Banner
    top_bar = Image.new('RGBA', (WIDTH, 70), (15, 23, 42, 210))
    frame.paste(Image.alpha_composite(frame.crop((0, 0, WIDTH, 70)).convert('RGBA'), top_bar).convert('RGB'), (0, 0))
    
    draw_top = ImageDraw.Draw(frame)
    # Small Logo in top bar
    sm_logo_h = 36
    sm_logo_w = int(sm_logo_h * logo_aspect)
    sm_logo = logo_img.resize((sm_logo_w, sm_logo_h), Image.Resampling.LANCZOS)
    frame.paste(sm_logo, (40, 17), sm_logo)
    
    # Right-hand verification watermark
    watermark_text = "SEVA FIRST 2026  •  AUTHENTIC LEARNER JOURNEY  •  ₹100 COMPLETE ACCESS"
    wb = draw_top.textbbox((0, 0), watermark_text, font=font_watermark)
    ww = wb[2] - wb[0]
    draw_top.text((WIDTH - ww - 40, 26), watermark_text, font=font_watermark, fill=GOLD_BRIGHT)
    
    # -------------------------------------------------------------------------
    # Scene Caption Badge (Top Left, below bar)
    # -------------------------------------------------------------------------
    draw_pill_badge(draw, scene['caption'], 40, 90, bg_color=BURGUNDY, text_color=WHITE, font=font_title_badge)
    
    # -------------------------------------------------------------------------
    # Bottom Subtitle Bar (High-Contrast Glassmorphic Subtitle Strip)
    # -------------------------------------------------------------------------
    bar_h = 75
    sub_strip = Image.new('RGBA', (WIDTH, bar_h), (10, 15, 26, 225))
    frame.paste(Image.alpha_composite(frame.crop((0, HEIGHT - bar_h, WIDTH, HEIGHT)).convert('RGBA'), sub_strip).convert('RGB'), (0, HEIGHT - bar_h))
    
    draw_bot = ImageDraw.Draw(frame)
    # Gold accent line on top of bottom bar
    draw_bot.line([(0, HEIGHT - bar_h), (WIDTH, HEIGHT - bar_h)], fill=GOLD, width=3)
    
    # Subtitle text centered
    st_text = scene['subtitle']
    sb = draw_bot.textbbox((0, 0), st_text, font=font_subtitle)
    sw = sb[2] - sb[0]
    draw_bot.text(((WIDTH - sw) // 2, HEIGHT - bar_h + 22), st_text, font=font_subtitle, fill=WHITE)
    
    return frame

# -----------------------------------------------------------------------------
# Audio Assembly & Synchronization
# -----------------------------------------------------------------------------
def build_audio_track():
    print(f"Building synchronized audio track ({TOTAL_DURATION}s)...")
    
    # Use ambient score bed
    music_src = 'video-production/audio/ambient_score.wav'
    if not os.path.exists(music_src):
        music_src = 'scripts/video-assets/audio/master_soundtrack.wav'
        
    sfx_whoosh = 'scripts/video-assets/audio/sfx/whoosh.wav'
    sfx_chime = 'scripts/video-assets/audio/sfx/success_chime.wav'
    sfx_click = 'scripts/video-assets/audio/sfx/ui_click.wav'
    
    # Construct ffmpeg audio mix filter
    # Music bed trimmed to 68s with fade-in and fade-out at -15dB volume
    # Add subtle sfx at scene transition points (0s, 8s, 16s, 24.5s, 32.5s, 41.5s, 50.5s, 60.5s)
    cmd = [
        'ffmpeg', '-y',
        '-ss', '0', '-t', str(TOTAL_DURATION), '-i', music_src,
        '-i', sfx_whoosh,
        '-i', sfx_click,
        '-i', sfx_chime,
        '-filter_complex',
        (
            f"[0:a]volume=0.35,afade=t=in:st=0:d=1.5,afade=t=out:st={TOTAL_DURATION - 2.5}:d=2.5[music];"
            f"[1:a]adelay=8000|8000,volume=0.4[w1];"
            f"[2:a]adelay=16000|16000,volume=0.5[c1];"
            f"[1:a]adelay=24500|24500,volume=0.4[w2];"
            f"[2:a]adelay=32500|32500,volume=0.4[c2];"
            f"[3:a]adelay=46000|46000,volume=0.6[chime1];"
            f"[3:a]adelay=55000|55000,volume=0.6[chime2];"
            f"[music][w1][c1][w2][c2][chime1][chime2]amix=inputs=7:duration=first:dropout_transition=2[aout]"
        ),
        '-map', '[aout]',
        '-c:a', 'pcm_s16le',
        '-ar', '48000',
        TEMP_AUDIO
    ]
    
    subprocess.run(cmd, check=True)
    print(f"  ✓ Audio track generated: {TEMP_AUDIO}")

# -----------------------------------------------------------------------------
# Main Video Encoding Pipeline
# -----------------------------------------------------------------------------
def main():
    print(f"\n=======================================================")
    print(f"SEVA SKILL PASSPORT — REAL PRODUCT DEMO VIDEO ENCODER")
    print(f"Resolution: {WIDTH}x{HEIGHT} @ {FPS}fps")
    print(f"Duration: {TOTAL_DURATION}s ({TOTAL_FRAMES} frames)")
    print(f"Target File: {FINAL_MP4}")
    print(f"=======================================================\n")
    
    # 1. Build Audio
    build_audio_track()
    
    # 2. Launch ffmpeg video encoding subprocess
    ffmpeg_cmd = [
        'ffmpeg', '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f"{WIDTH}x{HEIGHT}",
        '-pix_fmt', 'rgb24',
        '-r', str(FPS),
        '-i', '-', # Pipe input
        '-i', TEMP_AUDIO,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        FINAL_MP4
    ]
    
    print("Launching ffmpeg video pipe...")
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    
    # 3. Stream frames
    print("Rendering and piping video frames...")
    last_print = 0
    for f in range(TOTAL_FRAMES):
        frame_img = render_frame(f)
        proc.stdin.write(frame_img.tobytes())
        
        if f - last_print >= 150 or f == TOTAL_FRAMES - 1:
            pct = (f + 1) / TOTAL_FRAMES * 100
            sec = (f + 1) / FPS
            print(f"  Frame {f+1}/{TOTAL_FRAMES} ({pct:.1f}%) — {sec:.1f}s / {TOTAL_DURATION}s")
            last_print = f
            
    proc.stdin.close()
    proc.wait()
    
    if proc.returncode != 0:
        print(f"\n✗ Error: ffmpeg exited with code {proc.returncode}")
        sys.exit(1)
        
    file_size_mb = os.path.getsize(FINAL_MP4) / (1024 * 1024)
    print(f"\n=======================================================")
    print(f"DEMO VIDEO SUCCESSFULLY EXPORTED!")
    print(f"File: {FINAL_MP4}")
    print(f"Size: {file_size_mb:.2f} MB")
    print(f"Duration: {TOTAL_DURATION} seconds (1920x1080 @ 30fps H.264/AAC)")
    print(f"=======================================================\n")

if __name__ == '__main__':
    main()
