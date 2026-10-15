#!/usr/bin/env python3
"""
SEVA Skill Passport — Cinematic Full-Width Hero Background Video
1920x1080 @ 30fps Full HD (450 Frames = 15.00 Seconds Seamless Loop)

Specially composed for full-width background treatment:
- Left zone (0 to 860px) is calm, warm cream with subtle ambient blooms (zero text collision with hero headline)
- Right zone (860 to 1860px) showcases high-energy After Effects motion graphics:
  * Stage 1: Continuous 5-stage roadmap & glowing nodes
  * Stage 2: Curriculum architecture & real video player + AI tutor card
  * Stage 3: Dark IDE code editor with automated sandbox test runner passing
  * Stage 4: Proctored competency gauges, streaming evidence tokens & SHA-256 ledger
- Muted H.264 MP4 with faststart, optimized for instant browser playback
"""
import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 450 # 15.00 seconds

# Brand Colors
C_CREAM = (255, 253, 240)
C_CHIFFON = (255, 250, 205)
C_MILAN = (184, 17, 4)
C_MILAN_BRIGHT = (217, 28, 11)
C_ESPRESSO = (26, 12, 8)
C_MUTED = (110, 85, 77)
C_WHITE = (255, 255, 255)
C_GREEN = (16, 185, 129)
C_DARK_BG = (22, 10, 7)

def clamp(val, min_v=0.0, max_v=1.0):
    return max(min_v, min(max_v, val))

def ease_out_expo(t):
    t = clamp(t)
    return 1.0 if t >= 1.0 else 1.0 - math.pow(2.0, -10.0 * t)

def ease_out_back(t, s=1.4):
    t = clamp(t) - 1.0
    return t * t * ((s + 1.0) * t + s) + 1.0

def ease_in_out_cubic(t):
    t = clamp(t)
    return 4.0 * t * t * t if t < 0.5 else 0.5 * math.pow(2.0 * t - 2.0, 3) + 1.0

# Fonts
def get_font(size, bold=False):
    path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/HelveticaNeue.ttc'
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size)
        except Exception:
            return ImageFont.load_default()

font_h1 = get_font(48, bold=True)
font_h2 = get_font(34, bold=True)
font_h3 = get_font(26, bold=True)
font_body = get_font(20, bold=False)
font_badge = get_font(17, bold=True)
font_code = get_font(18, bold=False)
font_mono = get_font(15, bold=False)

# Load cropped UI snippets
crop_dir = "scripts/video-assets/crops"
crops = {
    'video': Image.open(f"{crop_dir}/crop_video_player.png").convert('RGB'),
    'project': Image.open(f"{crop_dir}/crop_project_card.png").convert('RGB'),
    'ledger': Image.open(f"{crop_dir}/crop_evidence_ledger.png").convert('RGB'),
}

def draw_grid_background(img):
    d = ImageDraw.Draw(img)
    dot_color = (242, 232, 222)
    for x in range(30, WIDTH, 45):
        for y in range(30, HEIGHT, 45):
            d.ellipse([(x, y), (x + 2, y + 2)], fill=dot_color)

def draw_vector_card(img, x, y, w, h, radius=22, bg=C_WHITE, border=C_MILAN, border_w=2, shadow=True):
    d = ImageDraw.Draw(img)
    if shadow:
        d.rounded_rectangle([(x - 4, y + 4), (x + w + 4, y + h + 10)], radius=radius + 3, fill=(238, 226, 215))
        d.rounded_rectangle([(x - 2, y + 2), (x + w + 2, y + h + 5)], radius=radius + 1, fill=(244, 235, 225))
    d.rounded_rectangle([(x, y), (x + w, y + h)], radius=radius, fill=bg, outline=border, width=border_w)

