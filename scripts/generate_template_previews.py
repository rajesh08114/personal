import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join(os.getcwd(), 'public', 'templates')
os.makedirs(OUTPUT_DIR, exist_ok=True)
WIDTH = 1280
HEIGHT = 720

def create_gradient(w, h, c1, c2, vertical=True):
    base = Image.new('RGB', (w, h), c1)
    top = Image.new('RGB', (w, h), c2)
    mask = Image.new('L', (w, h))
    mask_draw = ImageDraw.Draw(mask)
    if vertical:
        for y in range(h):
            val = int(255 * (y / h))
            mask_draw.line([(0, y), (w, y)], fill=val)
    else:
        for x in range(w):
            val = int(255 * (x / w))
            mask_draw.line([(x, 0), (x, h)], fill=val)
    return Image.composite(top, base, mask)

def radial_gradient(w, h, center, r, inner_c, outer_c):
    img = Image.new('RGBA', (w, h), outer_c)
    draw = ImageDraw.Draw(img)
    cx, cy = center
    steps = int(r)
    for i in range(steps, 0, -2):
        factor = i / steps
        r_col = int(inner_c[0] * (1 - factor) + outer_c[0] * factor)
        g_col = int(inner_c[1] * (1 - factor) + outer_c[1] * factor)
        b_col = int(inner_c[2] * (1 - factor) + outer_c[2] * factor)
        a_col = int(inner_c[3] * (1 - factor) + outer_c[3] * factor) if len(inner_c) > 3 else 255
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(r_col, g_col, b_col, a_col))
    return img

def add_stars(draw, count=150, bounds=(0, 0, WIDTH, HEIGHT), color=(255, 255, 255)):
    random.seed(42)
    for _ in range(count):
        x = random.randint(bounds[0], bounds[2])
        y = random.randint(bounds[1], bounds[3])
        size = random.choice([1, 1, 2, 2, 3])
        brightness = random.randint(140, 255)
        c = (brightness, brightness, int(brightness * 0.9)) if len(color) == 3 else color
        if size == 3:
            draw.line([(x - 3, y), (x + 3, y)], fill=c, width=1)
            draw.line([(x, y - 3), (x, y + 3)], fill=c, width=1)
        draw.ellipse([x - size, y - size, x + size, y + size], fill=c)

# 1. comic-book
def gen_comic_book():
    img = create_gradient(WIDTH, HEIGHT, (255, 220, 0), (255, 90, 30))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Halftone dots
    for x in range(0, WIDTH, 24):
        for y in range(0, HEIGHT, 24):
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 255, 255, 70))
    # Sunburst rays
    cx, cy = WIDTH // 2, HEIGHT // 2 + 20
    for a in range(0, 360, 20):
        rad1 = math.radians(a)
        rad2 = math.radians(a + 10)
        p1 = (cx, cy)
        p2 = (cx + math.cos(rad1) * 1000, cy + math.sin(rad1) * 1000)
        p3 = (cx + math.cos(rad2) * 1000, cy + math.sin(rad2) * 1000)
        draw.polygon([p1, p2, p3], fill=(255, 245, 100, 90))
    # Action burst shape
    points = []
    num_spikes = 16
    for i in range(num_spikes * 2):
        r = 260 if i % 2 == 0 else 140
        ang = math.radians(i * (360 / (num_spikes * 2)))
        points.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    draw.polygon(points, fill=(230, 20, 40))
    # Inner burst
    inner_pts = []
    for i in range(num_spikes * 2):
        r = 210 if i % 2 == 0 else 110
        ang = math.radians(i * (360 / (num_spikes * 2)))
        inner_pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    draw.polygon(inner_pts, fill=(255, 235, 40))
    # Comic border
    draw.rectangle([20, 20, WIDTH - 20, HEIGHT - 20], outline=(15, 15, 20), width=10)
    # Badge
    draw.rectangle([cx - 240, cy - 35, cx + 240, cy + 35], fill=(15, 15, 20))
    draw.rectangle([cx - 235, cy - 30, cx + 235, cy + 30], fill=(255, 255, 255))
    draw.text((cx, cy), "ISSUE #01 : THE BIRTHDAY HERO", fill=(15, 15, 20), anchor="mm")
    return img

