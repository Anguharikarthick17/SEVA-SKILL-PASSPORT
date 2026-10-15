#!/usr/bin/env python3
"""
SEVA Skill Passport — Phase 10: After Effects-Style Motion Graphics Explainer
1920x1080 @ 30fps Full HD (900 Frames = 30.00 Seconds)

Pure Motion Graphics with:
- Timeline-based animation & kinetic typography
- Animated vector shapes, connecting paths & glowing nodes
- Mask reveals & match cuts
- Smooth camera zooms & parallax depth
- Animated UI cards (code editor, AI tutor, competency gauges, evidence ledger)
- Integrated authentic supporting footage cards
- Sound design mix with voiceover, ambient bed, and Foley SFX
"""
import os
import sys
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 900 # 30.00 seconds

# Brand Colors
C_CREAM = (255, 253, 240)
C_CHIFFON = (255, 250, 205)
C_MILAN = (184, 17, 4)
C_MILAN_BRIGHT = (217, 28, 11)
C_ESPRESSO = (26, 12, 8)
C_MUTED = (110, 85, 77)
C_WHITE = (255, 255, 255)
C_GOLD = (245, 158, 11)
C_GREEN = (16, 185, 129)
C_DARK_BG = (22, 10, 7)

# Easing curves
def clamp(val, min_v=0.0, max_v=1.0):
    return max(min_v, min(max_v, val))

def ease_out_expo(t):
    t = clamp(t)
    return 1.0 if t >= 1.0 else 1.0 - math.pow(2.0, -10.0 * t)

def ease_out_back(t, s=1.5):
    t = clamp(t)
    t = t - 1.0
    return t * t * ((s + 1.0) * t + s) + 1.0

def ease_in_out_cubic(t):
    t = clamp(t)
    if t < 0.5:
        return 4.0 * t * t * t
    else:
        f = (2.0 * t) - 2.0
        return 0.5 * f * f * f + 1.0

def smoothstep(t):
    t = clamp(t)
    return t * t * (3.0 - 2.0 * t)

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

font_hero = get_font(96, bold=True)
font_h1 = get_font(56, bold=True)
font_h2 = get_font(40, bold=True)
font_h3 = get_font(28, bold=True)
font_body = get_font(22, bold=False)
font_badge = get_font(18, bold=True)
font_code = get_font(19, bold=False)
font_mono_sm = get_font(16, bold=False)

# Load cropped supporting footage cards
crop_dir = "scripts/video-assets/crops"
crops = {
    'video': Image.open(f"{crop_dir}/crop_video_player.png").convert('RGB'),
    'tutor': Image.open(f"{crop_dir}/crop_ai_tutor.png").convert('RGB'),
    'code': Image.open(f"{crop_dir}/crop_code_editor.png").convert('RGB'),
    'project': Image.open(f"{crop_dir}/crop_project_card.png").convert('RGB'),
    'ledger': Image.open(f"{crop_dir}/crop_evidence_ledger.png").convert('RGB'),
}

def draw_grid_background(img):
    """Draws a refined ed-tech grid dot matrix on cream background."""
    d = ImageDraw.Draw(img)
    dot_color = (240, 230, 218)
    spacing = 40
    for x in range(20, WIDTH, spacing):
        for y in range(20, HEIGHT, spacing):
            d.ellipse([(x, y), (x + 2, y + 2)], fill=dot_color)

def draw_vector_card(img, x, y, w, h, radius=20, bg=C_WHITE, border=C_MILAN, border_w=2, shadow=True):
    """Draws a premium vector motion card with soft drop shadow."""
    d = ImageDraw.Draw(img)
    if shadow:
        d.rounded_rectangle([(x - 6, y + 4), (x + w + 6, y + h + 12)], radius=radius + 4, fill=(238, 226, 215))
        d.rounded_rectangle([(x - 3, y + 2), (x + w + 3, y + h + 6)], radius=radius + 2, fill=(244, 235, 225))
    d.rounded_rectangle([(x, y), (x + w, y + h)], radius=radius, fill=bg, outline=border, width=border_w)

