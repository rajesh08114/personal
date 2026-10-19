import urllib.request
import io
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

os.makedirs('public/templates', exist_ok=True)
os.makedirs('public/people', exist_ok=True)

# Curated high-resolution Unsplash photos depicting people:
# Portraits of individuals, couples for romance, groups of friends for parties/milestones.
PEOPLE_PHOTOS = {
    # Main templates
    'balloon-festival': '1530103862676-de8c9debad1d', # girl with balloons celebrating
    'film-roll': '1492562080023-ab3db95bfbce',        # vintage film portrait of smiling people
    'time-capsule': '1511895426328-dc8714191300',     # nostalgic milestone portrait
    'comic-book': '1534528741775-53994a69daeb',       # energetic expressive portrait
    'fairytale': '1518895949257-7621c3c786d7',        # whimsical dreamy woman portrait
    'festival': '1516450360452-9312f5e86fc7',         # festival crowd friends dancing
    'cosmic-journey': '1509198397868-475647b2a1e5',   # person gazing at starry cosmos
    'coffee-memories': '1501339847302-ac426a4a7cbb',  # warm person smiling with coffee
    'digital-future': '1531746020798-e6953c6e8e04',   # retro synthwave stylish portrait
    'four-seasons': '1529156069898-49953e39b3ac',     # lifelong friends hugging outdoors

    # Love & Romance templates
    'our-story': '1529333166437-7750a6dd5a70',        # romantic couple at beach sunset
    'two-souls': '1516589178581-6cd7833ae3b2',        # intimate couple by the water
    'love-letter': '1531747056595-07f6cbbe10ad',      # couple holding hands with love letter
    'memory-gallery': '1519741497674-611481863552',   # dressed up couple in gallery
    'midnight-date': '1517841905240-472988babdf9',    # candlelit romantic date night
    'rose-garden': '1518895949257-7621c3c786d7',      # smiling woman with fresh roses
    'polaroid-wall': '1522543558187-768b6df7c25c',    # couple taking candid polaroid selfie
    'forever-timeline': '1515934751635-c81c6bc9a2d8', # couple walking together holding hands
    'constellation-of-us': '1524601500432-1e1a4c71d692', # couple stargazing under blanket
    'secret-garden': '1516589178581-6cd7833ae3b2',    # couple in enchanted botanical garden
    'vinyl-love': '1511671782779-c97d3d27a1d4',       # couple enjoying music & vinyl
    'candlelight-dinner': '1517841905240-472988babdf9', # intimate candlelit dinner for two
    'parallel-universes': '1492562080023-ab3db95bfbce', # two lovers looking at each other
    'message-in-the-stars': '1534528741775-53994a69daeb', # woman with starlight glow
    'gift-box': '1513151233558-d860c5398176',         # happy person holding birthday gift
    'cinema-date': '1489599849927-2ee91cede3ba',      # couple laughing at cinema date
    'digital-heartbeat': '1522543558187-768b6df7c25c', # modern couple close together
    'forever-letterbox': '1529333166437-7750a6dd5a70', # 2.39:1 widescreen romance
    'handwritten-journal': '1544005313-94ddf0286df2', # thoughtful heartfelt portrait
    'our-little-universe': '1518199266791-5375a83190b7' # couple embrace with fairy lights
}

# Also download distinct sample memories for interactive previews
SAMPLE_MEMORIES = {
    'maya_hero': '1494790108377-be9c29b29330',     # Maya (birthday girl portrait)
    'emma_noah_hero': '1529333166437-7750a6dd5a70',# Emma & Noah (romantic couple)
    'mem_roadtrip': '1469488865564-c2de10f69f96',  # Road trip with friends
    'mem_pancakes': '1522543558187-768b6df7c25c',  # Cooking/eating together
    'mem_concert': '1516450360452-9312f5e86fc7',   # Friends at concert
    'mem_museum': '1519741497674-611481863552',    # At museum/art exhibition
    'mem_graduation': '1523580494863-6f3031224c94',# Graduation joy
    'mem_picnic': '1464366400600-7168b8af9bc3',    # Picnic / birthday cake celebration
    'love_day_met': '1516589178581-6cd7833ae3b2',  # First date coffee
    'love_trip': '1515934751635-c81c6bc9a2d8',     # Vacation together
    'love_dancing': '1522543558187-768b6df7c25c',  # Dancing in the kitchen
    'love_lights': '1524601500432-1e1a4c71d692',   # Under night sky / cozy
    'love_sunday': '1518199266791-5375a83190b7',   # Rainy Sunday together
    'love_everyday': '1529333166437-7750a6dd5a70'  # Best ordinary day
}

def download_and_save(photo_id, dest_path, width=1280, height=720):
    url = f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&h={height}&q=82"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            im = Image.open(io.BytesIO(resp.read()))
            # Convert to RGB (in case of RGBA/P)
            if im.mode != 'RGB':
                im = im.convert('RGB')
            im.save(dest_path, 'WEBP', quality=84)
            print(f"Saved {dest_path} ({os.path.getsize(dest_path)} bytes)")
            return True
    except Exception as e:
        print(f"Error downloading {photo_id} for {dest_path}: {e}")
        return False

# Download template preview images featuring people
for template_id, photo_id in PEOPLE_PHOTOS.items():
    dest = os.path.join('public', 'templates', f"{template_id}.webp")
    print(f"Downloading person/people preview for template: {template_id}...")
    download_and_save(photo_id, dest, 1280, 720)

# Download sample memory & hero photos
for mem_key, photo_id in SAMPLE_MEMORIES.items():
    dest = os.path.join('public', 'people', f"{mem_key}.webp")
    if not os.path.exists(dest):
        print(f"Downloading sample memory photo: {mem_key}...")
        download_and_save(photo_id, dest, 1200, 800)

print("Finished applying people/person preview images!")
