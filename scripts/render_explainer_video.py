#!/usr/bin/env python3
"""
SEVA Skill Passport — 30-Second Explainer Video Master Generator
Broadcast Quality 1920x1080 @ 30fps (900 Frames)
Renders real UI captures with cinematic camera moves, callout badges, and brand graphics.
"""
import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 900 # exactly 30.0 seconds

# Colors
C_CREAM = (255, 253, 240)
C_CHIFFON = (255, 250, 205)
C_MILAN = (184, 17, 4)
C_MILAN_BRIGHT = (217, 28, 11)
C_ESPRESSO = (26, 12, 8)
C_MUTED = (110, 85, 77)
C_WHITE = (255, 255, 255)
C_CARD_BG = (255, 255, 255)
C_BORDER = (230, 215, 195)
C_GOLD = (245, 158, 11)

# Load fonts
def get_font(size, bold=False):
    path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/HelveticaNeue.ttc'
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size)
        except Exception:
            return ImageFont.load_default()

font_title_hero = get_font(56, bold=True)
font_title = get_font(42, bold=True)
font_subtitle = get_font(24, bold=False)
font_badge = get_font(18, bold=True)
font_card_head = get_font(28, bold=True)
font_card_body = get_font(20, bold=False)
font_tagline = get_font(34, bold=True)
font_url = get_font(16, bold=False)

# Load authentic screenshot assets
asset_dir = 'scripts/video-assets'
screens = {
    'courses': Image.open(f'{asset_dir}/01_learn_courses.png').convert('RGB'),
    'learning': Image.open(f'{asset_dir}/02_learn_learning.png').convert('RGB'),
    'practice': Image.open(f'{asset_dir}/03_practise_lab.png').convert('RGB'),
    'projects': Image.open(f'{asset_dir}/04b_projects_hub.png').convert('RGB'),
    'assess': Image.open(f'{asset_dir}/05b_assess_catalog.png').convert('RGB'),
    'passport': Image.open(f'{asset_dir}/06_verify_passport.png').convert('RGB'),
    'ledger': Image.open(f'{asset_dir}/07_verify_ledger.png').convert('RGB'),
}

def ease_in_out(t):
    return 0.5 * (1.0 - math.cos(math.pi * max(0.0, min(1.0, t))))

def draw_window_frame(img, x, y, w, h, title="SEVA Skill Passport • Platform"):
    """Draws a premium macOS browser window with traffic lights, URL bar and shadow."""
    d = ImageDraw.Draw(img)
    # Window shadow
    shadow_pad = 8
    d.rounded_rectangle([(x - shadow_pad, y - shadow_pad), (x + w + shadow_pad, y + h + shadow_pad)], radius=24, fill=(235, 222, 210))
    # Window background
    d.rounded_rectangle([(x, y), (x + w, y + h)], radius=20, fill=C_WHITE, outline=C_MILAN, width=2)
    # Header bar
    header_h = 44
    d.rounded_rectangle([(x, y), (x + w, y + header_h)], radius=20, fill=(250, 245, 240))
    d.rectangle([(x, y + header_h - 10), (x + w, y + header_h)], fill=(250, 245, 240)) # flatten bottom corners of header
    d.line([(x, y + header_h), (x + w, y + header_h)], fill=(225, 210, 200), width=1)
    
    # Traffic lights
    d.ellipse([(x + 20, y + 16), (x + 32, y + 28)], fill=(255, 95, 86))
    d.ellipse([(x + 40, y + 16), (x + 52, y + 28)], fill=(255, 189, 46))
    d.ellipse([(x + 60, y + 16), (x + 72, y + 28)], fill=(39, 201, 63))
    
    # URL Pill
    url_w = 460
    url_x = x + (w - url_w) // 2
    d.rounded_rectangle([(url_x, y + 10), (url_x + url_w, y + 34)], radius=8, fill=(240, 235, 228), outline=(215, 200, 190), width=1)
    d.text((url_x + 30, y + 14), title, font=font_url, fill=C_MUTED)
    # Padlock icon
    d.rectangle([(url_x + 14, y + 19), (url_x + 22, y + 27)], fill=C_MILAN)