def draw_bottom_pathway(img, active_stage=1, glow_pulse=0.0):
    """Draws the continuous 5-stage roadmap across the lower canvas."""
    d = ImageDraw.Draw(img)
    y_pos = 980
    stages = [(1, "LEARN"), (2, "PRACTISE"), (3, "BUILD"), (4, "ASSESS"), (5, "VERIFY")]
    xs = [380, 680, 980, 1280, 1580]
    
    # Connecting line
    d.line([(xs[0], y_pos), (xs[-1], y_pos)], fill=(225, 215, 205), width=4)
    active_line_x = xs[active_stage - 1]
    d.line([(xs[0], y_pos), (active_line_x, y_pos)], fill=C_MILAN, width=5)
    
    r = 20
    for idx, (num, label) in enumerate(stages):
        cx = xs[idx]
        if num < active_stage:
            d.ellipse([(cx - r, y_pos - r), (cx + r, y_pos + r)], fill=C_GREEN, outline=C_WHITE, width=2)
            pts = [(cx - 6, y_pos - 1), (cx - 2, y_pos + 5), (cx + 7, y_pos - 5)]
            d.line(pts, fill=C_WHITE, width=2, joint="curve")
        elif num == active_stage:
            glow_r = int(r + 10 * (0.8 + 0.2 * math.sin(glow_pulse)))
            d.ellipse([(cx - glow_r, y_pos - glow_r), (cx + glow_r, y_pos + glow_r)], fill=(255, 230, 225))
            d.ellipse([(cx - r, y_pos - r), (cx + r, y_pos + r)], fill=C_MILAN, outline=C_WHITE, width=3)
            d.text((cx - 5, y_pos - 10), str(num), font=font_badge, fill=C_WHITE)
            d.text((cx - 32, y_pos + 26), label, font=font_badge, fill=C_MILAN)
        else:
            d.ellipse([(cx - r, y_pos - r), (cx + r, y_pos + r)], fill=(245, 240, 235), outline=(215, 205, 195), width=2)
            d.text((cx - 5, y_pos - 10), str(num), font=font_badge, fill=C_MUTED)
            d.text((cx - 32, y_pos + 26), label, font=font_badge, fill=C_MUTED)