def draw_pathway_node(img, cx, cy, number, label, state="future", active_glow=0.0):
    """
    Renders a node on the continuous 5-step learning pathway:
    state: "past" (green check), "active" (glowing red), "future" (subtle neutral)
    """
    d = ImageDraw.Draw(img)
    r = 24
    if state == "active":
        glow_r = int(r + 14 * (0.8 + 0.2 * math.sin(active_glow)))
        d.ellipse([(cx - glow_r, cy - glow_r), (cx + glow_r, cy + glow_r)], fill=(255, 228, 222))
        d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=C_MILAN, outline=C_WHITE, width=3)
        # White node number
        d.text((cx - 6, cy - 11), str(number), font=font_badge, fill=C_WHITE)
        # Active label
        d.text((cx - 40, cy + 32), label, font=font_badge, fill=C_MILAN)
    elif state == "past":
        d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=C_GREEN, outline=C_WHITE, width=2)
        # Checkmark
        pts = [(cx - 7, cy - 1), (cx - 2, cy + 6), (cx + 8, cy - 6)]
        d.line(pts, fill=C_WHITE, width=3, joint="curve")
        d.text((cx - 40, cy + 32), label, font=font_badge, fill=C_MUTED)
    else:
        d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=(245, 240, 235), outline=(215, 205, 195), width=2)
        d.text((cx - 6, cy - 11), str(number), font=font_badge, fill=C_MUTED)
        d.text((cx - 40, cy + 32), label, font=font_badge, fill=C_MUTED)

def draw_continuous_pathway(img, active_stage=1, anim_prog=1.0, glow_pulse=0.0, y_pos=960):
    """
    Draws the continuous 5-step learning roadmap at the bottom of the motion graphics canvas:
    [1. LEARN] ──── [2. PRACTISE] ──── [3. BUILD] ──── [4. ASSESS] ──── [5. VERIFY]
    """
    d = ImageDraw.Draw(img)
    stages = [
        (1, "LEARN"),
        (2, "PRACTISE"),
        (3, "BUILD"),
        (4, "ASSESS"),
        (5, "VERIFY")
    ]
    xs = [320, 640, 960, 1280, 1600]
    
    # Connecting horizontal line
    start_x = xs[0]
    total_len = xs[-1] - xs[0]
    current_line_x = start_x + int(total_len * anim_prog)
    
    # Inactive base line
    d.line([(start_x, y_pos), (xs[-1], y_pos)], fill=(228, 218, 208), width=4)
    # Animated active red line
    d.line([(start_x, y_pos), (current_line_x, y_pos)], fill=C_MILAN, width=5)
    
    for idx, (num, label) in enumerate(stages):
        cx = xs[idx]
        if cx <= current_line_x:
            if num < active_stage:
                st = "past"
            elif num == active_stage:
                st = "active"
            else:
                st = "future"
            draw_pathway_node(img, cx, y_pos, num, label, state=st, active_glow=glow_pulse)