# 2. fairytale
def gen_fairytale():
    img = create_gradient(WIDTH, HEIGHT, (20, 10, 45), (90, 35, 95))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=220)
    # Crescent moon
    cx, cy = WIDTH - 220, 160
    draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], fill=(255, 245, 210, 230))
    draw.ellipse([cx - 30, cy - 60, cx + 70, cy + 40], fill=(30, 15, 55))
    # Soft mist
    mist = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    m_draw = ImageDraw.Draw(mist)
    m_draw.ellipse([WIDTH // 2 - 400, HEIGHT - 350, WIDTH // 2 + 400, HEIGHT + 150], fill=(255, 220, 160, 40))
    mist = mist.filter(ImageFilter.GaussianBlur(50))
    img = Image.alpha_composite(img.convert('RGBA'), mist)
    draw = ImageDraw.Draw(img, 'RGBA')
    # Castle silhouette
    bx = WIDTH // 2
    by = HEIGHT - 180
    # Center tower
    draw.rectangle([bx - 60, by - 240, bx + 60, by], fill=(18, 8, 30))
    draw.polygon([(bx - 70, by - 240), (bx + 70, by - 240), (bx, by - 330)], fill=(25, 12, 40))
    # Left tower
    draw.rectangle([bx - 180, by - 180, bx - 100, by], fill=(18, 8, 30))
    draw.polygon([(bx - 190, by - 180), (bx - 90, by - 180), (bx - 140, by - 260)], fill=(25, 12, 40))
    # Right tower
    draw.rectangle([bx + 100, by - 180, bx + 180, by], fill=(18, 8, 30))
    draw.polygon([(bx + 90, by - 180), (bx + 190, by - 180), (bx + 140, by - 260)], fill=(25, 12, 40))
    # Forest hill in foreground
    draw.ellipse([-100, HEIGHT - 200, WIDTH + 100, HEIGHT + 400], fill=(12, 5, 20))
    # Glowing magical particles
    for _ in range(80):
        gx = random.randint(bx - 300, bx + 300)
        gy = random.randint(by - 250, HEIGHT - 50)
        r = random.choice([2, 3, 4])
        draw.ellipse([gx - r, gy - r, gx + r, gy + r], fill=(255, 225, 120, random.randint(120, 240)))
    return img.convert('RGB')

# 3. festival
def gen_festival():
    img = create_gradient(WIDTH, HEIGHT, (25, 10, 45), (240, 90, 40))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Beams of light
    cx = WIDTH // 2
    for x_target in [200, 400, 640, 880, 1080]:
        draw.polygon([(cx, HEIGHT), (x_target - 50, 0), (x_target + 50, 0)], fill=(255, 230, 150, 45))
    # Floating lanterns
    for _ in range(40):
        lx = random.randint(60, WIDTH - 60)
        ly = random.randint(50, HEIGHT - 260)
        lr = random.randint(5, 12)
        draw.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], fill=(255, 180, 50, 200))
        draw.ellipse([lx - lr//2, ly - lr//2, lx + lr//2, ly + lr//2], fill=(255, 255, 200, 240))
    # Confetti
    colors = [(255, 50, 80), (255, 220, 40), (50, 200, 255), (255, 150, 220), (255, 255, 255)]
    for _ in range(250):
        fx = random.randint(0, WIDTH)
        fy = random.randint(0, HEIGHT - 180)
        c = random.choice(colors)
        w, h = random.randint(3, 7), random.randint(6, 14)
        draw.rectangle([fx, fy, fx + w, fy + h], fill=c)
    # Cheering crowd silhouettes at the bottom
    for x in range(0, WIDTH, 16):
        head_y = HEIGHT - random.randint(70, 140)
        draw.ellipse([x - 14, head_y - 20, x + 14, head_y + 10], fill=(15, 8, 20))
        draw.rectangle([x - 18, head_y, x + 18, HEIGHT], fill=(15, 8, 20))
        if random.random() > 0.4:  # waving arm
            draw.line([(x, head_y + 10), (x + random.choice([-20, 20]), head_y - 45)], fill=(15, 8, 20), width=6)
    return img

# 4. cosmic-journey
def gen_cosmic_journey():
    img = create_gradient(WIDTH, HEIGHT, (6, 4, 18), (35, 15, 55))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=300)
    # Nebula glow
    nebula = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(nebula)
    n_draw.ellipse([WIDTH // 2 - 250, HEIGHT // 2 - 200, WIDTH // 2 + 350, HEIGHT // 2 + 250], fill=(160, 40, 220, 50))
    n_draw.ellipse([WIDTH // 2 - 100, HEIGHT // 2 - 100, WIDTH // 2 + 200, HEIGHT // 2 + 100], fill=(30, 200, 220, 40))
    nebula = nebula.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img.convert('RGBA'), nebula)
    draw = ImageDraw.Draw(img, 'RGBA')
    # Giant ringed planet
    px, py, pr = WIDTH // 2, HEIGHT // 2 + 20, 130
    draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(220, 140, 70))
    # Shadow crescent on planet
    draw.chord([px - pr, py - pr, px + pr, py + pr], 70, 250, fill=(30, 15, 45, 190))
    # Planetary rings
    draw.ellipse([px - 340, py - 40, px + 340, py + 40], outline=(230, 200, 150, 180), width=8)
    draw.ellipse([px - 380, py - 55, px + 380, py + 55], outline=(200, 160, 110, 110), width=12)
    return img.convert('RGB')

# 5. coffee-memories
def gen_coffee_memories():
    img = create_gradient(WIDTH, HEIGHT, (55, 35, 25), (105, 75, 55))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Wood planks
    for y in range(0, HEIGHT, 120):
        draw.line([(0, y), (WIDTH, y)], fill=(35, 20, 12), width=3)
    # Warm table surface vignette
    # Large coffee cup
    cx, cy = WIDTH // 2, HEIGHT // 2
    # Saucer
    draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], fill=(240, 235, 225), outline=(200, 190, 175), width=4)
    # Cup rim
    draw.ellipse([cx - 180, cy - 180, cx + 180, cy + 180], fill=(255, 255, 255), outline=(215, 205, 190), width=5)
    # Coffee liquid
    draw.ellipse([cx - 165, cy - 165, cx + 165, cy + 165], fill=(120, 75, 45))
    # Latte art heart
    hx, hy = cx, cy - 15
    draw.polygon([(hx, hy + 60), (hx - 45, hy), (hx, hy - 25), (hx + 45, hy)], fill=(250, 245, 235))
    draw.ellipse([hx - 45, hy - 35, hx, hy + 15], fill=(250, 245, 235))
    draw.ellipse([hx, hy - 35, hx + 45, hy + 15], fill=(250, 245, 235))
    # Open book corner
    draw.polygon([(80, 80), (320, 120), (280, 420), (40, 380)], fill=(245, 238, 220))
    draw.line([(200, 100), (160, 400)], fill=(180, 165, 140), width=3)
    return img

# 6. digital-future
def gen_digital_future():
    img = Image.new('RGB', (WIDTH, HEIGHT), (12, 10, 8))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Amber phosphor glow
    amber = (255, 175, 20)
    # Terminal frame
    draw.rectangle([50, 40, WIDTH - 50, HEIGHT - 40], outline=(255, 175, 20, 120), width=3)
    # Scanlines
    for y in range(40, HEIGHT - 40, 6):
        draw.line([(50, y), (WIDTH - 50, y)], fill=(0, 0, 0, 70), width=1)
    # Terminal text lines
    lines = [
        "SYS_INIT: TERMINAL-1983 ONLINE",
        "LOADING MEMORY SECTORS....................... [OK]",
        "TARGET: SPECIAL BIRTHDAY ARCHIVE",
        "================================================",
        "MESSAGE: ANOTHER REVOLUTION AROUND THE SUN",
        "STATUS: LEVEL COMPLETE // NEW LEVEL UNLOCKED",
        "> EXECUTE CELEBRATION_PROTOCOL_V4.EXE",
        "> ACCESS GRANTED // READY._"
    ]
    y_pos = 140
    for line in lines:
        draw.text((120, y_pos), line, fill=amber)
        y_pos += 44
    # Blinking cursor box
    draw.rectangle([480, y_pos - 48, 502, y_pos - 28], fill=amber)
    return img

# 7. four-seasons
def gen_four_seasons():
    img = Image.new('RGB', (WIDTH, HEIGHT))
    # 4 quadrants / columns: Spring, Summer, Autumn, Winter
    col_w = WIDTH // 4
    # Spring
    sp = create_gradient(col_w, HEIGHT, (255, 220, 230), (190, 240, 210))
    # Summer
    su = create_gradient(col_w, HEIGHT, (100, 200, 255), (80, 180, 100))
    # Autumn
    au = create_gradient(col_w, HEIGHT, (255, 150, 60), (180, 60, 30))
    # Winter
    wi = create_gradient(col_w, HEIGHT, (170, 200, 235), (230, 240, 255))
    img.paste(sp, (0, 0))
    img.paste(su, (col_w, 0))
    img.paste(au, (col_w * 2, 0))
    img.paste(wi, (col_w * 3, 0))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Dividers
    for i in range(1, 4):
        draw.line([(col_w * i, 0), (col_w * i, HEIGHT)], fill=(255, 255, 255), width=4)
    # Big tree trunk in center
    cx = WIDTH // 2
    draw.polygon([(cx - 40, HEIGHT), (cx + 40, HEIGHT), (cx + 20, HEIGHT - 300), (cx - 20, HEIGHT - 300)], fill=(75, 45, 25))
    # Foliage across panels
    draw.ellipse([cx - 360, HEIGHT - 550, cx + 360, HEIGHT - 180], fill=(255, 255, 255, 30))
    # Season labels
    labels = ["SPRING", "SUMMER", "AUTUMN", "WINTER"]
    for i, lab in enumerate(labels):
        draw.text((col_w * i + col_w // 2, 60), lab, fill=(35, 30, 25), anchor="mm")
    return img

# 8. our-story
def gen_our_story():
    img = create_gradient(WIDTH, HEIGHT, (245, 120, 70), (45, 15, 60))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Golden sun setting on sea horizon
    draw.ellipse([WIDTH // 2 - 80, HEIGHT // 2 - 80, WIDTH // 2 + 80, HEIGHT // 2 + 80], fill=(255, 240, 180))
    # Water reflection
    for y in range(HEIGHT // 2, HEIGHT, 12):
        w_span = int((y - HEIGHT // 2) * 1.6)
        draw.line([(WIDTH // 2 - w_span, y), (WIDTH // 2 + w_span, y)], fill=(255, 220, 140, 100), width=3)
    # Beach shore silhouette
    draw.polygon([(0, HEIGHT - 90), (WIDTH, HEIGHT - 160), (WIDTH, HEIGHT), (0, HEIGHT)], fill=(20, 10, 25))
    # Couple silhouette
    cx = WIDTH // 2 - 80
    cy = HEIGHT - 140
    # Person 1
    draw.ellipse([cx - 15, cy - 80, cx + 5, cy - 60], fill=(20, 10, 25))
    draw.rectangle([cx - 20, cy - 60, cx + 10, cy], fill=(20, 10, 25))
    # Person 2
    draw.ellipse([cx + 15, cy - 75, cx + 35, cy - 55], fill=(20, 10, 25))
    draw.rectangle([cx + 10, cy - 55, cx + 40, cy], fill=(20, 10, 25))
    # Holding hands
    draw.line([(cx + 5, cy - 25), (cx + 15, cy - 25)], fill=(20, 10, 25), width=5)
    return img

# 9. two-souls
def gen_two_souls():
    img = create_gradient(WIDTH, HEIGHT, (10, 15, 35), (20, 35, 60))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=140, bounds=(0, 0, WIDTH, HEIGHT // 2))
    # Calm water surface
    draw.rectangle([0, HEIGHT // 2 + 40, WIDTH, HEIGHT], fill=(12, 22, 45))
    # Two glowing lanterns on water
    def draw_lantern(lx, ly):
        draw.ellipse([lx - 50, ly - 20, lx + 50, ly + 20], fill=(255, 180, 50, 40))
        draw.rectangle([lx - 32, ly - 50, lx + 32, ly], fill=(255, 210, 90), outline=(220, 140, 30), width=2)
        draw.ellipse([lx - 20, ly - 40, lx + 20, ly - 10], fill=(255, 255, 210))
        # Water reflection
        draw.polygon([(lx - 25, ly + 5), (lx + 25, ly + 5), (lx, ly + 90)], fill=(255, 190, 60, 60))
    draw_lantern(WIDTH // 2 - 110, HEIGHT // 2 + 120)
    draw_lantern(WIDTH // 2 + 110, HEIGHT // 2 + 90)
    return img

# 10. memory-gallery
def gen_memory_gallery():
    img = create_gradient(WIDTH, HEIGHT, (40, 42, 48), (20, 22, 25))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Hardwood parquet floor
    draw.polygon([(0, HEIGHT - 180), (WIDTH, HEIGHT - 180), (WIDTH, HEIGHT), (0, HEIGHT)], fill=(65, 48, 35))
    # Floor planks perspective
    for x in range(0, WIDTH + 200, 100):
        draw.line([(x, HEIGHT - 180), (x - 200, HEIGHT)], fill=(45, 32, 22), width=2)
    # Museum framed art on wall
    frames = [(220, 140, 240, 300), (520, 110, 240, 330), (820, 140, 240, 300)]
    for fx, fy, fw, fh in frames:
        # Spotlight glow
        draw.polygon([(fx + fw // 2 - 20, 0), (fx + fw // 2 + 20, 0), (fx + fw + 40, fy + fh), (fx - 40, fy + fh)], fill=(255, 245, 210, 30))
        # Frame
        draw.rectangle([fx - 12, fy - 12, fx + fw + 12, fy + fh + 12], fill=(210, 180, 110))
        draw.rectangle([fx, fy, fx + fw, fy + fh], fill=(245, 240, 230))
        # Inner art photo
        draw.rectangle([fx + 25, fy + 25, fx + fw - 25, fy + fh - 50], fill=(90, 120, 150))
        draw.rectangle([fx + fw // 2 - 25, fy + fh - 35, fx + fw // 2 + 25, fy + fh - 20], fill=(200, 170, 100))
    return img

# 11. midnight-date
def gen_midnight_date():
    img = create_gradient(WIDTH, HEIGHT, (10, 10, 25), (35, 20, 45))
    draw = ImageDraw.Draw(img, 'RGBA')
    # City skyline silhouettes with glowing windows
    for bx, bw, bh in [(80, 140, 280), (240, 100, 360), (360, 180, 320), (560, 120, 420), (700, 160, 300), (880, 130, 350), (1030, 180, 260)]:
        draw.rectangle([bx, HEIGHT - bh, bx + bw, HEIGHT], fill=(15, 12, 25))
        # Windows
        for wx in range(bx + 15, bx + bw - 15, 20):
            for wy in range(HEIGHT - bh + 25, HEIGHT - 180, 30):
                if random.random() > 0.4:
                    draw.rectangle([wx, wy, wx + 8, wy + 14], fill=(255, 225, 140, random.randint(140, 255)))
    # Balcony table in foreground
    draw.rectangle([WIDTH // 2 - 160, HEIGHT - 160, WIDTH // 2 + 160, HEIGHT], fill=(240, 235, 225))
    # Candle in glass
    cx = WIDTH // 2
    draw.rectangle([cx - 15, HEIGHT - 210, cx + 15, HEIGHT - 160], fill=(255, 255, 255, 100), outline=(255, 255, 255, 200))
    draw.ellipse([cx - 10, HEIGHT - 225, cx + 10, HEIGHT - 205], fill=(255, 180, 40))
    # Two wine glasses
    for gx in [cx - 70, cx + 70]:
        draw.polygon([(gx - 18, HEIGHT - 220), (gx + 18, HEIGHT - 220), (gx, HEIGHT - 180)], fill=(200, 30, 60, 180))
        draw.line([(gx, HEIGHT - 180), (gx, HEIGHT - 160)], fill=(255, 255, 255, 160), width=3)
    return img

# 12. rose-garden
def gen_rose_garden():
    img = create_gradient(WIDTH, HEIGHT, (40, 65, 45), (15, 30, 20))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Soft garden bokeh
    for _ in range(35):
        bx = random.randint(50, WIDTH - 50)
        by = random.randint(50, HEIGHT - 50)
        br = random.randint(30, 90)
        draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(255, 210, 220, random.randint(20, 50)))
    # Clusters of lush roses
    def draw_rose(rx, ry, size, color):
        for ring in range(size, 8, -6):
            c = (color[0] + ring, color[1], color[2], 230)
            draw.ellipse([rx - ring, ry - ring, rx + ring, ry + ring], fill=c)
        draw.ellipse([rx - 8, ry - 8, rx + 8, ry + 8], fill=(120, 10, 30))
    roses = [
        (WIDTH // 2, HEIGHT // 2, 85, (220, 30, 70)),
        (WIDTH // 2 - 160, HEIGHT // 2 - 60, 70, (245, 80, 120)),
        (WIDTH // 2 + 180, HEIGHT // 2 - 40, 75, (210, 25, 60)),
        (WIDTH // 2 - 110, HEIGHT // 2 + 100, 65, (255, 140, 160)),
        (WIDTH // 2 + 120, HEIGHT // 2 + 90, 70, (230, 45, 85)),
    ]
    for rx, ry, s, col in roses:
        draw_rose(rx, ry, s, col)
    return img

# 13. polaroid-wall
def gen_polaroid_wall():
    img = create_gradient(WIDTH, HEIGHT, (55, 48, 42), (32, 28, 25))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Wooden panel lines
    for y in range(0, HEIGHT, 90):
        draw.line([(0, y), (WIDTH, y)], fill=(20, 18, 15), width=2)
    # Fairy light string drooping
    pts = [(60, 140), (WIDTH // 3, 200), (WIDTH * 2 // 3, 170), (WIDTH - 60, 210)]
    draw.line(pts, fill=(255, 235, 160, 180), width=3)
    for px, py in pts:
        draw.ellipse([px - 10, py - 10, px + 10, py + 10], fill=(255, 240, 120))
    # Hanging polaroids
    pols = [(260, 280, -6), (640, 290, 4), (1020, 280, -3)]
    for px, py, rot in pols:
        draw.line([(px, 170), (px, py - 130)], fill=(180, 160, 120), width=2)  # string clip
        draw.rectangle([px - 110, py - 130, px + 110, py + 140], fill=(250, 248, 244))  # card
        draw.rectangle([px - 90, py - 110, px + 90, py + 70], fill=(85, 115, 145))    # photo area
        draw.line([(px - 60, py + 105), (px + 60, py + 105)], fill=(120, 110, 100), width=3)  # caption line
    return img

# 14. forever-timeline
def gen_forever_timeline():
    img = create_gradient(WIDTH, HEIGHT, (15, 15, 35), (45, 25, 60))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=180)
    # Winding glowing path
    pts = [
        (WIDTH // 2, HEIGHT),
        (WIDTH // 2 + 120, HEIGHT - 180),
        (WIDTH // 2 - 100, HEIGHT - 340),
        (WIDTH // 2 + 60, HEIGHT - 480),
        (WIDTH // 2, HEIGHT - 600)
    ]
    # Glow path
    draw.line(pts, fill=(255, 210, 120, 60), width=28)
    draw.line(pts, fill=(255, 235, 180, 160), width=10)
    draw.line(pts, fill=(255, 255, 255), width=3)
    # Milestone nodes
    for px, py in pts:
        draw.ellipse([px - 18, py - 18, px + 18, py + 18], fill=(255, 200, 60))
        draw.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(255, 255, 255))
    return img

# 15. constellation-of-us
def gen_constellation_of_us():
    img = create_gradient(WIDTH, HEIGHT, (8, 12, 28), (25, 15, 45))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=250)
    # Constellation 1 (heart / figure 1)
    c1 = [(380, 320), (460, 240), (560, 270), (520, 380), (440, 460), (380, 320)]
    # Constellation 2 (connected)
    c2 = [(560, 270), (680, 220), (780, 260), (840, 360), (740, 460), (620, 430), (520, 380)]
    # Draw constellation lines
    draw.line(c1, fill=(255, 225, 140, 180), width=2)
    draw.line(c2, fill=(255, 225, 140, 180), width=2)
    # Star nodes
    for px, py in set(c1 + c2):
        draw.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(255, 240, 150))
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255))
    return img

# 16. secret-garden
def gen_secret_garden():
    img = create_gradient(WIDTH, HEIGHT, (25, 45, 30), (12, 24, 15))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Sunlight stream through arch
    draw.polygon([(WIDTH // 2, 0), (WIDTH // 2 - 200, HEIGHT), (WIDTH // 2 + 200, HEIGHT)], fill=(255, 245, 190, 45))
    # Stone arch
    cx, cy = WIDTH // 2, HEIGHT // 2 + 40
    draw.arc([cx - 240, cy - 240, cx + 240, cy + 240], 180, 360, fill=(110, 105, 95), width=50)
    draw.rectangle([cx - 240, cy, cx - 190, HEIGHT], fill=(110, 105, 95))
    draw.rectangle([cx + 190, cy, cx + 240, HEIGHT], fill=(110, 105, 95))
    # Hanging wisteria / lavender flowers
    for _ in range(80):
        vx = random.randint(cx - 260, cx + 260)
        vy_start = random.randint(cy - 200, cy - 80)
        length = random.randint(40, 130)
        draw.line([(vx, vy_start), (vx, vy_start + length)], fill=(160, 110, 210, 190), width= random.randint(4, 8))
    return img

# 17. vinyl-love
def gen_vinyl_love():
    img = create_gradient(WIDTH, HEIGHT, (35, 30, 32), (18, 16, 18))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = WIDTH // 2 - 80, HEIGHT // 2
    # Vinyl record grooves
    for r in range(260, 90, -8):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(30, 28, 30), width=4)
    # Vinyl label (red)
    draw.ellipse([cx - 90, cy - 90, cx + 90, cy + 90], fill=(210, 35, 45))
    # Spindle hole
    draw.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], fill=(240, 240, 240))
    # Tonearm
    draw.line([(WIDTH - 220, 140), (cx + 50, cy - 20)], fill=(200, 195, 190), width=10)
    draw.ellipse([WIDTH - 240, 120, WIDTH - 200, 160], fill=(140, 135, 130))
    return img

# 18. candlelight-dinner
def gen_candlelight_dinner():
    img = create_gradient(WIDTH, HEIGHT, (18, 10, 14), (8, 5, 8))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Table surface
    draw.rectangle([0, HEIGHT - 220, WIDTH, HEIGHT], fill=(45, 15, 20))
    # Candles
    for cx in [WIDTH // 2 - 120, WIDTH // 2 + 120]:
        # Taper stick
        draw.rectangle([cx - 6, HEIGHT - 360, cx + 6, HEIGHT - 220], fill=(245, 240, 230))
        # Flame glow
        draw.ellipse([cx - 45, HEIGHT - 410, cx + 45, HEIGHT - 320], fill=(255, 180, 50, 45))
        draw.ellipse([cx - 10, HEIGHT - 395, cx + 10, HEIGHT - 360], fill=(255, 220, 90))
        draw.ellipse([cx - 4, HEIGHT - 385, cx + 4, HEIGHT - 365], fill=(255, 255, 240))
    # Silver plate & cloche
    pcx = WIDTH // 2
    draw.ellipse([pcx - 120, HEIGHT - 180, pcx + 120, HEIGHT - 110], fill=(210, 215, 220))
    draw.arc([pcx - 85, HEIGHT - 240, pcx + 85, HEIGHT - 130], 180, 360, fill=(230, 235, 240), width=6)
    return img

# 19. parallel-universes
def gen_parallel_universes():
    img = create_gradient(WIDTH, HEIGHT, (12, 10, 25), (30, 15, 45))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=220)
    # Three glowing dimensional doorways
    doors = [(320, (60, 220, 180)), (640, (230, 70, 210)), (960, (255, 200, 60))]
    for dx, col in doors:
        # Doorway glow
        draw.ellipse([dx - 120, HEIGHT // 2 - 180, dx + 120, HEIGHT // 2 + 220], fill=(col[0], col[1], col[2], 50))
        # Arch door
        draw.arc([dx - 80, HEIGHT // 2 - 180, dx + 80, HEIGHT // 2 - 20], 180, 360, fill=col, width=6)
        draw.line([(dx - 80, HEIGHT // 2 - 100), (dx - 80, HEIGHT - 100)], fill=col, width=6)
        draw.line([(dx + 80, HEIGHT // 2 - 100), (dx + 80, HEIGHT - 100)], fill=col, width=6)
        # Inner radiant light
        draw.rectangle([dx - 70, HEIGHT // 2 - 90, dx + 70, HEIGHT - 105], fill=(col[0], col[1], col[2], 140))
    return img

# 20. message-in-the-stars
def gen_message_in_the_stars():
    img = create_gradient(WIDTH, HEIGHT, (5, 8, 22), (20, 15, 40))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=280)
    # Sparkling trail of stardust forming glowing letters / words
    for a in range(120):
        t = a / 120
        x = int(220 + t * 840 + math.sin(t * 12) * 40)
        y = int(HEIGHT // 2 + math.sin(t * 6) * 100)
        r = random.randint(3, 8)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 235, 160, 220))
    # Big sparkling star
    sx, sy = WIDTH // 2, HEIGHT // 2 - 120
    draw.line([(sx - 40, sy), (sx + 40, sy)], fill=(255, 255, 255), width=3)
    draw.line([(sx, sy - 40), (sx, sy + 40)], fill=(255, 255, 255), width=3)
    return img

# 21. gift-box
def gen_gift_box():
    img = create_gradient(WIDTH, HEIGHT, (25, 22, 38), (12, 10, 18))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = WIDTH // 2, HEIGHT // 2 + 50
    # Light beam bursting from slightly open box
    draw.polygon([(cx - 80, cy - 80), (cx + 80, cy - 80), (cx + 260, 0), (cx - 260, 0)], fill=(255, 235, 140, 90))
    # Box base (midnight blue)
    draw.rectangle([cx - 150, cy - 60, cx + 150, cy + 180], fill=(20, 35, 70), outline=(220, 185, 90), width=4)
    # Gold ribbon vertical
    draw.rectangle([cx - 25, cy - 60, cx + 25, cy + 180], fill=(230, 195, 80))
    # Box lid tilted
    draw.polygon([(cx - 170, cy - 85), (cx + 170, cy - 130), (cx + 170, cy - 80), (cx - 170, cy - 35)], fill=(30, 50, 95))
    # Bow loops
    draw.ellipse([cx - 65, cy - 160, cx - 10, cy - 110], outline=(245, 215, 100), width=8)
    draw.ellipse([cx + 10, cy - 160, cx + 65, cy - 110], outline=(245, 215, 100), width=8)
    return img

# 22. cinema-date
def gen_cinema_date():
    img = create_gradient(WIDTH, HEIGHT, (10, 8, 15), (28, 12, 18))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Big bright cinema screen in distance
    draw.rectangle([WIDTH // 2 - 380, 80, WIDTH // 2 + 380, 360], fill=(245, 240, 230))
    # Projector cone beam
    draw.polygon([(WIDTH // 2, 0), (WIDTH // 2 - 380, 80), (WIDTH // 2 + 380, 80)], fill=(255, 255, 255, 60))
    # Screen movie subtitle / graphic
    draw.text((WIDTH // 2, 220), "TONIGHT'S FEATURE : THE STORY OF US", fill=(20, 15, 25), anchor="mm")
    # Red velvet cinema seat backs in foreground
    for x in range(80, WIDTH, 160):
        draw.arc([x - 70, HEIGHT - 200, x + 70, HEIGHT - 40], 180, 360, fill=(160, 20, 35), width=24)
        draw.rectangle([x - 65, HEIGHT - 120, x + 65, HEIGHT], fill=(120, 15, 25))
    return img

# 23. digital-heartbeat
def gen_digital_heartbeat():
    img = create_gradient(WIDTH, HEIGHT, (8, 10, 16), (15, 18, 30))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Tech grid lines
    for x in range(0, WIDTH, 40):
        draw.line([(x, 0), (x, HEIGHT)], fill=(20, 35, 55, 100), width=1)
    for y in range(0, HEIGHT, 40):
        draw.line([(0, y), (WIDTH, y)], fill=(20, 35, 55, 100), width=1)
    # ECG heartbeat wave points
    cy = HEIGHT // 2
    points = [
        (60, cy), (400, cy),
        (440, cy - 30), (470, cy + 40),
        (510, cy - 180), (550, cy + 120),
        (580, cy - 40), (620, cy),
        (WIDTH - 60, cy)
    ]
    # Neon glow
    draw.line(points, fill=(255, 40, 120, 80), width=14)
    draw.line(points, fill=(255, 60, 140, 180), width=6)
    draw.line(points, fill=(255, 255, 255), width=2)
    return img

# 24. forever-letterbox
def gen_forever_letterbox():
    img = create_gradient(WIDTH, HEIGHT, (230, 130, 80), (45, 25, 40))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Soft romantic sun flare
    draw.ellipse([WIDTH // 2 - 140, HEIGHT // 2 - 140, WIDTH // 2 + 140, HEIGHT // 2 + 140], fill=(255, 245, 200, 180))
    # 2.39:1 Cinematic letterbox bars
    bar_h = 75
    draw.rectangle([0, 0, WIDTH, bar_h], fill=(0, 0, 0))
    draw.rectangle([0, HEIGHT - bar_h, WIDTH, HEIGHT], fill=(0, 0, 0))
    draw.text((WIDTH - 120, HEIGHT - bar_h // 2), "2.39 : 1", fill=(120, 120, 120), anchor="mm")
    return img

# 25. handwritten-journal
def gen_handwritten_journal():
    img = create_gradient(WIDTH, HEIGHT, (45, 35, 28), (25, 20, 16))
    draw = ImageDraw.Draw(img, 'RGBA')
    # Open leather journal pages
    jx, jy, jw, jh = WIDTH // 2, HEIGHT // 2, 420, 260
    draw.rectangle([jx - jw, jy - jh, jx + jw, jy + jh], fill=(242, 234, 218))
    # Center fold
    draw.line([(jx, jy - jh), (jx, jy + jh)], fill=(180, 165, 145), width=4)
    # Lined text representation
    for side in [-1, 1]:
        start_x = jx + 40 if side == 1 else jx - jw + 50
        end_x = jx + jw - 50 if side == 1 else jx - 40
        for y in range(jy - jh + 60, jy + jh - 40, 32):
            draw.line([(start_x, y), (end_x, y)], fill=(120, 100, 85, 160), width=2)
    # Brass fountain pen resting across page
    draw.line([(jx - 80, jy + 120), (jx + 140, jy - 100)], fill=(210, 175, 75), width=10)
    return img

# 26. our-little-universe
def gen_our_little_universe():
    img = create_gradient(WIDTH, HEIGHT, (10, 8, 20), (25, 18, 35))
    draw = ImageDraw.Draw(img, 'RGBA')
    add_stars(draw, count=220)
    cx, cy = WIDTH // 2, HEIGHT // 2
    # Brass Orrery orbital rings
    rings = [100, 160, 230, 310]
    for r in rings:
        draw.ellipse([cx - r, cy - r // 2, cx + r, cy + r // 2], outline=(215, 180, 95, 170), width=2)
    # Central golden Sun
    draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(255, 215, 60))
    # Planets on rings
    planets = [
        (cx - 95, cy - 20, 10, (140, 190, 240)),
        (cx + 150, cy + 25, 14, (230, 110, 60)),
        (cx - 200, cy + 60, 18, (180, 140, 210)),
        (cx + 280, cy - 70, 12, (90, 210, 160))
    ]
    for px, py, pr, pcol in planets:
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=pcol)
    # Stand / base
    draw.polygon([(cx - 30, cy + 40), (cx + 30, cy + 40), (cx + 60, HEIGHT - 80), (cx - 60, HEIGHT - 80)], fill=(160, 130, 65))
    return img

GENERATORS = {
    'comic-book': gen_comic_book,
    'fairytale': gen_fairytale,
    'festival': gen_festival,
    'cosmic-journey': gen_cosmic_journey,
    'coffee-memories': gen_coffee_memories,
    'digital-future': gen_digital_future,
    'four-seasons': gen_four_seasons,
    'our-story': gen_our_story,
    'two-souls': gen_two_souls,
    'memory-gallery': gen_memory_gallery,
    'midnight-date': gen_midnight_date,
    'rose-garden': gen_rose_garden,
    'polaroid-wall': gen_polaroid_wall,
    'forever-timeline': gen_forever_timeline,
    'constellation-of-us': gen_constellation_of_us,
    'secret-garden': gen_secret_garden,
    'vinyl-love': gen_vinyl_love,
    'candlelight-dinner': gen_candlelight_dinner,
    'parallel-universes': gen_parallel_universes,
    'message-in-the-stars': gen_message_in_the_stars,
    'gift-box': gen_gift_box,
    'cinema-date': gen_cinema_date,
    'digital-heartbeat': gen_digital_heartbeat,
    'forever-letterbox': gen_forever_letterbox,
    'handwritten-journal': gen_handwritten_journal,
    'our-little-universe': gen_our_little_universe
}

for template_id, gen_fn in GENERATORS.items():
    dest = os.path.join(OUTPUT_DIR, f"{template_id}.webp")
    # Only generate if file doesn't already exist or if we want to write it
    if not os.path.exists(dest):
        print(f"Generating {template_id}...")
        image = gen_fn()
        image.save(dest, 'WEBP', quality=88)
        print(f"Saved {dest} ({os.path.getsize(dest)} bytes)")
    else:
        print(f"Skipping {template_id}, already exists.")
print("All 39 templates now have .webp images!")
