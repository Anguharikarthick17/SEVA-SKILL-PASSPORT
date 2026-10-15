"""
render-cinematic-film.py
Renders the complete 179-second 1080p 30fps documentary film for SEVA Skill Passport:
- 9 fully crafted scenes
- Automatic live localhost website captures with smooth camera movement
- Real case study photograph of consultative field meeting with officer
- Official transparent logo and Team OG branding
- Vertical semi-transparent watermark: TEAM OG | OPPORTUNITY & GROWTH
- Synchronized professional subtitle bar
- Piped directly into FFmpeg with master audio mix
"""
import os, sys, time, json, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

OUTPUT_DIR = 'video-production'
FINAL_MP4 = os.path.join(OUTPUT_DIR, 'SEVA_SKILL_PASSPORT_OFFICIAL_FILM.mp4')
AUDIO_PATH = os.path.join(OUTPUT_DIR, 'audio', 'master_audio.wav')
SRT_PATH = os.path.join(OUTPUT_DIR, 'seva_skill_passport.srt')

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_DURATION = 179.0 # seconds
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 5370 frames

print(f"Initializing video renderer: {WIDTH}x{HEIGHT} @ {FPS}fps, Total Frames = {TOTAL_FRAMES}")

# Load Fonts
FONT_HEADING = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_BODY = '/System/Library/Fonts/Supplemental/Arial.ttf'
FONT_SERIF = '/System/Library/Fonts/Supplemental/Georgia.ttf'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_title_lg = get_font(FONT_HEADING, 52)
font_title_md = get_font(FONT_HEADING, 38)
font_title_sm = get_font(FONT_HEADING, 26)
font_body_lg  = get_font(FONT_BODY, 28)
font_body_md  = get_font(FONT_BODY, 22)
font_body_sm  = get_font(FONT_BODY, 18)
font_sub_bold = get_font(FONT_HEADING, 24)
font_watermark = get_font(FONT_HEADING, 15)

# Brand Colors
BURGUNDY = (136, 19, 55)
WARM_CREAM = (255, 253, 247)
SOFT_ROSE = (255, 228, 230)
ANTIQUE_GOLD = (202, 138, 4)
PURE_WHITE = (255, 255, 255)
DARK_ESPRESSO = (28, 13, 18)
MUTED_TEXT = (107, 78, 86)
BORDER_GOLD = (202, 138, 4, 180)

# Load Source Assets
logo_img = Image.open('public/images/seva-skill-passport-logo-transparent.png').convert('RGBA')
case_study_img = Image.open('public/images/case-study-investigation.png').convert('RGB')

# Load Live Web Captures
screen_welcome = Image.open('video-production/raw-captures/00_welcome_intro.png').convert('RGB')
screen_hero = Image.open('video-production/raw-captures/01_homepage_hero.png').convert('RGB')
screen_onboarding = Image.open('video-production/raw-captures/06_onboarding_choose.png').convert('RGB')
screen_dashboard = Image.open('video-production/raw-captures/09_student_dashboard.png').convert('RGB')
screen_verify = Image.open('video-production/raw-captures/12_verification_portal.png').convert('RGB')

# Parse Subtitles
def parse_srt(filepath):
    events = []
    if not os.path.exists(filepath):
        return events
    with open(filepath, 'r', encoding='utf-8') as f:
        blocks = f.read().strip().split('\n\n')
    for b in blocks:
        lines = b.split('\n')
        if len(lines) >= 3:
            time_parts = lines[1].split(' --> ')
            def to_secs(s):
                h, m, sec_ms = s.strip().split(':')
                sec, ms = sec_ms.split(',')
                return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000.0
            st = to_secs(time_parts[0])
            en = to_secs(time_parts[1])
            text = " ".join(lines[2:])
            events.append({"start": st, "end": en, "text": text})
    return events

subtitles = parse_srt(SRT_PATH)
print(f"Loaded {len(subtitles)} subtitle cues.")

# Pre-render Watermark Stamp (Semi-transparent vertical text: TEAM OG | OPPORTUNITY & GROWTH)
watermark_h = 360
watermark_w = 40
wm_canvas = Image.new('RGBA', (watermark_h, watermark_w), (0, 0, 0, 0))
wm_draw = ImageDraw.Draw(wm_canvas)
wm_draw.text((10, 8), "TEAM OG  |  OPPORTUNITY & GROWTH", fill=(136, 19, 55, 110), font=font_watermark)
watermark_vertical = wm_canvas.rotate(90, expand=True)