def render_frame(f):
    """Renders frame index f (0 to 899) at 30 fps."""
    frame = Image.new('RGB', (WIDTH, HEIGHT), C_CREAM)
    draw_grid_background(frame)
    d = ImageDraw.Draw(frame)
    
    # -------------------------------------------------------------------------
    # SCENE 1 — THE HOOK (0.0s – 4.0s / Frames 0 – 120)
    # -------------------------------------------------------------------------
    if f < 120:
        # Kinetic typography "LEARNING IS JUST THE BEGINNING"
        # Word 1: "LEARNING" (pops in frame 5 to 30)
        t_w1 = ease_out_back(min(1.0, f / 28.0), s=1.8)
        scale_w1 = 0.5 + 0.5 * t_w1
        y_w1 = int(360 - 50 * (1.0 - t_w1))
        
        # Draw huge kinetic "LEARNING"
        d.text((160, y_w1), "LEARNING", font=font_hero, fill=C_MILAN)
        
        # Word 2: "IS JUST THE BEGINNING." (slides up frame 25 to 55)
        if f > 22:
            t_w2 = ease_out_expo(min(1.0, (f - 22) / 28.0))
            y_w2 = int(485 - 30 * (1.0 - t_w2))
            d.text((165, y_w2), "IS JUST THE BEGINNING.", font=font_h1, fill=C_ESPRESSO)
        
        # Animated red accent line drawing out (frame 45 to 85)
        if f > 45:
            t_line = ease_in_out_cubic(min(1.0, (f - 45) / 35.0))
            line_w = int(1600 * t_line)
            d.line([(165, 570), (165 + line_w, 570)], fill=C_MILAN, width=6)
            # Glowing spark at tip of line
            spark_x = 165 + line_w
            d.ellipse([(spark_x - 8, 562), (spark_x + 8, 578)], fill=C_MILAN_BRIGHT)
        
        # Transition into connected pathway (frame 75 to 120)
        if f > 75:
            t_path = ease_out_expo(min(1.0, (f - 75) / 40.0))
            draw_continuous_pathway(frame, active_stage=1, anim_prog=t_path, glow_pulse=f * 0.2, y_pos=880)
            
            # Subtle teaser text
            d.text((165, 620), "How SEVA transforms courses into verified practical ability →", font=font_body, fill=C_MUTED)

    # -------------------------------------------------------------------------
    # SCENE 2 — LEARN (4.0s – 9.0s / Frames 120 – 270)
    # -------------------------------------------------------------------------
    elif f < 270:
        local_f = f - 120
        prog = local_f / 150.0
        
        # Continuous pathway at bottom (Node 1 active)
        draw_continuous_pathway(frame, active_stage=1, anim_prog=1.0, glow_pulse=local_f * 0.2, y_pos=960)
        
        # Kinetic Scene Header (Top Left)
        t_head = ease_out_expo(min(1.0, local_f / 25.0))
        d.rounded_rectangle([(120, 60), (320, 96)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((135, 69), "STAGE 01 // LEARN", font=font_badge, fill=C_MILAN)
        d.text((120, 115), "Structured lessons. AI-guided understanding.", font=font_h2, fill=C_ESPRESSO)
        
        # Card 1: Curriculum Module Overview Card (Left side, frames 0 to 60)
        t_card1 = ease_out_back(min(1.0, local_f / 35.0), s=1.3)
        c1_x = int(120 - 40 * (1.0 - t_card1))
        c1_w, c1_h = 600, 720
        draw_vector_card(frame, c1_x, 190, c1_w, c1_h, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        # Card 1 Header & Metrics
        d.rounded_rectangle([(c1_x, 190), (c1_x + c1_w, 250)], radius=24, fill=(252, 246, 242))
        d.rectangle([(c1_x, 230), (c1_x + c1_w, 250)], fill=(252, 246, 242))
        d.text((c1_x + 30, 208), "CURRICULUM ARCHITECTURE", font=font_badge, fill=C_MILAN)
        d.text((c1_x + 30, 275), "16 Progressive Modules", font=font_h3, fill=C_ESPRESSO)
        d.text((c1_x + 30, 315), "From JavaScript Fundamentals to Distributed LLM Systems", font=font_mono_sm, fill=C_MUTED)
        
        # 3 Staggered Lesson Items inside Card 1
        lessons = [
            ("Module 01", "Advanced JavaScript & Event Loop", "12 Lessons", True),
            ("Module 02", "React & Modern Next.js App Router", "10 Lessons", local_f > 40),
            ("Module 03", "Full Stack Node.js & REST APIs", "14 Lessons", local_f > 65),
        ]
        for l_idx, (m_id, m_title, m_count, m_vis) in enumerate(lessons):
            ly = 370 + l_idx * 90
            d.rounded_rectangle([(c1_x + 30, ly), (c1_x + c1_w - 30, ly + 72)], radius=14, fill=(255, 252, 248), outline=(230, 218, 205), width=1)
            # Red accent dot
            d.ellipse([(c1_x + 48, ly + 26), (c1_x + 60, ly + 38)], fill=C_MILAN)
            d.text((c1_x + 72, ly + 14), m_id, font=font_badge, fill=C_MILAN)
            d.text((c1_x + 72, ly + 38), m_title, font=font_body, fill=C_ESPRESSO)
            d.text((c1_x + c1_w - 130, ly + 26), m_count, font=font_mono_sm, fill=C_MUTED)
            
        # Animated Progress bar on Card 1
        bar_prog = ease_out_expo(min(1.0, local_f / 70.0))
        d.text((c1_x + 30, 680), "Curriculum Completion Pace", font=font_mono_sm, fill=C_MUTED)
        d.rounded_rectangle([(c1_x + 30, 715), (c1_x + c1_w - 30, 730)], radius=8, fill=(240, 230, 220))
        d.rounded_rectangle([(c1_x + 30, 715), (c1_x + 30 + int((c1_w - 60) * bar_prog), 730)], radius=8, fill=C_MILAN)
        
        # Card 2: Authentic Supporting Video Player Snippet (Right side)
        t_card2 = ease_out_back(min(1.0, max(0.0, (local_f - 25)) / 35.0), s=1.2)
        c2_x = int(760 + 50 * (1.0 - t_card2))
        c2_w, c2_h = 1040, 480
        draw_vector_card(frame, c2_x, 190, c2_w, c2_h, radius=24, bg=C_WHITE, border=(225, 212, 200), border_w=2)
        
        # Paste cropped video player snippet with rounded corners
        cropped_v = crops['video'].resize((c2_w - 20, c2_h - 20), Image.Resampling.LANCZOS)
        frame.paste(cropped_v, (c2_x + 10, 200))
        
        # Floating Overlay Badge on Video Player
        d.rounded_rectangle([(c2_x + 30, 220), (c2_x + 360, 260)], radius=10, fill=C_MILAN)
        d.text((c2_x + 45, 228), "1080p Full HD Studio Courseware", font=font_badge, fill=C_WHITE)
        
        # Card 3: Floating Real AI Tutor Dialogue Card (Staggered spring in at local_f > 60)
        if local_f > 50:
            t_card3 = ease_out_back(min(1.0, (local_f - 50) / 35.0), s=1.4)
            c3_y = int(690 + 40 * (1.0 - t_card3))
            c3_w, c3_h = 1040, 210
            draw_vector_card(frame, c2_x, c3_y, c3_w, c3_h, radius=20, bg=(255, 255, 255), border=C_MILAN, border_w=2)
            
            # AI Tutor Header
            d.ellipse([(c2_x + 30, c3_y + 24), (c2_x + 56, c3_y + 50)], fill=C_MILAN)
            d.text((c2_x + 37, c3_y + 27), "AI", font=font_badge, fill=C_WHITE)
            d.text((c2_x + 68, c3_y + 27), "REAL-TIME SOCRATIC AI TUTOR", font=font_badge, fill=C_MILAN)
            d.rounded_rectangle([(c2_x + c3_w - 200, c3_y + 20), (c2_x + c3_w - 30, c3_y + 52)], radius=8, fill=(245, 240, 235))
            d.text((c2_x + c3_w - 185, c3_y + 27), "Anti-Cheat Guard Active", font=font_mono_sm, fill=C_MUTED)
            
            # Simulated typing response
            t_text_chars = int(min(1.0, (local_f - 65) / 50.0) * 115)
            full_reply = "Notice how the inner function retains access to the outer lexical environment even after execution terminates. This is the foundation of closures."
            d.text((c2_x + 30, c3_y + 75), full_reply[:t_text_chars], font=font_body, fill=C_ESPRESSO)

    # -------------------------------------------------------------------------
    # SCENE 3 — PRACTISE AND BUILD (9.0s – 15.0s / Frames 270 – 450)
    # -------------------------------------------------------------------------
    elif f < 450:
        local_f = f - 270
        prog = local_f / 180.0
        
        # Continuous pathway at bottom (Node 2 & 3 active)
        active_n = 2 if local_f < 90 else 3
        draw_continuous_pathway(frame, active_stage=active_n, anim_prog=1.0, glow_pulse=local_f * 0.2, y_pos=960)
        
        # Kinetic Scene Header
        d.rounded_rectangle([(120, 60), (450, 96)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((135, 69), "STAGE 02 & 03 // PRACTISE & BUILD", font=font_badge, fill=C_MILAN)
        d.text((120, 115), "Turn concepts into working, production projects.", font=font_h2, fill=C_ESPRESSO)
        
        # Split Panels:
        # Left Panel: Interactive Coding Lab (Frames 0 to 90 dominant)
        # Right Panel: GitHub Project Submission & Rubric Evaluation
        
        t_panel_l = ease_out_back(min(1.0, local_f / 35.0), s=1.2)
        pl_w, pl_h = 820, 720
        pl_x = int(120 - 40 * (1.0 - t_panel_l))
        draw_vector_card(frame, pl_x, 190, pl_w, pl_h, radius=24, bg=C_DARK_BG, border=C_MILAN, border_w=2)
        
        # Terminal header
        d.rounded_rectangle([(pl_x, 190), (pl_x + pl_w, 240)], radius=24, fill=(35, 18, 14))
        d.rectangle([(pl_x, 220), (pl_x + pl_w, 240)], fill=(35, 18, 14))
        # Window dots
        d.ellipse([(pl_x + 25, 208), (pl_x + 37, 220)], fill=(255, 95, 86))
        d.ellipse([(pl_x + 45, 208), (pl_x + 57, 220)], fill=(255, 189, 46))
        d.ellipse([(pl_x + 65, 208), (pl_x + 77, 220)], fill=(39, 201, 63))
        d.text((pl_x + 95, 204), "interactive-sandbox :: exercise_03.ts", font=font_mono_sm, fill=(220, 190, 180))
        
        # Code block lines
        code_lines = [
            ("01", "import { TaskQueue, WorkerPool } from '@seva/engine';", (200, 140, 130)),
            ("02", "", (180, 180, 180)),
            ("03", "export class MemoryManagedPool implements WorkerPool {", (255, 250, 205)),
            ("04", "  private activeWorkers = new Map<string, Worker>();", (255, 255, 255)),
            ("05", "  async dispatch(task: Task): Promise<Result> {", (255, 250, 205)),
            ("06", "    const worker = this.getIsolatedContext(task);", (255, 255, 255)),
            ("07", "    return await worker.execute(task.payload);", (255, 255, 255)),
            ("08", "  }", (255, 250, 205)),
            ("09", "}", (255, 250, 205)),
        ]
        y_c = 265
        for ln_num, ln_txt, ln_col in code_lines:
            d.text((pl_x + 25, y_c), ln_num, font=font_code, fill=C_MILAN)
            d.text((pl_x + 65, y_c), ln_txt, font=font_code, fill=ln_col)
            y_c += 30
            
        # Test Runner Console inside Left Panel
        d.line([(pl_x, 560), (pl_x + pl_w, 560)], fill=(60, 30, 25), width=2)
        d.text((pl_x + 25, 580), "AUTOMATED SANDBOX TEST RUNNER", font=font_badge, fill=C_MILAN_BRIGHT)
        
        tests = [
            ("✓ PASS", "test_memory_leak_prevention (12ms)", local_f > 25),
            ("✓ PASS", "test_worker_isolation_boundary (18ms)", local_f > 45),
            ("✓ PASS", "test_high_concurrency_throughput (24ms)", local_f > 65),
        ]
        y_t = 615
        for t_st, t_desc, t_shown in tests:
            if t_shown:
                d.text((pl_x + 25, y_t), t_st, font=font_code, fill=C_GREEN)
                d.text((pl_x + 105, y_t), t_desc, font=font_code, fill=(230, 220, 210))
            y_t += 28
            
        if local_f > 75:
            d.rounded_rectangle([(pl_x + pl_w - 220, 715), (pl_x + pl_w - 30, 755)], radius=10, fill=C_GREEN)
            d.text((pl_x + pl_w - 195, 726), "ALL TESTS PASSING", font=font_badge, fill=C_WHITE)
            
        # Right Panel: Authentic Project Submission & Rubric Evaluation Card
        t_panel_r = ease_out_back(min(1.0, max(0.0, (local_f - 30)) / 40.0), s=1.2)
        pr_w, pr_h = 820, 720
        pr_x = int(980 + 40 * (1.0 - t_panel_r))
        draw_vector_card(frame, pr_x, 190, pr_w, pr_h, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        # Paste supporting cropped project card image
        cropped_p = crops['project'].resize((pr_w - 30, 400), Image.Resampling.LANCZOS)
        frame.paste(cropped_p, (pr_x + 15, 205))
        
        # Project Rubric Breakdown below cropped shot
        d.rounded_rectangle([(pr_x + 25, 620), (pr_x + pr_w - 25, 760)], radius=16, fill=(255, 252, 248), outline=(225, 215, 205), width=1)
        d.text((pr_x + 45, 638), "PROJECT RUBRIC EVALUATION", font=font_badge, fill=C_MILAN)
        d.text((pr_x + 45, 672), "Multi-File Architecture: Advanced (Score 96/100)", font=font_body, fill=C_ESPRESSO)
        d.text((pr_x + 45, 706), "Automated Test Coverage: 98.4% Verified", font=font_mono_sm, fill=C_MUTED)
        
        # Verified Badge
        d.rounded_rectangle([(pr_x + pr_w - 200, 634), (pr_x + pr_w - 45, 668)], radius=8, fill=(255, 240, 238), outline=C_MILAN, width=1)
        d.text((pr_x + pr_w - 185, 642), "✓ Verified Capstone", font=font_mono_sm, fill=C_MILAN)

    # -------------------------------------------------------------------------
    # SCENE 4 — ASSESS AND VERIFY (15.0s – 22.0s / Frames 450 – 660)
    # -------------------------------------------------------------------------
    elif f < 660:
        local_f = f - 450
        prog = local_f / 210.0
        
        # Continuous pathway at bottom (Node 4 & 5 active)
        active_n = 4 if local_f < 100 else 5
        draw_continuous_pathway(frame, active_stage=active_n, anim_prog=1.0, glow_pulse=local_f * 0.2, y_pos=960)
        
        # Kinetic Scene Header
        d.rounded_rectangle([(120, 60), (450, 96)], radius=10, fill=(255, 238, 235), outline=C_MILAN, width=2)
        d.text((135, 69), "STAGE 04 & 05 // ASSESS & VERIFY", font=font_badge, fill=C_MILAN)
        d.text((120, 115), "Demonstrate your skills with immutable cryptographic evidence.", font=font_h2, fill=C_ESPRESSO)
        
        # Left Card: Proctored Competency Assessment
        t_card_l = ease_out_back(min(1.0, local_f / 35.0), s=1.2)
        al_w, al_h = 780, 720
        al_x = int(120 - 40 * (1.0 - t_card_l))
        draw_vector_card(frame, al_x, 190, al_w, al_h, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        d.text((al_x + 35, 220), "COMPETENCY EVALUATION", font=font_badge, fill=C_MILAN)
        d.text((al_x + 35, 260), "Overall Index: 92/100", font=font_h2, fill=C_ESPRESSO)
        
        # 4 Verified Competency Dimension Bars
        dims = [
            ("React & Next.js Architecture", 0.94, "94%"),
            ("Backend API & Distributed Systems", 0.89, "89%"),
            ("Database Tuning & SQL Models", 0.92, "92%"),
            ("Security & Proctored Integrity", 0.96, "96%"),
        ]
        for d_idx, (d_name, d_score, d_str) in enumerate(dims):
            dy = 330 + d_idx * 90
            d.text((al_x + 35, dy), d_name, font=font_body, fill=C_ESPRESSO)
            d.text((al_x + al_w - 90, dy), d_str, font=font_badge, fill=C_MILAN)
            
            # Progress bar
            d.rounded_rectangle([(al_x + 35, dy + 32), (al_x + al_w - 35, dy + 46)], radius=7, fill=(245, 238, 230))
            score_bar_prog = ease_out_expo(min(1.0, max(0.0, (local_f - 15 - d_idx * 10)) / 30.0))
            active_w = int((al_w - 70) * d_score * score_bar_prog)
            d.rounded_rectangle([(al_x + 35, dy + 32), (al_x + 35 + active_w, dy + 46)], radius=7, fill=C_MILAN)
            
        # Security Assurance
        d.rounded_rectangle([(al_x + 35, 700), (al_x + al_w - 35, 750)], radius=12, fill=(245, 252, 248), outline=C_GREEN, width=1)
        d.text((al_x + 55, 718), "✓ 24-Hour Cooldown & Anti-Cheat Protocol Verified", font=font_mono_sm, fill=C_GREEN)
        
        # Animated Connector Stream (Evidence tokens flying across center, local_f > 50)
        center_x = 940
        if local_f > 40:
            for p_idx in range(4):
                p_t = ((local_f - 40) * 0.08 + p_idx * 0.25) % 1.0
                fly_x = int(al_x + al_w - 20 + (1920 - al_w - 300) * p_t)
                fly_y = 350 + p_idx * 80 + int(15 * math.sin(p_t * math.pi))
                d.rounded_rectangle([(fly_x - 40, fly_y - 14), (fly_x + 40, fly_y + 14)], radius=8, fill=C_MILAN)
                d.text((fly_x - 32, fly_y - 8), f"#EV-{1042+p_idx}", font=font_mono_sm, fill=C_WHITE)
                
        # Right Card: Cryptographic Skill Passport & SHA-256 Ledger
        t_card_r = ease_out_back(min(1.0, max(0.0, (local_f - 40)) / 40.0), s=1.2)
        ar_w, ar_h = 860, 720
        ar_x = int(940 + 40 * (1.0 - t_card_r))
        draw_vector_card(frame, ar_x, 190, ar_w, ar_h, radius=24, bg=C_WHITE, border=C_MILAN, border_w=2)
        
        # Supporting authentic crop of SHA-256 verification ledger
        cropped_l = crops['ledger'].resize((ar_w - 30, 360), Image.Resampling.LANCZOS)
        frame.paste(cropped_l, (ar_x + 15, 205))
        
        # Cryptographic Hash Seal Box below
        d.rounded_rectangle([(ar_x + 25, 580), (ar_x + ar_w - 25, 750)], radius=18, fill=(255, 248, 245), outline=C_MILAN, width=2)
        d.text((ar_x + 45, 600), "IMMUTABLE EVIDENCE LEDGER", font=font_badge, fill=C_MILAN)
        
        # SHA-256 Hash code with glowing lock
        d.rounded_rectangle([(ar_x + 45, 635), (ar_x + ar_w - 45, 680)], radius=10, fill=C_WHITE, outline=(225, 210, 200), width=1)
        d.text((ar_x + 60, 648), "🔒 SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b", font=font_mono_sm, fill=C_MILAN)
        
        d.text((ar_x + 45, 705), "✓ Validated by Academic Sandbox Engine • Instant Public Verification", font=font_body, fill=C_ESPRESSO)

    # -------------------------------------------------------------------------
    # SCENE 5 — FINAL BRAND REVEAL (22.0s – 30.0s / Frames 660 – 900)
    # -------------------------------------------------------------------------
    else:
        local_f = f - 660
        prog = local_f / 240.0
        
        # Converging rays / red ambient sweep
        cx, cy = WIDTH // 2, 420
        
        # Expanding circular mask bloom
        bloom_r = int(220 + 30 * math.sin(local_f * 0.08))
        d.ellipse([(cx - bloom_r, cy - bloom_r), (cx + bloom_r, cy + bloom_r)], fill=(255, 238, 225))
        d.ellipse([(cx - 150, cy - 150), (cx + 150, cy + 150)], fill=(255, 248, 215))
        
        # SEVA Emblem Logo (Centerpiece with spring scale)
        t_logo = ease_out_back(min(1.0, local_f / 35.0), s=1.6)
        logo_size = int(140 * t_logo)
        r = logo_size // 2
        
        d.rounded_rectangle([(cx - r, cy - 140 - r), (cx + r, cy - 140 + r)], radius=32, fill=C_MILAN, outline=C_WHITE, width=4)
        # Gold checkmark
        pts = [(cx - 28, cy - 140 - 2), (cx - 7, cy - 140 + 20), (cx + 32, cy - 140 - 20)]
        d.line(pts, fill=C_WHITE, width=9, joint="curve")
        
        # Kinetic Brand Typography Reveal
        # Title: SEVA SKILL PASSPORT
        t_title = ease_out_expo(min(1.0, max(0.0, (local_f - 15)) / 30.0))
        y_title = int(cy - 20 + 20 * (1.0 - t_title))
        title_txt = "SEVA SKILL PASSPORT"
        bbox_t = d.textbbox((0, 0), title_txt, font=font_h1)
        tw = bbox_t[2] - bbox_t[0]
        d.text((cx - tw // 2, y_title), title_txt, font=font_h1, fill=C_MILAN)
        
        # 3 Tagline phrases with staggered kinetic entrance:
        taglines = [
            ("Learn Skills.", local_f > 40),
            ("Build Ability.", local_f > 60),
            ("Prove What You Can Do.", local_f > 80),
        ]
        tag_y = cy + 70
        for tag_idx, (tag_txt, tag_vis) in enumerate(taglines):
            if tag_vis:
                f_font = font_h2 if tag_idx == 2 else font_h3
                f_col = C_MILAN_BRIGHT if tag_idx == 2 else C_ESPRESSO
                bbox_tag = d.textbbox((0, 0), tag_txt, font=f_font)
                tag_w = bbox_tag[2] - bbox_tag[0]
                d.text((cx - tag_w // 2, tag_y), tag_txt, font=f_font, fill=f_col)
                tag_y += 54
                
        # 4 Credibility Metric Badges below
        if local_f > 95:
            metrics = [
                ("16 In-Depth Modules", "Full Stack Curriculum"),
                ("100% Practical", "Labs + Capstone Projects"),
                ("SHA-256 Verified", "Tamper-Proof Evidence"),
                ("Academic Innovation", "Proposed Research Model")
            ]
            card_w = 280
            card_h = 80
            gap = 25
            total_w = len(metrics) * card_w + (len(metrics) - 1) * gap
            start_x = (WIDTH - total_w) // 2
            card_y = 800
            
            for m_idx, (m_val, m_sub) in enumerate(metrics):
                mx = start_x + m_idx * (card_w + gap)
                d.rounded_rectangle([(mx, card_y), (mx + card_w, card_y + card_h)], radius=16, fill=C_WHITE, outline=C_MILAN, width=2)
                d.text((mx + 20, card_y + 16), m_val, font=font_badge, fill=C_MILAN)
                d.text((mx + 20, card_y + 44), m_sub, font=font_mono_sm, fill=C_MUTED)
                
            # Platform URL Footer
            d.line([(320, 930), (WIDTH - 320, 930)], fill=(230, 215, 205), width=1)
            d.text((cx - 240, 955), "ACADEMIC RESEARCH INNOVATION PLATFORM • SEVA.EDU", font=font_badge, fill=C_MUTED)

    return frame

def main():
    os.makedirs('public/videos', exist_ok=True)
    master_mp4 = 'public/videos/seva-explainer-master.mp4'
    hero_mp4 = 'public/videos/seva-explainer-hero.mp4'
    poster_webp = 'public/videos/seva-explainer-poster.webp'
    audio_path = 'scripts/video-assets/audio/master_soundtrack.wav'
    
    # 1. Export High-Fidelity Poster Image (from frame 110 - Hook roadmap reveal)
    print("Exporting After Effects-style poster image...")
    poster_img = render_frame(110)
    poster_img.save(poster_webp, 'WEBP', quality=92)
    print(f"Saved poster: {poster_webp}")
    
    # 2. Render Full 30s Master Video
    print(f"Rendering 30s motion graphics master ({TOTAL_FRAMES} frames @ {FPS} fps)...")
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
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        master_mp4
    ]
    
    proc_master = subprocess.Popen(cmd_master, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for f in range(TOTAL_FRAMES):
        f_img = render_frame(f)
        proc_master.stdin.write(f_img.tobytes())
        if f % 150 == 0:
            print(f"Render progress: {f}/{TOTAL_FRAMES} frames ({(f/TOTAL_FRAMES)*100:.1f}%)")
            
    proc_master.stdin.close()
    proc_master.wait()
    if proc_master.returncode != 0:
        print("Master render failed:", proc_master.stderr.read().decode())
        sys.exit(1)
    print(f"Rendered master video: {master_mp4}")
    
    # 3. Create Optimized Hero Preview Video
    # 15s seamless loop from Scene 2, 3, 4 with high visual energy
    print("Generating optimized hero preview video...")
    cmd_hero = [
        "ffmpeg", "-y",
        "-ss", "00:00:04",
        "-to", "00:00:19",
        "-i", master_mp4,
        "-an",
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
