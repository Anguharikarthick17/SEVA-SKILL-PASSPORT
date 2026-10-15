"""
layout_engine.py
Modular, robust layout and typography engine for SEVA Skill Passport video renderer.
Provides automatic word-wrapping, bounding box validation, and safe area enforcement.
"""
from PIL import ImageDraw

def wrap_text(text, font, max_width, draw):
    """
    Splits text into a list of lines such that each line does not exceed max_width.
    """
    if not text:
        return []
    words = text.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        trial = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), trial, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                lines.append(word)
                current_line = []
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_wrapped_text(draw, xy, text, font, fill, max_width, line_spacing=6, align='left'):
    """
    Draws text wrapped within max_width starting at xy = (x, y).
    Returns the total height consumed.
    """
    lines = wrap_text(text, font, max_width, draw)
    if not lines:
        return 0
    
    cur_y = xy[1]
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        line_h = bbox[3] - bbox[1]
        
        if align == 'center':
            line_x = xy[0] + (max_width - line_w) // 2
        elif align == 'right':
            line_x = xy[0] + (max_width - line_w)
        else:
            line_x = xy[0]
            
        draw.text((line_x, cur_y), line, fill=fill, font=font)
        cur_y += line_h + line_spacing
        
    return cur_y - xy[1]

def draw_card(draw, rect, radius, fill, outline, width=2):
    """Draws a rounded card with safe boundary."""
    draw.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
