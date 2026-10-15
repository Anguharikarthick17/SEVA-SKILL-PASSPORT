#!/usr/bin/env python3
"""
SEVA Skill Passport — 1080p Slide Renderer
Generates crystal-clear, high-contrast, broadcast-quality 1920x1080 slides
strictly styled in the Lemon Chiffon (#FFFACD) and Milan Red (#B81104) design language.
"""

import sys
import json
import os
from PIL import Image, ImageDraw, ImageFont

def get_font(font_path, size):
    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        try:
            return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size)
        except Exception:
            return ImageFont.load_default()

def render_slide(spec: dict, output_path: str):
    # 1. Base Canvas in Luminous Lemon Chiffon
    width, height = 1920, 1080
    img = Image.new('RGB', (width, height), color='#FFFDF0')
    draw = ImageDraw.Draw(img)

    # Load System Fonts
    font_bold_title = get_font('/System/Library/Fonts/HelveticaNeue.ttc', 44)
    font_sub = get_font('/System/Library/Fonts/HelveticaNeue.ttc', 24)
    font_badge = get_font('/System/Library/Fonts/HelveticaNeue.ttc', 20)
    font_body = get_font('/System/Library/Fonts/HelveticaNeue.ttc', 28)
    font_callout = get_font('/System/Library/Fonts/HelveticaNeue.ttc', 24)
    font_code = get_font('/System/Library/Fonts/Menlo.ttc', 24)

    # 2. Top Brand Accent Bar (Milan Red)
    draw.rectangle([(0, 0), (1920, 16)], fill='#B81104')

    # 3. Header: Brand Badge & Slide Counter
    # Brand Badge
    draw.rounded_rectangle([(100, 48), (380, 88)], radius=12, fill='#FFF2F0', outline='#B81104', width=2)
    draw.text((120, 56), 'SEVA SKILL PASSPORT', font=font_badge, fill='#B81104')

    # Slide Counter
    slide_idx = spec.get('slideIndex', 0)
    total_slides = spec.get('totalSlides', 4)
    draw.rounded_rectangle([(1660, 48), (1820, 88)], radius=12, fill='#FFF2F0', outline='#B81104', width=2)
    draw.text((1695, 56), f'{slide_idx + 1} / {total_slides}', font=font_badge, fill='#B81104')

    # Header Titles
    title_text = spec.get('title', 'Module Concept')
    subtitle_text = spec.get('subtitle', '')
    draw.text((100, 115), title_text, font=font_bold_title, fill='#1A0C08')
    draw.text((100, 178), subtitle_text, font=font_sub, fill='#6E5D53')

    # 4. Middle Content Body
    code_snippet = spec.get('codeSnippet')
    content_bullets = spec.get('content', [])

    if code_snippet:
        # Code Box (100, 230) -> (1820, 710)
        draw.rounded_rectangle([(100, 230), (1820, 710)], radius=16, fill='#180806', outline='#B81104', width=2)
        # Window controls
        draw.ellipse([(140, 258), (158, 276)], fill='#D91C0B')
        draw.ellipse([(172, 258), (190, 276)], fill='#FFB547')
        draw.ellipse([(204, 258), (222, 276)], fill='#2ECC71')
        draw.text((240, 256), 'Terminal / Production Code Architecture', font=font_sub, fill='#E6B8A2')

        lines = [l for l in code_snippet.split('\n') if l.strip()]
        y_code = 310
        for idx, line in enumerate(lines[:10]):
            draw.text((140, y_code), f'{idx+1:2d}', font=font_code, fill='#B81104')
            draw.text((195, y_code), line, font=font_code, fill='#FFFACD')
            y_code += 38

    else:
        # High Contrast Content Card
        draw.rounded_rectangle([(100, 230), (1820, 710)], radius=16, fill='#FFFFFF', outline='#E8DCB5', width=2)
        y_bullet = 265
        for bullet in content_bullets[:4]:
            # Milan Red Bullet Icon
            draw.rounded_rectangle([(140, y_bullet), (170, y_bullet + 30)], radius=8, fill='#B81104')
            draw.ellipse([(151, y_bullet + 11), (159, y_bullet + 19)], fill='#FFFDF0')
            draw.text((190, y_bullet), bullet, font=font_body, fill='#1A0C08')
            y_bullet += 105

    # 5. Callout Banner (Key Takeaway / Safe Rule)
    callout_text = spec.get('calloutText')
    if callout_text:
        is_warn = spec.get('calloutType') == 'warning'
        box_bg = '#FFF2F0' if is_warn else '#FFF9E6'
        badge_label = 'CRITICAL BEST PRACTICE' if is_warn else 'EVIDENCE MILESTONE'

        draw.rounded_rectangle([(100, 735), (1820, 855)], radius=14, fill=box_bg, outline='#B81104', width=2)
        draw.text((130, 750), badge_label, font=font_badge, fill='#B81104')
        draw.text((130, 792), callout_text, font=font_callout, fill='#1A0C08')

    # 6. Dedicated Subtitle Safe Zone & Brand Footer
    # Draw subtle divider
    draw.line([(100, 910), (1820, 910)], fill='#E8DCB5', width=1)
    mod_num = spec.get('moduleNumber', '01')
    concept_title = spec.get('conceptTitle', 'Curriculum')
    draw.text((100, 930), f'Module {mod_num} · {concept_title}', font=font_sub, fill='#6E5D53')
    draw.text((1520, 930), 'Official Video Courseware', font=font_sub, fill='#B81104')

    # Output PNG
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: render_slide_pillow.py <spec_json_path> <output_png_path>")
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        spec_data = json.load(f)
    render_slide(spec_data, sys.argv[2])
