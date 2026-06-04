"""
Process PDI source images for the home diagram.
Scales each strategic line PNG to target size for the hexagonal layout.
Generates sphere texture from Comunidad.png.
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDI_DIR = os.path.join(ROOT, "PDI")
BRAND = os.path.join(ROOT, "public", "img", "brand")

REF_W = 700  # reference canvas width

# Each line: (filename, target_width_pct, target_center_x, target_center_y, key)
# target_width_pct = percentage of reference width the image should occupy (2*rx)
lines = [
    ("SOSTENIBILIDAD.png", 0.48, "sos"),
    ("Calidad.png",        0.28, "cal"),
    ("Expansion.png",      0.28, "exp"),
    ("Eduvida.png",        0.30, "edu"),
    ("Experiencia.png",    0.24, "exp2"),
    ("Tranformacion.png",  0.48, "to"),
]

for fname, width_pct, key in lines:
    src = os.path.join(PDI_DIR, fname)
    img = Image.open(src).convert("RGBA")
    w, h = img.size

    target_w = int(REF_W * width_pct)
    target_h = int(h * target_w / w)

    scaled = img.resize((target_w, target_h), Image.LANCZOS)

    out_name = f"pd-{key}.png"
    out_path = os.path.join(BRAND, out_name)
    scaled.save(out_path, "PNG")
    print(f"  {fname:25s} {w:4}×{h:<4} -> {out_name:15s} {target_w:3}×{target_h}")

# ===== Sphere texture from Comunidad.png =====
print("\nGenerating sphere front texture...")
com = Image.open(os.path.join(PDI_DIR, "Comunidad.png")).convert("RGBA")
SPH = 512

# Center-crop to square then make circle
crop_size = min(com.width, com.height)
left = (com.width - crop_size) // 2
top = (com.height - crop_size) // 2
cropped = com.crop((left, top, left + crop_size, top + crop_size))

circ = Image.new("RGBA", (SPH, SPH), (0, 0, 0, 0))
resized = cropped.resize((SPH, SPH), Image.LANCZOS)
mask = Image.new("L", (SPH, SPH), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse([(0, 0), (SPH - 1, SPH - 1)], fill=255)
circ.paste(resized, (0, 0), mask)

out_path = os.path.join(BRAND, "sphere-front.png")
circ.save(out_path, "PNG")
print(f"  sphere-front.png saved ({os.path.getsize(out_path)} bytes)")

print("\nDone!")