def render_bg_frame(f):
    frame = Image.new('RGB', (WIDTH, HEIGHT), C_CREAM)
    draw_grid_background(frame)
    d = ImageDraw.Draw(frame)
    
    # Ambient red glow blooms on the right
    t_cycle = (f / 75.0) % (2 * math.pi)
    glow_x = int(1450 + 60 * math.sin(t_cycle))
    glow_y = int(320 + 40 * math.cos(t_cycle))
    d.ellipse([(glow_x - 320, glow_y - 320), (glow_x + 320, glow_y + 320)], fill=(255, 238, 225))
    d.ellipse([(1550, 750), (1920, 1100)], fill=(255, 246, 218))
    
    # -------------------------------------------------------------
    # SECTION 1: LEARN (Frames 0 to 110 / 0.0s - 3.6s)
    # -------------------------------------------------------------
    if f < 110:
        local_f = f
        draw_bottom_pathway(frame, active_stage=1, glow_pulse=f * 0.2)
        
        # Right-side Stage Header Badge
        d.rounded_rectangle([(920, 70), (1160, 106)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((935, 79), "STAGE 01 // LEARN", font=font_badge, fill=C_MILAN)
        d.text((1180, 78), "Structured Lessons & Real AI Tutor", font=font_h3, fill=C_ESPRESSO)
        
        # Right-side Upper Card: Live Studio Video Player
        t_c1 = ease_out_back(min(1.0, local_f / 30.0), s=1.2)
        rx = int(920 + 50 * (1.0 - t_c1))
        rw, rh = 900, 460
        draw_vector_card(frame, rx, 130, rw, rh, radius=24, bg=C_WHITE, border=(225, 210, 200), border_w=2)
        
        # Paste video player snippet
        cropped_v = crops['video'].resize((rw - 20, rh - 20), Image.Resampling.LANCZOS)
        frame.paste(cropped_v, (rx + 10, 140))
        
        # Overlay Pill
        d.rounded_rectangle([(rx + 25, 155), (rx + 340, 195)], radius=10, fill=C_MILAN)
        d.text((rx + 40, 163), "1080p Studio Video Courseware", font=font_badge, fill=C_WHITE)
        
        # Right-side Lower Card: Socratic AI Tutor Card (staggered entrance)
        if local_f > 20:
            t_c2 = ease_out_back(min(1.0, (local_f - 20) / 30.0), s=1.3)
            c2_y = int(620 + 40 * (1.0 - t_c2))
            draw_vector_card(frame, rx, c2_y, rw, 220, radius=20, bg=C_WHITE, border=C_MILAN, border_w=2)
            
            d.ellipse([(rx + 30, c2_y + 24), (rx + 56, c2_y + 50)], fill=C_MILAN)
            d.text((rx + 37, c2_y + 27), "AI", font=font_badge, fill=C_WHITE)
            d.text((rx + 68, c2_y + 27), "REAL SOCRATIC AI TUTOR", font=font_badge, fill=C_MILAN)
            d.rounded_rectangle([(rx + rw - 210, c2_y + 20), (rx + rw - 30, c2_y + 52)], radius=8, fill=(245, 240, 235))
            d.text((rx + rw - 195, c2_y + 27), "Anti-Cheat Guard Active", font=font_mono, fill=C_MUTED)
            
            reply = "Notice how the inner function retains lexical scope access even after the parent execution context terminates."
            chars = int(min(1.0, (local_f - 30) / 45.0) * len(reply))
            d.text((rx + 30, c2_y + 75), reply[:chars], font=font_body, fill=C_ESPRESSO)
            
            # Progress bar
            d.text((rx + 30, c2_y + 140), "Module Progress: 84% Completed", font=font_mono, fill=C_MUTED)
            d.rounded_rectangle([(rx + 30, c2_y + 170), (rx + rw - 30, c2_y + 184)], radius=7, fill=(245, 235, 225))
            d.rounded_rectangle([(rx + 30, c2_y + 170), (rx + int((rw - 60) * 0.84), c2_y + 184)], radius=7, fill=C_MILAN)

    # -------------------------------------------------------------
    # SECTION 2: PRACTISE & BUILD (Frames 110 to 230 / 3.6s - 7.6s)
    # -------------------------------------------------------------
    elif f < 230:
        local_f = f - 110
        draw_bottom_pathway(frame, active_stage=2 if local_f < 60 else 3, glow_pulse=f * 0.2)
        
        # Stage Header
        d.rounded_rectangle([(920, 70), (1240, 106)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((935, 79), "STAGE 02 & 03 // PRACTISE & BUILD", font=font_badge, fill=C_MILAN)
        d.text((1260, 78), "Live Sandbox Labs & Real GitHub Projects", font=font_h3, fill=C_ESPRESSO)
        
        # Left sub-panel on right half: Terminal Code Editor
        t_p1 = ease_out_back(min(1.0, local_f / 30.0), s=1.2)
        rx = int(920 + 40 * (1.0 - t_p1))
        pw = 460
        ph = 710
        draw_vector_card(frame, rx, 130, pw, ph, radius=24, bg=C_DARK_BG, border=C_MILAN, border_w=2)
        
        # Terminal top
        d.rounded_rectangle([(rx, 130), (rx + pw, 175)], radius=24, fill=(35, 18, 14))
        d.rectangle([(rx, 160), (rx + pw, 175)], fill=(35, 18, 14))
        d.ellipse([(rx + 20, 148), (rx + 30, 158)], fill=(255, 95, 86))
        d.ellipse([(rx + 36, 148), (rx + 46, 158)], fill=(255, 189, 46))
        d.ellipse([(rx + 52, 148), (rx + 62, 158)], fill=(39, 201, 63))
        d.text((rx + 80, 144), "sandbox :: test_engine.ts", font=font_mono, fill=(220, 190, 180))
        
        # Code lines
        code_lines = [
            ("01", "import { Sandbox } from '@seva/core';", (200, 140, 130)),
            ("02", "export async function testScope() {", (255, 250, 205)),
            ("03", "  const env = new Sandbox();", (255, 255, 255)),
            ("04", "  const res = await env.run(task);", (255, 255, 255)),
            ("05", "  expect(res.leaks).toBe(0);", (255, 250, 205)),
            ("06", "}", (255, 250, 205)),
        ]
        y_c = 195
        for ln_num, ln_txt, ln_col in code_lines:
            d.text((rx + 20, y_c), ln_num, font=font_code, fill=C_MILAN)
            d.text((rx + 55, y_c), ln_txt, font=font_code, fill=ln_col)
            y_c += 28
            
        # Test Runner inside Left Sub-panel
        d.line([(rx, 410), (rx + pw, 410)], fill=(60, 30, 25), width=2)
        d.text((rx + 20, 428), "AUTOMATED TEST ASSERTIONS", font=font_badge, fill=C_MILAN_BRIGHT)
        
        test_items = [
            ("✓ PASS", "test_memory_isolation (12ms)", local_f > 15),
            ("✓ PASS", "test_event_concurrency (18ms)", local_f > 35),
            ("✓ PASS", "test_gc_stability (24ms)", local_f > 55),
        ]
        y_t = 465
        for st, desc, vis in test_items:
            if vis:
                d.text((rx + 20, y_t), st, font=font_code, fill=C_GREEN)
                d.text((rx + 90, y_t), desc, font=font_code, fill=(230, 220, 210))
            y_t += 28
            
        if local_f > 65:
            d.rounded_rectangle([(rx + 20, 630), (rx + pw - 20, 680)], radius=12, fill=C_GREEN)
            d.text((rx + 110, 646), "ALL 14 TESTS PASSING", font=font_badge, fill=C_WHITE)
            
        # Right sub-panel: Capstone Project Card
        t_p2 = ease_out_back(min(1.0, max(0.0, (local_f - 20)) / 30.0), s=1.2)
        px = int(1410 + 40 * (1.0 - t_p2))
        draw_vector_card(frame, px, 130, 440, ph, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        cropped_p = crops['project'].resize((410, 320), Image.Resampling.LANCZOS)
        frame.paste(cropped_p, (px + 15, 145))
        
        # Project Rubric Card Details
        d.rounded_rectangle([(px + 15, 490), (px + 425, 685)], radius=16, fill=(255, 250, 246), outline=(225, 215, 205), width=1)
        d.text((px + 30, 508), "CAPSTONE PROJECT EVALUATION", font=font_badge, fill=C_MILAN)
        d.text((px + 30, 545), "Distributed Skill Ledger", font=font_h3, fill=C_ESPRESSO)
        d.text((px + 30, 585), "• Architecture Score: 96/100", font=font_body, fill=C_ESPRESSO)
        d.text((px + 30, 615), "• Test Coverage: 98.4% Verified", font=font_body, fill=C_ESPRESSO)
        d.text((px + 30, 645), "• GitHub Repo: Verified Clean", font=font_mono, fill=C_GREEN)

    # -------------------------------------------------------------
    # SECTION 3: ASSESS & VERIFY (Frames 230 to 350 / 7.6s - 11.6s)
    # -------------------------------------------------------------
    elif f < 350:
        local_f = f - 230
        draw_bottom_pathway(frame, active_stage=4 if local_f < 60 else 5, glow_pulse=f * 0.2)
        
        # Stage Header
        d.rounded_rectangle([(920, 70), (1240, 106)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((935, 79), "STAGE 04 & 05 // ASSESS & VERIFY", font=font_badge, fill=C_MILAN)
        d.text((1260, 78), "Proctored Testing & SHA-256 Skill Passport", font=font_h3, fill=C_ESPRESSO)
        
        # Right Half: Assessment & Verification Display
        t_a1 = ease_out_back(min(1.0, local_f / 30.0), s=1.2)
        rx = int(920 + 40 * (1.0 - t_a1))
        rw, rh = 930, 710
        draw_vector_card(frame, rx, 130, rw, rh, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        # Competency Header
        d.text((rx + 35, 160), "COMPETENCY EVALUATION INDEX", font=font_badge, fill=C_MILAN)
        d.text((rx + 35, 200), "Overall Competency: 92/100", font=font_h2, fill=C_ESPRESSO)
        
        # 4 Verified Dimension Bars
        dims = [
            ("React & Next.js Architecture", 0.94, "94%"),
            ("Backend API & Distributed Systems", 0.89, "89%"),
            ("Database Tuning & SQL Models", 0.92, "92%"),
            ("Security & Proctored Integrity", 0.96, "96%"),
        ]
        for d_idx, (d_name, d_score, d_str) in enumerate(dims):
            dy = 265 + d_idx * 75
            d.text((rx + 35, dy), d_name, font=font_body, fill=C_ESPRESSO)
            d.text((rx + rw - 90, dy), d_str, font=font_badge, fill=C_MILAN)
            
            d.rounded_rectangle([(rx + 35, dy + 28), (rx + rw - 35, dy + 40)], radius=6, fill=(245, 238, 230))
            score_bar_prog = ease_out_expo(min(1.0, max(0.0, (local_f - 10 - d_idx * 8)) / 25.0))
            active_w = int((rw - 70) * d_score * score_bar_prog)
            d.rounded_rectangle([(rx + 35, dy + 28), (rx + 35 + active_w, dy + 40)], radius=6, fill=C_MILAN)
            
        # Cryptographic Hash Seal Box below
        d.rounded_rectangle([(rx + 35, 570), (rx + rw - 35, 700)], radius=18, fill=(255, 248, 245), outline=C_MILAN, width=2)
        d.text((rx + 55, 590), "IMMUTABLE EVIDENCE LEDGER", font=font_badge, fill=C_MILAN)
        d.rounded_rectangle([(rx + 55, 620), (rx + rw - 55, 660)], radius=8, fill=C_WHITE, outline=(225, 210, 200), width=1)
        d.text((rx + 70, 630), "🔒 SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b", font=font_mono, fill=C_MILAN)
        d.text((rx + 55, 672), "✓ Validated by Academic Sandbox Engine • Instant Public Verification", font=font_body, fill=C_ESPRESSO)

    # -------------------------------------------------------------
    # SECTION 4: FINAL BRAND EMBLEM (Frames 350 to 450 / 11.6s - 15.0s)
    # -------------------------------------------------------------
    else:
        local_f = f - 350
        draw_bottom_pathway(frame, active_stage=5, glow_pulse=f * 0.2)
        
        # Right Half: Central Emblem Composition
        cx = 1380
        cy = 440
        
        # Ambient radiating circle
        bloom_r = int(220 + 20 * math.sin(local_f * 0.1))
        d.ellipse([(cx - bloom_r, cy - bloom_r), (cx + bloom_r, cy + bloom_r)], fill=(255, 238, 225))
        d.ellipse([(cx - 140, cy - 140), (cx + 140, cy + 140)], fill=(255, 248, 215))
        
        # Shield Emblem
        t_logo = ease_out_back(min(1.0, local_f / 30.0), s=1.5)
        r = int(65 * t_logo)
        d.rounded_rectangle([(cx - r, cy - 120 - r), (cx + r, cy - 120 + r)], radius=28, fill=C_MILAN, outline=C_WHITE, width=4)
        pts = [(cx - 24, cy - 120 - 2), (cx - 6, cy - 120 + 16), (cx + 26, cy - 120 - 16)]
        d.line(pts, fill=C_WHITE, width=8, joint="curve")
        
        # Title
        t_txt = "SEVA SKILL PASSPORT"
        bbox_t = d.textbbox((0, 0), t_txt, font=font_h1)
        tw = bbox_t[2] - bbox_t[0]
        d.text((cx - tw // 2, cy - 20), t_txt, font=font_h1, fill=C_MILAN)
        
        # Tagline
        sub_txt = "Learn Skills. Build Ability. Prove What You Can Do."
        bbox_s = d.textbbox((0, 0), sub_txt, font=font_h3)
        sw = bbox_s[2] - bbox_s[0]
        d.text((cx - sw // 2, cy + 45), sub_txt, font=font_h3, fill=C_ESPRESSO)
        
        # 4 Badges on the right
        badges = [
            ("16 In-Depth Modules", "Full Stack Curriculum"),
            ("100% Practical Labs", "Real Repositories"),
            ("SHA-256 Verified", "Tamper-Proof Evidence"),
            ("Academic Innovation", "Proposed Research Model"),
        ]
        by = cy + 120
        for b_idx, (b_title, b_sub) in enumerate(badges):
            bx = 960 + (b_idx % 2) * 440
            b_row_y = by + (b_idx // 2) * 90
            d.rounded_rectangle([(bx, b_row_y), (bx + 410, b_row_y + 75)], radius=16, fill=C_WHITE, outline=C_MILAN, width=2)
            d.text((bx + 20, b_row_y + 14), b_title, font=font_badge, fill=C_MILAN)
            d.text((bx + 20, b_row_y + 40), b_sub, font=font_mono, fill=C_MUTED)

    return frame

def main():
    os.makedirs('public/videos', exist_ok=True)
    hero_bg_mp4 = 'public/videos/seva-hero-bg.mp4'
    hero_bg_poster = 'public/videos/seva-hero-bg-poster.webp'
    
    # 1. Export poster (at frame 40 - Stage 1 overview)
    print("Exporting hero background poster...")
    poster_frame = render_bg_frame(40)
    poster_frame.save(hero_bg_poster, 'WEBP', quality=90)
    print(f"Saved hero bg poster: {hero_bg_poster}")
    
    # 2. Render Hero Background MP4 (450 frames @ 30fps)
    print(f"Rendering hero background MP4: {TOTAL_FRAMES} frames @ {FPS} fps...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-an", # Muted background video
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        hero_bg_mp4
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for f in range(TOTAL_FRAMES):
        img = render_bg_frame(f)
        proc.stdin.write(img.tobytes())
        if f % 75 == 0:
            print(f"Hero bg progress: {f}/{TOTAL_FRAMES} frames ({(f/TOTAL_FRAMES)*100:.1f}%)")
            
    proc.stdin.close()
    proc.wait()
    if proc.returncode != 0:
        print("Hero bg render failed:", proc.stderr.read().decode())
        sys.exit(1)
    print(f"Rendered hero background video: {hero_bg_mp4}")

if __name__ == '__main__':
    main()