def draw_badge(img, x, y, text, variant="red"):
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0, 0), text, font=font_badge)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pw = 18
    ph = 8
    if variant == "red":
        bg = (255, 242, 240)
        border = C_MILAN
        fg = C_MILAN
    elif variant == "gold":
        bg = (254, 243, 199)
        border = (217, 119, 6)
        fg = (180, 83, 9)
    else:
        bg = C_WHITE
        border = (200, 190, 180)
        fg = C_ESPRESSO
    
    d.rounded_rectangle([(x, y), (x + tw + pw*2, y + th + ph*2)], radius=12, fill=bg, outline=border, width=2)
    # dot
    d.ellipse([(x + 12, y + ph + th//2 - 4), (x + 20, y + ph + th//2 + 4)], fill=border)
    d.text((x + 26, y + ph), text, font=font_badge, fill=fg)
    return tw + pw*2

def draw_floating_callout(img, x, y, title, subtitle):
    d = ImageDraw.Draw(img)
    w = 420
    h = 90
    d.rounded_rectangle([(x - 4, y - 4), (x + w + 4, y + h + 4)], radius=18, fill=(245, 230, 220))
    d.rounded_rectangle([(x, y), (x + w, y + h)], radius=16, fill=C_WHITE, outline=C_MILAN, width=2)
    d.rectangle([(x, y), (x + 8, y + h)], fill=C_MILAN)
    d.text((x + 24, y + 18), title, font=font_badge, fill=C_MILAN)
    d.text((x + 24, y + 46), subtitle, font=font_subtitle, fill=C_ESPRESSO)

def draw_shield_logo(img, cx, cy, size=120):
    """Draws the official SEVA red shield logo with internal white emblem."""
    d = ImageDraw.Draw(img)
    r = size // 2
    # Outer glow
    d.ellipse([(cx - r - 15, cy - r - 15), (cx + r + 15, cy + r + 15)], fill=(255, 230, 225))
    # Red Shield
    d.rounded_rectangle([(cx - r, cy - r), (cx + r, cy + r)], radius=28, fill=C_MILAN, outline=(255, 255, 255), width=3)
    # White checkmark / emblem
    pts = [(cx - 24, cy - 2), (cx - 6, cy + 18), (cx + 26, cy - 18)]
    d.line(pts, fill=C_WHITE, width=8, joint="curve")

def render_frame(f_idx):
    """Renders frame index f_idx (0 to 899)."""
    # Base background: warm cream with subtle gradient
    base = Image.new('RGB', (WIDTH, HEIGHT), C_CREAM)
    d = ImageDraw.Draw(base)
    
    # Ambient red glow blooms
    t_cycle = (f_idx / 90.0) % (2 * math.pi)
    glow_x = int(1400 + 80 * math.sin(t_cycle))
    glow_y = int(240 + 50 * math.cos(t_cycle))
    d.ellipse([(glow_x - 300, glow_y - 300), (glow_x + 300, glow_y + 300)], fill=(255, 240, 230))
    d.ellipse([(200, 700), (700, 1100)], fill=(255, 248, 220))
    
    # ----------------------------------------------------
    # SCENE 1: THE CHALLENGE (0s - 4.0s / Frames 0 - 120)
    # ----------------------------------------------------
    if f_idx < 120:
        prog = f_idx / 120.0
        alpha_in = min(1.0, f_idx / 25.0)
        alpha_out = min(1.0, (120 - f_idx) / 25.0)
        scene_alpha = min(alpha_in, alpha_out)
        
        # Subtle light sweep
        sweep_x = int(prog * (WIDTH + 600) - 300)
        d.line([(sweep_x, 0), (sweep_x + 250, HEIGHT)], fill=(255, 255, 245), width=40)
        
        # Header Badge
        draw_badge(base, 100, 120, "ACADEMIC INNOVATION PLATFORM", variant="red")
        
        # Headline
        d.text((100, 180), "Learning is the beginning.", font=font_title_hero, fill=C_ESPRESSO)
        d.text((100, 260), "Bridging courses to proven, verifiable engineering capability.", font=font_subtitle, fill=C_MUTED)
        
        # Visual Comparison Cards
        # Left card: Traditional courses (Certificates without proof)
        left_y = int(360 - 15 * (1.0 - ease_in_out(min(1.0, f_idx / 30.0))))
        d.rounded_rectangle([(100, left_y), (850, left_y + 440)], radius=20, fill=(248, 244, 240), outline=(225, 215, 205), width=2)
        d.text((150, left_y + 40), "TRADITIONAL ONLINE COURSES", font=font_badge, fill=C_MUTED)
        d.text((150, left_y + 80), "Passive Certificates", font=font_card_head, fill=C_ESPRESSO)
        d.text((150, left_y + 130), "• Completed video lectures\n• No authentic project verification\n• Self-reported resumes\n• High employer skepticism", font=font_card_body, fill=C_MUTED, spacing=16)
        d.rounded_rectangle([(150, left_y + 340), (420, left_y + 390)], radius=10, fill=(235, 225, 215))
        d.text((180, left_y + 355), "✕ Unverified Claims", font=font_badge, fill=(160, 60, 50))
        
        # Right card: SEVA Skill Passport (Glowing Milan Red & Chiffon)
        right_y = int(340 - 20 * (1.0 - ease_in_out(min(1.0, f_idx / 35.0))))
        d.rounded_rectangle([(920, right_y), (1820, right_y + 470)], radius=24, fill=C_WHITE, outline=C_MILAN, width=3)
        # Red top accent strip
        d.rounded_rectangle([(920, right_y), (1820, right_y + 16)], radius=24, fill=C_MILAN)
        d.rectangle([(920, right_y + 8), (1820, right_y + 16)], fill=C_MILAN)
        
        d.text((980, right_y + 45), "SEVA SKILL PASSPORT METHODOLOGY", font=font_badge, fill=C_MILAN)
        d.text((980, right_y + 85), "Proven Competency & Evidence", font=font_title, fill=C_ESPRESSO)
        d.text((980, right_y + 145), "• 16 Industry Modules with Real AI Tutoring\n• Hands-On Practical Coding Labs\n• Production GitHub Capstone Projects\n• Proctored Anti-Cheat Assessments\n• SHA-256 Tamper-Proof Skill Passport", font=font_card_body, fill=C_ESPRESSO, spacing=14)
        
        # Verified Badge Pill
        d.rounded_rectangle([(980, right_y + 380), (1450, right_y + 435)], radius=12, fill=(255, 242, 240), outline=C_MILAN, width=2)
        d.text((1010, right_y + 397), "✓ Cryptographically Verified Evidence", font=font_badge, fill=C_MILAN)
        
        # Bottom Progression Indicator
        d.text((100, 920), "PLATFORM PROGRESSION :", font=font_badge, fill=C_MUTED)
        stages = ["1. LEARN", "2. PRACTISE", "3. BUILD", "4. ASSESS", "5. VERIFY"]
        for s_idx, st in enumerate(stages):
            sx = 380 + s_idx * 280
            d.rounded_rectangle([(sx, 910), (sx + 240, 950)], radius=10, fill=C_WHITE if s_idx==0 else (245, 240, 235), outline=C_MILAN if s_idx==0 else (220, 210, 200), width=2 if s_idx==0 else 1)
            d.text((sx + 30, 922), st, font=font_badge, fill=C_MILAN if s_idx==0 else C_MUTED)
    
    # ----------------------------------------------------
    # SCENE 2: LEARN (4.0s - 9.0s / Frames 120 - 270)
    # ----------------------------------------------------
    elif f_idx < 270:
        local_f = f_idx - 120
        prog = local_f / 150.0
        
        # Sub-scene cut:
        # 120 - 195: Curriculum view (01_learn_courses.png)
        # 195 - 270: Video & AI Tutor view (02_learn_learning.png)
        
        # Top banner
        draw_badge(base, 100, 60, "STEP 1 : LEARN", variant="red")
        d.text((310, 62), "Learn concepts. Understand the fundamentals.", font=font_card_head, fill=C_ESPRESSO)
        
        win_x = 100
        win_y = 120
        win_w = 1720
        win_h = 860
        header_h = 44
        view_h = win_h - header_h
        
        if local_f < 75:
            # Curriculum Pan
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/courses/full-stack-development")
            sub_prog = local_f / 75.0
            zoom = 1.0 + 0.08 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            pan_y = int(60 * ease_in_out(sub_prog))
            cropped = screens['courses'].crop((0, pan_y, crop_w, pan_y + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Floating Callout
            draw_floating_callout(base, 1220, 180, "STRUCTURED CURRICULUM", "16 In-Depth Full Stack Modules")
            draw_badge(base, 1220, 290, "✓ 145 Progressive Lessons", variant="gold")
            draw_badge(base, 1220, 340, "✓ Industry-Standard Architecture", variant="red")
            
        else:
            # Video & AI Tutor Pan
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/learning • Lesson 01: JavaScript Scope & Closures")
            sub_prog = (local_f - 75) / 75.0
            zoom = 1.05 + 0.06 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            pan_x = int(80 * ease_in_out(sub_prog))
            cropped = screens['learning'].crop((pan_x, 40, pan_x + crop_w, 40 + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Highlight AI Tutor area with callout
            draw_floating_callout(base, 1180, 180, "REAL AI TUTOR", "Context-Aware Socratic Guidance")
            draw_badge(base, 1180, 290, "✓ Grounded on Active Lesson Video", variant="gold")
            draw_badge(base, 1180, 340, "✓ Anti-Cheat Integrity Guardrails", variant="red")
            
            # Highlight border on AI Tutor panel
            d.rounded_rectangle([(win_x + int(win_w * 0.65), win_y + header_h + 20), (win_x + win_w - 20, win_y + win_h - 40)], radius=16, outline=C_MILAN, width=3)
    
    # ----------------------------------------------------
    # SCENE 3: PRACTISE AND BUILD (9.0s - 15.0s / Frames 270 - 450)
    # ----------------------------------------------------
    elif f_idx < 450:
        local_f = f_idx - 270
        prog = local_f / 180.0
        
        # Sub-scene cut:
        # 270 - 360: Practice Lab (03_practise_lab.png)
        # 360 - 450: Projects Hub & Submission (04b_projects_hub.png)
        
        draw_badge(base, 100, 60, "STEP 2 : PRACTISE & BUILD", variant="red")
        d.text((430, 62), "Practise. Build. Test your ability.", font=font_card_head, fill=C_ESPRESSO)
        
        win_x = 100
        win_y = 120
        win_w = 1720
        win_h = 860
        header_h = 44
        view_h = win_h - header_h
        
        if local_f < 90:
            # Interactive Practice Lab
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/practice • Lab 01: Closure Memory Management")
            sub_prog = local_f / 90.0
            zoom = 1.02 + 0.07 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            cropped = screens['practice'].crop((40, 20, 40 + crop_w, 20 + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Floating Callout
            draw_floating_callout(base, 1220, 180, "INTERACTIVE PRACTICE LABS", "Instant Execution & Automated Tests")
            draw_badge(base, 1220, 290, "✓ In-Browser Sandbox Isolation", variant="red")
            draw_badge(base, 1220, 340, "✓ Automated Rubric Scoring", variant="gold")
            
        else:
            # Projects Hub & Real Repository Evaluation
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/projects • Capstone Engineering Workspace")
            sub_prog = (local_f - 90) / 90.0
            zoom = 1.02 + 0.08 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            pan_y = int(70 * ease_in_out(sub_prog))
            cropped = screens['projects'].crop((0, pan_y, crop_w, pan_y + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Floating Callout
            draw_floating_callout(base, 1200, 180, "PRODUCTION PROJECTS", "Real GitHub Repositories")
            draw_badge(base, 1200, 290, "✓ Multi-File Architecture", variant="red")
            draw_badge(base, 1200, 340, "✓ Automated Project Evaluation", variant="gold")
            
            # Highlight border
            d.rounded_rectangle([(win_x + 40, win_y + header_h + 200), (win_x + 950, win_y + header_h + 650)], radius=18, outline=C_MILAN, width=3)
    
    # ----------------------------------------------------
    # SCENE 4: ASSESS AND VERIFY (15.0s - 22.0s / Frames 450 - 660)
    # ----------------------------------------------------
    elif f_idx < 660:
        local_f = f_idx - 450
        prog = local_f / 210.0
        
        # Sub-scene cut:
        # 450 - 540: Assessments (05b_assess_catalog.png)
        # 540 - 660: Skill Passport & Verification Ledger (06_verify_passport.png / 07_verify_ledger.png)
        
        draw_badge(base, 100, 60, "STEP 3 : ASSESS & VERIFY", variant="red")
        d.text((430, 62), "Turn demonstrated ability into shareable evidence.", font=font_card_head, fill=C_ESPRESSO)
        
        win_x = 100
        win_y = 120
        win_w = 1720
        win_h = 860
        header_h = 44
        view_h = win_h - header_h
        
        if local_f < 90:
            # Assessment Evaluation
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/assessments • Proctored Assessment Suite")
            sub_prog = local_f / 90.0
            zoom = 1.02 + 0.06 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            pan_y = int(60 * ease_in_out(sub_prog))
            cropped = screens['assess'].crop((0, pan_y, crop_w, pan_y + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Floating Callout
            draw_floating_callout(base, 1200, 180, "PROCTORED ASSESSMENTS", "Rigorous Competency Validation")
            draw_badge(base, 1200, 290, "✓ Anti-Cheat & Violation Thresholds", variant="red")
            draw_badge(base, 1200, 340, "✓ 24-Hour Cooldown Protection", variant="gold")
            
        else:
            # Verified Skill Passport & SHA-256 Ledger
            draw_window_frame(base, win_x, win_y, win_w, win_h, "https://seva.gov.in/verify • Cryptographic Evidence Ledger")
            sub_prog = (local_f - 90) / 120.0
            zoom = 1.04 + 0.08 * ease_in_out(sub_prog)
            crop_w = int(1920 / zoom)
            crop_h = int(1080 / zoom)
            pan_y = int(80 * ease_in_out(sub_prog))
            cropped = screens['ledger'].crop((20, pan_y, 20 + crop_w, pan_y + crop_h)).resize((win_w, view_h), Image.Resampling.LANCZOS)
            base.paste(cropped, (win_x, win_y + header_h))
            
            # Floating Callout
            draw_floating_callout(base, 1200, 180, "CRYPTOGRAPHIC PASSPORT", "SHA-256 Verified Skill Ledger")
            draw_badge(base, 1200, 290, "✓ Tamper-Proof Evidence Hashes", variant="red")
            draw_badge(base, 1200, 340, "✓ Instant Employer Verification", variant="gold")
            
            # Animated Verification Connection Box
            hash_pulse = int(255 * (0.8 + 0.2 * math.sin(local_f * 0.15)))
            d.rounded_rectangle([(win_x + 60, win_y + header_h + 240), (win_x + 850, win_y + header_h + 380)], radius=18, outline=(184, 17, 4), width=3)
    
    # ----------------------------------------------------
    # SCENE 5: BRAND REVEAL (22.0s - 30.0s / Frames 660 - 900)
    # ----------------------------------------------------
    else:
        local_f = f_idx - 660
        prog = local_f / 240.0
        alpha_in = min(1.0, local_f / 35.0)
        
        # Centerpiece layout
        cx = WIDTH // 2
        cy = 380
        
        # Radiating ambient glow
        glow_r = int(260 + 20 * math.sin(local_f * 0.08))
        d.ellipse([(cx - glow_r, cy - glow_r), (cx + glow_r, cy + glow_r)], fill=(255, 238, 225))
        d.ellipse([(cx - 160, cy - 160), (cx + 160, cy + 160)], fill=(255, 248, 215))
        
        # Shield Logo
        draw_shield_logo(base, cx, cy - 80, size=140)
        
        # Main Brand Title
        brand_text = "SEVA Skill Passport"
        bbox_b = d.textbbox((0, 0), brand_text, font=font_title_hero)
        bw = bbox_b[2] - bbox_b[0]
        d.text((cx - bw // 2, cy + 40), brand_text, font=font_title_hero, fill=C_MILAN)
        
        # Tagline
        tagline = "Learn Skills. Build Ability. Prove What You Can Do."
        bbox_t = d.textbbox((0, 0), tagline, font=font_tagline)
        tw = bbox_t[2] - bbox_t[0]
        d.text((cx - tw // 2, cy + 120), tagline, font=font_tagline, fill=C_ESPRESSO)
        
        # Four Credibility Metric Badges
        metrics = [
            ("16 MODULES", "Full Stack Curriculum"),
            ("100% PRACTICAL", "Projects + Labs"),
            ("SHA-256", "Tamper-Proof Evidence"),
            ("PROPOSED MODEL", "₹100 Research Access")
        ]
        
        card_w = 260
        card_h = 90
        gap = 30
        total_w = len(metrics) * card_w + (len(metrics) - 1) * gap
        start_x = (WIDTH - total_w) // 2
        card_y = cy + 220
        
        for m_idx, (m_val, m_sub) in enumerate(metrics):
            mx = start_x + m_idx * (card_w + gap)
            d.rounded_rectangle([(mx, card_y), (mx + card_w, card_y + card_h)], radius=16, fill=C_WHITE, outline=C_MILAN, width=2)
            d.text((mx + 20, card_y + 18), m_val, font=font_badge, fill=C_MILAN)
            d.text((mx + 20, card_y + 48), m_sub, font=font_subtitle, fill=C_MUTED)
        
        # Official Platform Footer
        d.line([(300, HEIGHT - 100), (WIDTH - 300, HEIGHT - 100)], fill=(230, 215, 200), width=1)
        d.text((cx - 240, HEIGHT - 70), "ACADEMIC RESEARCH INNOVATION PLATFORM • SEVA.EDU", font=font_badge, fill=C_MUTED)
    
    return base

def main():
    os.makedirs('public/videos', exist_ok=True)
    os.makedirs('scripts/video-assets', exist_ok=True)
    
    master_mp4 = 'public/videos/seva-explainer-master.mp4'
    hero_mp4 = 'public/videos/seva-explainer-hero.mp4'
    poster_webp = 'public/videos/seva-explainer-poster.webp'
    audio_path = 'scripts/video-assets/audio/final_audio_master.wav'
    
    # 1. Render and save the high quality poster image (at frame 60 - Scene 1 / Hero representation)
    print("Exporting poster image...")
    poster_frame = render_frame(60)
    poster_frame.save(poster_webp, 'WEBP', quality=92)
    print(f"Saved poster image: {poster_webp}")
    
    # 2. Render Full 30s Master Video with synchronized audio
    print(f"Rendering master video: {TOTAL_FRAMES} frames @ {FPS} fps...")
    cmd_master = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        master_mp4
    ]
    
    proc_master = subprocess.Popen(cmd_master, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for f in range(TOTAL_FRAMES):
        frame_img = render_frame(f)
        proc_master.stdin.write(frame_img.tobytes())
        if f % 150 == 0:
            print(f"Master progress: {f}/{TOTAL_FRAMES} frames ({(f/TOTAL_FRAMES)*100:.1f}%)")
            
    proc_master.stdin.close()
    proc_master.wait()
    if proc_master.returncode != 0:
        print("Master render failed:", proc_master.stderr.read().decode())
        sys.exit(1)
    print(f"Rendered master video: {master_mp4}")
    
    # 3. Create optimized muted hero preview video (e.g. 15-second loop of high-action scenes, optimized size)
    print("Generating optimized hero preview video...")
    # Cut a 15-second loop (450 frames: from Scene 2 & Scene 3 & Scene 4) with subtle compression for fast web loading
    cmd_hero = [
        "ffmpeg", "-y",
        "-ss", "00:00:04",
        "-to", "00:00:19",
        "-i", master_mp4,
        "-an", # muted for hero inline autoplay
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        hero_mp4
    ]
    subprocess.run(cmd_hero, check=True)
    print(f"Generated hero preview video: {hero_mp4}")

if __name__ == '__main__':
    main()