# Helper: Smoothstep interpolation
def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

# Scene Boundaries (in seconds)
# Scene 1: 0.0 - 15.5
# Scene 2: 15.5 - 39.5
# Scene 3: 39.5 - 64.0
# Scene 4: 64.0 - 80.0
# Scene 5: 80.0 - 107.0
# Scene 6: 107.0 - 130.0
# Scene 7: 130.0 - 151.5
# Scene 8: 151.5 - 170.5
# Scene 9: 170.5 - 179.0
TIMELINES = [
    (0.0, 15.5),
    (15.5, 39.5),
    (39.5, 64.0),
    (64.0, 80.0),
    (80.0, 107.0),
    (107.0, 130.0),
    (130.0, 151.5),
    (151.5, 170.5),
    (170.5, 179.0),
]

def render_frame(t):
    """Renders a single 1920x1080 frame at time t (seconds)."""
    # 1. Base Warm Cream Background with subtle radial ambient bloom
    frame = Image.new('RGB', (WIDTH, HEIGHT), WARM_CREAM)
    draw = ImageDraw.Draw(frame, 'RGBA')

    # Draw gentle background gradients
    draw.ellipse([WIDTH//2 - 700, HEIGHT//2 - 400, WIDTH//2 + 700, HEIGHT//2 + 400], fill=(255, 228, 230, 90))

    # Identify current scene
    scene_idx = 0
    for idx, (st, en) in enumerate(TIMELINES):
        if st <= t < en or (idx == len(TIMELINES)-1 and t >= st):
            scene_idx = idx
            break

    scene_st, scene_en = TIMELINES[scene_idx]
    s_t = t - scene_st # time inside scene
    s_dur = scene_en - scene_st

    # ==========================================
    # SCENE 1: CINEMATIC OPENING (0.0 - 15.5s)
    # ==========================================
    if scene_idx == 0:
        if s_t < 6.0:
            # Part A: Editorial typography card
            card_alpha = int(255 * smoothstep(0.0, 0.8, s_t))
            draw.rounded_rectangle([260, 320, 1660, 720], radius=24, fill=(255, 255, 255, 220), outline=(136, 19, 55, 40), width=2)
            
            # Text lines
            draw.text((WIDTH//2, 420), "Learning is important.", fill=DARK_ESPRESSO, font=font_title_lg, anchor='mm')
            draw.text((WIDTH//2, 510), "But how do we prove what we can actually do?", fill=BURGUNDY, font=font_title_md, anchor='mm')
            
            # Gold divider line
            line_w = int(240 * smoothstep(1.0, 2.2, s_t))
            draw.line([(WIDTH//2 - line_w, 580), (WIDTH//2 + line_w, 580)], fill=ANTIQUE_GOLD, width=3)
            
            draw.text((WIDTH//2, 630), "SEVA SKILL PASSPORT  •  PROJECT EXPLAINER", fill=MUTED_TEXT, font=font_body_sm, anchor='mm')
        else:
            # Part B: Official Logo reveal + Team OG attribution
            logo_progress = smoothstep(6.0, 7.5, s_t)
            scale = 0.94 + 0.06 * logo_progress
            lw = int(720 * scale)
            lh = int((lw / logo_img.width) * logo_img.height)
            resized_logo = logo_img.resize((lw, lh), Image.Resampling.LANCZOS)
            
            frame.paste(resized_logo, (WIDTH//2 - lw//2, 280), resized_logo)
            
            # Titles
            draw.text((WIDTH//2, 540), "PROOF OF COURSE  →  PROOF OF ABILITY", fill=BURGUNDY, font=font_title_md, anchor='mm')
            
            # Gold decorative rule
            line_w = int(320 * smoothstep(7.5, 9.0, s_t))
            draw.line([(WIDTH//2 - line_w, 610), (WIDTH//2 + line_w, 610)], fill=ANTIQUE_GOLD, width=3)
            
            draw.text((WIDTH//2, 670), "POWERED BY TEAM OG  —  OPPORTUNITY & GROWTH", fill=DARK_ESPRESSO, font=font_title_sm, anchor='mm')
            draw.text((WIDTH//2, 730), "Working Prototype  •  Evidence-Backed Engineering Ability", fill=MUTED_TEXT, font=font_body_md, anchor='mm')

    # ==========================================
    # SCENE 2: THE REAL-WORLD PROBLEM (15.5 - 39.5s)
    # ==========================================
    elif scene_idx == 1:
        # Header Badge
        draw.rounded_rectangle([WIDTH//2 - 380, 50, WIDTH//2 + 380, 110], radius=16, fill=(136, 19, 55, 230))
        draw.text((WIDTH//2, 80), "THE REAL-WORLD PROBLEM: THE CREDENTIAL GAP", fill=PURE_WHITE, font=font_title_sm, anchor='mm')

        # Split screen cards
        # Left Card: COURSE COMPLETED
        draw.rounded_rectangle([120, 150, 920, 890], radius=24, fill=(255, 255, 255, 240), outline=(136, 19, 55, 50), width=2)
        draw.rounded_rectangle([160, 190, 880, 260], radius=12, fill=(136, 19, 55, 20))
        draw.text((520, 225), "COURSE COMPLETED", fill=BURGUNDY, font=font_title_md, anchor='mm')
        
        # Left card bullets
        y_pos = 320
        points_left = [
            ("✓", "Attendance & Lecture Completion Verified"),
            ("✓", "Hours of Passive Video Material Logged"),
            ("✗", "Zero Practical Code Artifacts Preserved"),
            ("✗", "Architectural Decision-Making Invisible"),
            ("✗", "Edge Case & Error Handling Untested"),
            ("✗", "No Cryptographic Proof of Personal Authorship")
        ]
        for icon, text in points_left:
            col = BURGUNDY if icon == "✓" else (180, 30, 30)
            draw.text((180, y_pos), icon, fill=col, font=font_title_sm)
            draw.text((230, y_pos + 2), text, fill=DARK_ESPRESSO, font=font_body_md)
            y_pos += 85

        # Right Card: SKILL DEMONSTRATED?
        draw.rounded_rectangle([1000, 150, 1800, 890], radius=24, fill=(255, 255, 255, 240), outline=(202, 138, 4, 80), width=2)
        draw.rounded_rectangle([1040, 190, 1760, 260], radius=12, fill=(202, 138, 4, 25))
        draw.text((1400, 225), "SKILL DEMONSTRATED?", fill=ANTIQUE_GOLD, font=font_title_md, anchor='mm')
        
        y_pos = 320
        points_right = [
            ("?", "Can the candidate build production database schemas?"),
            ("?", "How was code structured under concurrency?"),
            ("?", "Were security and authorization policies verified?"),
            ("!", "Employers require tangible execution evidence."),
            ("!", "Traditional certificates leave evaluators guessing."),
            ("★", "SEVA Skill Passport bridges this critical divide.")
        ]
        for icon, text in points_right:
            col = ANTIQUE_GOLD if icon in ["?", "★"] else (136, 19, 55)
            draw.text((1060, y_pos), icon, fill=col, font=font_title_sm)
            draw.text((1110, y_pos + 2), text, fill=DARK_ESPRESSO, font=font_body_md)
            y_pos += 85

    # ==========================================
    # SCENE 3: CASE STUDY & FIELD INVESTIGATION (39.5 - 64.0s)
    # ==========================================
    elif scene_idx == 2:
        # Subtle Ken Burns zoom on genuine photo
        zoom = 1.0 + 0.10 * (s_t / s_dur)
        cw, ch = int(1920 * zoom), int(1080 * zoom)
        
        # Fit case study photo aspect ratio
        aspect = case_study_img.width / case_study_img.height
        target_h = ch
        target_w = int(target_h * aspect)
        if target_w < cw:
            target_w = cw
            target_h = int(target_w / aspect)
            
        scaled_cs = case_study_img.resize((target_w, target_h), Image.Resampling.BILINEAR)
        # Pan gently towards the desk
        pan_x = int((target_w - 1920) * 0.45)
        pan_y = int((target_h - 1080) * 0.35)
        crop_box = (pan_x, pan_y, pan_x + 1920, pan_y + 1080)
        cs_frame = scaled_cs.crop(crop_box)
        frame.paste(cs_frame, (0, 0))

        # Re-attach draw on frame
        draw = ImageDraw.Draw(frame, 'RGBA')

        # Cinematic Vignette Overlay
        draw.rectangle([0, 0, 1920, 1080], fill=(0, 0, 0, 45))
        draw.rectangle([0, 0, 1920, 180], fill=(0, 0, 0, 75))
        draw.rectangle([0, 700, 1920, 1080], fill=(0, 0, 0, 140))

        # Top Badge: CASE STUDY / PROBLEM INVESTIGATION
        draw.rounded_rectangle([100, 60, 680, 130], radius=14, fill=(136, 19, 55, 230), outline=(202, 138, 4, 200), width=2)
        draw.text((390, 95), "CASE STUDY / PROBLEM INVESTIGATION", fill=PURE_WHITE, font=font_title_sm, anchor='mm')

        # Lower-third banner
        draw.rounded_rectangle([100, 750, 1820, 930], radius=20, fill=(28, 13, 18, 220), outline=(202, 138, 4, 180), width=2)
        draw.text((140, 785), "FIELD INVESTIGATION — ADMINISTRATIVE & ACADEMIC CONSULTATION", fill=ANTIQUE_GOLD, font=font_title_sm)
        draw.text((140, 835), "Direct consultative exploration with government administrative officer and academic mentors.", fill=PURE_WHITE, font=font_body_lg)
        draw.text((140, 880), "Key Finding: Evaluators demand tamper-proof, authentic evidence artifacts—not just completion metrics.", fill=SOFT_ROSE, font=font_body_md)

    # ==========================================
    # SCENE 4: INTRODUCING OUR SOLUTION (64.0 - 80.0s)
    # ==========================================
    elif scene_idx == 3:
        # Title Card
        draw.text((WIDTH//2, 120), "INTRODUCING SEVA SKILL PASSPORT", fill=BURGUNDY, font=font_title_lg, anchor='mm')
        draw.text((WIDTH//2, 180), "From Course Completion to Practical Skill Evidence", fill=MUTED_TEXT, font=font_title_sm, anchor='mm')
        
        # Center Logo
        lw = 480
        lh = int((lw / logo_img.width) * logo_img.height)
        resized_logo = logo_img.resize((lw, lh), Image.Resampling.LANCZOS)
        frame.paste(resized_logo, (WIDTH//2 - lw//2, 230), resized_logo)

        # 3 Pillar Cards
        pillars = [
            ("01. PROJECT-BASED SANDBOXES", "Integrated browser workspaces for hands-on full-stack coding, real test suites, and authentic execution."),
            ("02. EVIDENCE-BACKED RUBRICS", "Multi-dimensional evaluation measuring code architecture, performance, edge cases, and genuine ability."),
            ("03. CRYPTOGRAPHIC PASSPORT", "Immutable evidence records sealed with SHA-256 hashes, instantly inspectable by hiring teams.")
        ]
        
        card_w = 520
        card_h = 360
        starts = [120, 700, 1280]
        for idx, (p_title, p_desc) in enumerate(pillars):
            x = starts[idx]
            y = 440
            draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=20, fill=(255, 255, 255, 240), outline=(136, 19, 55, 60), width=2)
            draw.rounded_rectangle([x + 20, y + 25, x + card_w - 20, y + 95], radius=12, fill=(136, 19, 55, 15))
            draw.text((x + card_w//2, y + 60), p_title, fill=BURGUNDY, font=font_sub_bold, anchor='mm')
            
            # Body description
            draw.multiline_text((x + 35, y + 130), p_desc, fill=DARK_ESPRESSO, font=font_body_md, spacing=10)
            draw.rounded_rectangle([x + 35, y + 280, x + card_w - 35, y + 325], radius=10, fill=(202, 138, 4, 25))
            draw.text((x + card_w//2, y + 302), "VERIFIED CAPABILITY ARTIFACT", fill=ANTIQUE_GOLD, font=font_body_sm, anchor='mm')

    # ==========================================
    # SCENE 5: LIVE PROTOTYPE WALKTHROUGH (80.0 - 107.0s)
    # ==========================================
    elif scene_idx == 4:
        # Multi-cut sequence of actual localhost screenshots
        shots = [
            (0.0, 5.4, screen_welcome, "[ 01 LIVE SYSTEM ] OFFICIAL WELCOME INTRO & BRANDING"),
            (5.4, 10.8, screen_hero, "[ 02 INTERFACE ] HOMEPAGE & ADAPTIVE NAVIGATION"),
            (10.8, 16.2, screen_onboarding, "[ 03 WORKFLOW ] COURSE SELECTION & ONE-CLICK DEMO ACCESS"),
            (16.2, 21.6, screen_dashboard, "[ 04 STUDENT PORTAL ] ARJUN SHARMA — 68% VERIFIED PROGRESS"),
            (21.6, 27.0, screen_verify, "[ 05 PROOF ENGINE ] CRYPTOGRAPHIC EVIDENCE VERIFICATION")
        ]
        
        cur_shot = shots[-1]
        for shot in shots:
            if shot[0] <= s_t < shot[1]:
                cur_shot = shot
                break
                
        shot_st, shot_en, shot_img, shot_label = cur_shot
        shot_progress = (s_t - shot_st) / (shot_en - shot_st)
        
        # Subtle drift zoom
        scale = 1.00 + 0.04 * shot_progress
        sw, sh = int(1920 * scale), int(1080 * scale)
        scaled_shot = shot_img.resize((sw, sh), Image.Resampling.BILINEAR)
        ox = (sw - 1920) // 2
        oy = (sh - 1080) // 2
        frame.paste(scaled_shot.crop((ox, oy, ox + 1920, oy + 1080)), (0, 0))

        # Re-attach draw
        draw = ImageDraw.Draw(frame, 'RGBA')
        
        # Top Live Label Badge
        draw.rounded_rectangle([100, 50, 880, 115], radius=14, fill=(28, 13, 18, 220), outline=(202, 138, 4, 180), width=2)
        draw.text((130, 82), shot_label, fill=ANTIQUE_GOLD, font=font_title_sm)

        # Bottom Live Status Bar
        draw.rounded_rectangle([100, 880, 1820, 940], radius=12, fill=(28, 13, 18, 200))
        draw.text((130, 910), "ACTUAL SYSTEM FOOTAGE  •  RUNNING ON LOCALHOST:3000  •  WORKING PROTOTYPE", fill=PURE_WHITE, font=font_body_sm)

    # ==========================================
    # SCENE 6: EXISTING APPROACHES & OUR UNIQUENESS (107.0 - 130.0s)
    # ==========================================
    elif scene_idx == 5:
        # Title
        draw.text((WIDTH//2, 100), "A UNIFIED CONTINUUM: CONNECTING LEARNING TO EVIDENCE", fill=BURGUNDY, font=font_title_md, anchor='mm')
        draw.text((WIDTH//2, 150), "Acknowledging Existing Tools While Connecting Every Step into One Journey", fill=MUTED_TEXT, font=font_body_md, anchor='mm')

        # 4 Step Continuum Cards
        steps = [
            ("1. COURSE LEARNING", "Guided curriculum modules, technical documentation, and concept foundations.", "(Existing LMS focus)"),
            ("2. PRACTICAL ACTIVITIES", "Interactive in-browser sandboxes for code execution, debugging, and live feedback.", "(Code Sandboxes)"),
            ("3. ASSESSMENTS & EVIDENCE", "Real capstone builds, algorithmic benchmarks, and rubric score calibration.", "(Portfolios & Badges)"),
            ("4. SKILL PASSPORT", "Unified immutable profile communicating demonstrated ability with SHA-256 proof.", "(SEVA Innovation)")
        ]
        
        card_w = 380
        card_h = 480
        gap = 40
        total_w = 4 * card_w + 3 * gap
        start_x = (WIDTH - total_w) // 2
        y = 220
        
        for idx, (stitle, sdesc, stag) in enumerate(steps):
            x = start_x + idx * (card_w + gap)
            is_seva = (idx == 3)
            bg_col = (255, 255, 255, 240) if not is_seva else (255, 248, 240, 250)
            border_col = (136, 19, 55, 50) if not is_seva else (202, 138, 4, 200)
            border_w = 2 if not is_seva else 3
            
            draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=20, fill=bg_col, outline=border_col, width=border_w)
            
            # Step header
            head_bg = (136, 19, 55, 20) if not is_seva else (202, 138, 4, 30)
            head_col = BURGUNDY if not is_seva else ANTIQUE_GOLD
            draw.rounded_rectangle([x + 15, y + 20, x + card_w - 15, y + 90], radius=12, fill=head_bg)
            draw.text((x + card_w//2, y + 55), stitle, fill=head_col, font=font_body_lg, anchor='mm')
            
            draw.multiline_text((x + 25, y + 130), sdesc, fill=DARK_ESPRESSO, font=font_body_md, spacing=12)
            
            # Tag pill at bottom
            draw.rounded_rectangle([x + 25, y + 400, x + card_w - 25, y + 450], radius=10, fill=(28, 13, 18, 15))
            draw.text((x + card_w//2, y + 425), stag, fill=MUTED_TEXT if not is_seva else ANTIQUE_GOLD, font=font_body_sm, anchor='mm')
            
            # Connecting arrow to next card
            if idx < 3:
                arrow_x = x + card_w + 12
                draw.text((arrow_x, y + 240), "➔", fill=ANTIQUE_GOLD, font=font_title_sm)

        # Bottom Callout Card
        draw.rounded_rectangle([160, 770, 1760, 850], radius=16, fill=(136, 19, 55, 15), outline=(136, 19, 55, 40))
        draw.text((WIDTH//2, 810), "SEVA does not replace existing achievements—it binds learning records to undeniable engineering proof.", fill=BURGUNDY, font=font_body_lg, anchor='mm')

    # ==========================================
    # SCENE 7: TECHNOLOGY STACK & ARCHITECTURE (130.0 - 151.5s)
    # ==========================================
    elif scene_idx == 6:
        draw.text((WIDTH//2, 90), "VERIFIED TECHNOLOGY STACK & ARCHITECTURE", fill=BURGUNDY, font=font_title_md, anchor='mm')
        draw.text((WIDTH//2, 135), "Engineered for Performance, Security & Cryptographic Integrity", fill=MUTED_TEXT, font=font_body_md, anchor='mm')

        # Architecture Flow Diagram
        flow_nodes = [
            ("LEARNER", "Browser Session"),
            ("NEXT.JS 14", "App Router / React"),
            ("SUPABASE", "PostgreSQL / RLS"),
            ("SANDBOXES", "Isolated Code Eval"),
            ("EVIDENCE HASH", "SHA-256 Ledger")
        ]
        
        node_w = 280
        node_h = 130
        node_gap = 60
        flow_total_w = 5 * node_w + 4 * node_gap
        fx_start = (WIDTH - flow_total_w) // 2
        fy = 190
        
        for idx, (n_title, n_sub) in enumerate(flow_nodes):
            nx = fx_start + idx * (node_w + node_gap)
            draw.rounded_rectangle([nx, fy, nx + node_w, fy + node_h], radius=16, fill=(255, 255, 255, 240), outline=(136, 19, 55, 60), width=2)
            draw.text((nx + node_w//2, fy + 45), n_title, fill=BURGUNDY, font=font_body_lg, anchor='mm')
            draw.text((nx + node_w//2, fy + 85), n_sub, fill=MUTED_TEXT, font=font_body_sm, anchor='mm')
            if idx < 4:
                draw.text((nx + node_w + 18, fy + 50), "➔", fill=ANTIQUE_GOLD, font=font_title_sm)

        # Tech Stack Badges (6 verified components)
        tech_cards = [
            ("Next.js 14 & React", "Modern App Router architecture separating server logic and dynamic client transitions."),
            ("TypeScript 5", "End-to-end static typing enforcing bulletproof data models across all services."),
            ("Tailwind CSS", "Harmonious Warm Cream and Burgundy design tokens providing responsive aesthetics."),
            ("Supabase & PostgreSQL", "Declarative Row-Level Security (RLS) guaranteeing strict student data isolation."),
            ("SHA-256 Hashing Engine", "Immutable cryptographic hashes sealing project builds and test results."),
            ("Payment Engine Safeguards", "Strict ₹100 individual course pricing model with HMAC-verified webhook protection.")
        ]
        
        tc_w = 480
        tc_h = 180
        for idx, (ttitle, tdesc) in enumerate(tech_cards):
            col = idx % 3
            row = idx // 3
            cx = 160 + col * (tc_w + 50)
            cy = 380 + row * (tc_h + 30)
            draw.rounded_rectangle([cx, cy, cx + tc_w, cy + tc_h], radius=16, fill=(255, 255, 255, 240), outline=(202, 138, 4, 70), width=2)
            draw.text((cx + 25, cy + 30), ttitle, fill=BURGUNDY, font=font_sub_bold)
            draw.multiline_text((cx + 25, cy + 70), tdesc, fill=DARK_ESPRESSO, font=font_body_sm, spacing=6)

        # Development Note Banner
        draw.rounded_rectangle([360, 810, 1560, 875], radius=14, fill=(28, 13, 18, 220), outline=(202, 138, 4, 180))
        draw.text((WIDTH//2, 842), "“Developed iteratively as a working prototype.”", fill=PURE_WHITE, font=font_body_lg, anchor='mm')

    # ==========================================
    # SCENE 8: POTENTIAL IMPACT, ROADMAP & TEAM (151.5 - 170.5s)
    # ==========================================
    elif scene_idx == 7:
        draw.text((WIDTH//2, 80), "POTENTIAL IMPACT & DEVELOPMENT ROADMAP", fill=BURGUNDY, font=font_title_md, anchor='mm')
        draw.text((WIDTH//2, 125), "Clearer Skill Evidence • Practical Learning • Verified Ability", fill=MUTED_TEXT, font=font_body_md, anchor='mm')

        # Left Column: INTENDED BENEFITS
        draw.rounded_rectangle([120, 170, 920, 770], radius=22, fill=(255, 255, 255, 240), outline=(136, 19, 55, 50), width=2)
        draw.rounded_rectangle([160, 205, 880, 275], radius=12, fill=(136, 19, 55, 20))
        draw.text((520, 240), "INTENDED IMPACT", fill=BURGUNDY, font=font_title_sm, anchor='mm')
        
        b_items = [
            ("Clearer Skill Evidence:", "Moving beyond unverified claims into inspectable code repositories and test metrics."),
            ("Practical Learning:", "Students engage in authentic sandbox execution rather than passive multiple-choice."),
            ("Streamlined Evaluation:", "Academic mentors and hiring teams inspect cryptographic proof in seconds."),
            ("Standardized Portability:", "A single passport verifying ability across universities and employers.")
        ]
        by = 310
        for b_head, b_body in b_items:
            draw.text((160, by), "• " + b_head, fill=BURGUNDY, font=font_body_md)
            draw.multiline_text((180, by + 32), b_body, fill=DARK_ESPRESSO, font=font_body_sm, spacing=4)
            by += 105

        # Right Column: 5-STEP ROADMAP
        draw.rounded_rectangle([1000, 170, 1800, 770], radius=22, fill=(255, 255, 255, 240), outline=(202, 138, 4, 80), width=2)
        draw.rounded_rectangle([1040, 205, 1760, 275], radius=12, fill=(202, 138, 4, 25))
        draw.text((1400, 240), "FUTURE ROADMAP", fill=ANTIQUE_GOLD, font=font_title_sm, anchor='mm')
        
        roadmap_items = [
            ("1. Prototype Validation:", "Iterative user experience testing across live tracks."),
            ("2. Learner & Educator Cohorts:", "Field trials gathering direct curriculum feedback."),
            ("3. Advanced Assessment Workflows:", "Automated test suites & peer review grading."),
            ("4. Secure Credential Infrastructure:", "Enterprise-grade credential issuance & revoke."),
            ("5. Institutional Adoption:", "Formal pilot exploration with universities.")
        ]
        ry = 300
        for r_step, r_desc in roadmap_items:
            draw.text((1040, ry), r_step, fill=ANTIQUE_GOLD, font=font_body_md)
            draw.text((1040, ry + 30), r_desc, fill=DARK_ESPRESSO, font=font_body_sm)
            ry += 90

        # Team OG Lower Card
        draw.rounded_rectangle([WIDTH//2 - 420, 800, WIDTH//2 + 420, 870], radius=16, fill=(28, 13, 18, 230), outline=(202, 138, 4, 200), width=2)
        draw.text((WIDTH//2, 835), "TEAM OG  —  OPPORTUNITY & GROWTH", fill=PURE_WHITE, font=font_title_sm, anchor='mm')

    # ==========================================
    # SCENE 9: FINAL BRAND REVEAL (170.5 - 179.0s)
    # ==========================================
    elif scene_idx == 8:
        # Fade to black in final 0.8 seconds
        fade_factor = 1.0
        if s_t > 7.7:
            fade_factor = max(0.0, 1.0 - (s_t - 7.7) / 0.8)

        # Center official logo
        lw = 680
        lh = int((lw / logo_img.width) * logo_img.height)
        resized_logo = logo_img.resize((lw, lh), Image.Resampling.LANCZOS)
        frame.paste(resized_logo, (WIDTH//2 - lw//2, 270), resized_logo)

        draw.text((WIDTH//2, 530), "SEVA SKILL PASSPORT", fill=BURGUNDY, font=font_title_lg, anchor='mm')
        draw.text((WIDTH//2, 600), "Proof of Course  →  Proof of Ability.", fill=ANTIQUE_GOLD, font=font_title_sm, anchor='mm')
        
        # Expanding Gold Line
        line_w = int(340 * smoothstep(0.0, 1.5, s_t))
        draw.line([(WIDTH//2 - line_w, 645), (WIDTH//2 + line_w, 645)], fill=ANTIQUE_GOLD, width=3)

        draw.text((WIDTH//2, 695), "TEAM OG  —  OPPORTUNITY & GROWTH", fill=DARK_ESPRESSO, font=font_sub_bold, anchor='mm')
        draw.text((WIDTH//2, 755), "“Building a clearer bridge between learning and demonstrated ability.”", fill=MUTED_TEXT, font=font_body_lg, anchor='mm')

        if fade_factor < 1.0:
            black_overlay = Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0))
            frame = Image.blend(frame, black_overlay, 1.0 - fade_factor)
            draw = ImageDraw.Draw(frame, 'RGBA')

    # ==========================================
    # GLOBAL OVERLAYS (Watermark, Subtitles, Progress)
    # ==========================================
    
    # 1. Subtle Chapter Progress Line at top
    progress_ratio = t / TOTAL_DURATION
    draw.line([(0, 2), (int(WIDTH * progress_ratio), 2)], fill=ANTIQUE_GOLD, width=4)

    # 2. Team OG Vertical Side Watermark (semi-transparent near right edge)
    frame.paste(watermark_vertical, (1875, HEIGHT//2 - watermark_h//2), watermark_vertical)

    # 3. Synchronized Subtitle Pill (if active subtitle)
    active_sub = None
    for sub in subtitles:
        if sub["start"] <= t <= sub["end"]:
            active_sub = sub
            break
            
    if active_sub:
        text = active_sub["text"]
        # Render clean pill badge
        sub_box_w = min(1500, int(len(text) * 16 + 80))
        sub_box_h = 56
        if "\n" in text:
            sub_box_h = 80
        sub_x = (WIDTH - sub_box_w) // 2
        sub_y = 960
        
        draw.rounded_rectangle([sub_x, sub_y, sub_x + sub_box_w, sub_y + sub_box_h], radius=16, fill=(28, 13, 18, 205), outline=(202, 138, 4, 120), width=1)
        draw.multiline_text((WIDTH//2, sub_y + sub_box_h//2), text, fill=PURE_WHITE, font=font_sub_bold, anchor='mm', align='center', spacing=6)

    return frame

print("Starting FFmpeg pipeline for final export...")
# Launch FFmpeg process reading rawvideo from stdin
ffmpeg_cmd = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}',
    '-pix_fmt', 'rgb24',
    '-r', str(FPS),
    '-i', '-', # video stdin
    '-i', AUDIO_PATH, # master audio
    '-c:v', 'h264_videotoolbox',
    '-b:v', '6500k',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    FINAL_MP4
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

t0 = time.time()
print(f"Rendering {TOTAL_FRAMES} frames...")

for frame_idx in range(TOTAL_FRAMES):
    t_sec = frame_idx / FPS
    img = render_frame(t_sec)
    proc.stdin.write(img.tobytes())
    
    if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
        elapsed = time.time() - t0
        fps_actual = (frame_idx + 1) / max(elapsed, 0.001)
        remaining = (TOTAL_FRAMES - frame_idx - 1) / max(fps_actual, 0.001)
        print(f"Frame {frame_idx + 1}/{TOTAL_FRAMES} ({t_sec:.1f}s) | Speed: {fps_actual:.1f} fps | ETA: {remaining:.1f}s")

proc.stdin.close()
proc.wait()

print(f"Render complete in {time.time() - t0:.1f}s!")
print(f"Output video saved to: {FINAL_MP4}")
size_bytes = os.path.getsize(FINAL_MP4)
print(f"Final MP4 Size: {size_bytes / (1024*1024):.2f} MB")
