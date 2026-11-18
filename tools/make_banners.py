"""Generates the Hampshire County Roleplay banners into /assets using assets/logo.png.
Optional: replace the PNGs with your own (same filenames)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, random

F = "/usr/share/fonts/truetype/google-fonts/"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "assets")
LOGO = Image.open(os.path.join(OUT, "logo.png")).convert("RGBA")
W, H = 1500, 500

GOLD = (201, 168, 76)
TEXT = (226, 234, 247)

def font(name, size):
    return ImageFont.truetype(F + name, size)

def fade_logo(size, opacity):
    lg = LOGO.resize((size, size), Image.LANCZOS)
    a = lg.getchannel("A").point(lambda v: int(v * opacity))
    lg.putalpha(a)
    return lg

def background(seed):
    random.seed(seed)
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            t = y / H
            dx = (x - W / 2) / (W / 2)
            glow = max(0.0, 1 - math.hypot(dx * 0.9, (y - H * 0.45) / H * 1.6))
            r = 14 + 22 * t * 0 + 20 * glow + 6 * (1 - t)
            g = 30 + 34 * glow + 8 * (1 - t)
            b = 70 + 62 * glow + 18 * (1 - t) - 16 * t
            v = 1 - 0.34 * dx * dx
            px[x, y] = (int(r * v), int(g * v), int(b * v))
    img = img.convert("RGBA")
    # soft light rays from the centre-top
    rays = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rays)
    for i in range(-6, 7):
        ang = i * 0.13
        rd.polygon([(W / 2, -40), (W / 2 + math.tan(ang - 0.04) * (H + 80), H), (W / 2 + math.tan(ang + 0.04) * (H + 80), H)], fill=(160, 190, 255, 9))
    img = Image.alpha_composite(img, rays.filter(ImageFilter.GaussianBlur(6)))
    # big ghost logo on the left, like the reference banners
    ghost = fade_logo(600, 0.22)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(ghost, (-90, H - 440))
    img = Image.alpha_composite(img, layer)
    return img

def rounded_frame(d, box, color, width=4, radius=10):
    d.rounded_rectangle(box, radius=radius, outline=color, width=width)

def banner(title, name, seed):
    img = background(seed)
    d = ImageDraw.Draw(img)
    rounded_frame(d, [36, 34, W - 36, H - 34], GOLD + (235,), 4)
    rounded_frame(d, [48, 46, W - 48, H - 46], GOLD + (90,), 1)

    size = 170
    tf = font("Poppins-BoldItalic.ttf", size)
    while d.textlength(title, font=tf) > W - 380:
        size -= 6
        tf = font("Poppins-BoldItalic.ttf", size)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(title, font=tf)
    ty = 128
    ld.text(((W - tw) / 2 + 5, ty + 5), title, font=tf, fill=(0, 6, 24, 130))
    ld.text(((W - tw) / 2, ty), title, font=tf, fill=TEXT + (255,))
    sf = font("Poppins-Bold.ttf", 34)
    sub = "HAMPSHIRE COUNTY ROLEPLAY"
    sw = ld.textlength(sub, font=sf)
    ld.text(((W - sw) / 2, ty + size + 22), sub, font=sf, fill=GOLD + (255,))
    img = Image.alpha_composite(img, layer)

    # small crisp logo + name tag, bottom-left
    small = LOGO.resize((92, 92), Image.LANCZOS)
    img.paste(small, (66, H - 160), small)
    d = ImageDraw.Draw(img)
    d.text((172, H - 132), "Hampshire County Roleplay", font=font("Poppins-Bold.ttf", 24), fill=TEXT + (255,))
    img.convert("RGB").save(os.path.join(OUT, name), optimize=True)

def footer():
    w, h = W, 90
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            dx = (x - w / 2) / (w / 2)
            t = 1 - abs(y - h / 2) / (h / 2)
            k = 1 - 0.3 * dx * dx
            px[x, y] = (int((14 + 28 * t) * k), int((30 + 48 * t) * k), int((70 + 80 * t) * k))
    d = ImageDraw.Draw(img)
    f = font("Poppins-Bold.ttf", 30)
    text = "HAMPSHIRE COUNTY ROLEPLAY"
    tw = d.textlength(text, font=f)
    x0 = (w - tw) / 2 - 28
    d.rectangle([x0, 14, x0 + tw + 56, h - 14], outline=GOLD, width=3)
    d.text(((w - tw) / 2, h / 2 - 24), text, font=f, fill=TEXT)
    for cx in (x0 - 60, x0 + tw + 56 + 60):
        lg = LOGO.resize((60, 60), Image.LANCZOS)
        img.paste(lg, (int(cx - 30), 15), lg)
    img.save(os.path.join(OUT, "footer.png"), optimize=True)

banner("VERIFICATION", "verification.png", 1)
banner("INFORMATION", "information.png", 2)
banner("REGULATIONS", "regulations.png", 3)
banner("SUPPORT", "support.png", 4)
footer()
print("done")
