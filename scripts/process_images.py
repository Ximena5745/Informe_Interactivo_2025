"""
Process images for the PDI report - Fixed version
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "img", "brand")
EXTRACTED = os.path.join(ROOT, "public", "img")

def make_circle_image(img, size):
    """Create a circular version of an image."""
    img = img.convert("RGBA")
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    resized = img.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([(0, 0), (size - 1, size - 1)], fill=255)
    out.paste(resized, (0, 0), mask)
    return out

# 1. Extract center circle from lineas-estrategicas.jpg
lineas_path = os.path.join(BRAND, "lineas-estrategicas.jpg")
img = Image.open(lineas_path).convert("RGBA")
W, H = img.size
print(f"lineas-estrategicas.jpg: {W}x{H}")

cx, cy = int(W * 0.355), int(H * 0.501)
diameter = int(W * 0.193)
radius = diameter // 2
print(f"Center at ({cx},{cy}), radius={radius}")

# Ensure crop rect is within bounds
left = max(0, cx - radius)
top = max(0, cy - radius)
right = min(W, cx + radius)
bottom = min(H, cy + radius)
crop_w = right - left
crop_h = bottom - top
print(f"Crop rect: ({left},{top})-({right},{bottom}) = {crop_w}x{crop_h}")

# Extract the circle region
circle_region = img.crop((left, top, right, bottom))
# Create circle mask for this region
mask = Image.new("L", (crop_w, crop_h), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse([(radius - crop_w + (cx - left), radius - crop_h + (cy - top)),
              (radius + crop_w - (right - cx) - 1, radius + crop_h - (bottom - cy) - 1)], fill=255)
# Actually simpler: since the crop should be centered on the circle
inner_radius = min(crop_w, crop_h) // 2
cx_inner = crop_w // 2
cy_inner = crop_h // 2
draw = ImageDraw.Draw(mask)
draw.ellipse([(cx_inner - inner_radius, cy_inner - inner_radius),
              (cx_inner + inner_radius - 1, cy_inner + inner_radius - 1)], fill=255)

circle_img = Image.new("RGBA", (crop_w, crop_h), (0, 0, 0, 0))
circle_img.paste(circle_region, (0, 0), mask)

circle_path = os.path.join(BRAND, "circulo-central.png")
circle_img.save(circle_path, "PNG")
print(f"Saved: {circle_path} ({os.path.getsize(circle_path)} bytes)")

# 2. Create diagram WITHOUT center circle
diagram_no_center = img.copy()
draw_erase = ImageDraw.Draw(diagram_no_center)
draw_erase.ellipse([(left, top), (right, bottom)], fill=(0, 0, 0, 0))
diagram_nc_path = os.path.join(BRAND, "lineas-estrategicas-nc.png")
diagram_no_center.save(diagram_nc_path, "PNG")
print(f"Saved: {diagram_nc_path} ({os.path.getsize(diagram_nc_path)} bytes)")

# 3. Copy extracted_0.png as comunidad-universitaria.png
comm_path = os.path.join(EXTRACTED, "extracted_0.png")
if os.path.exists(comm_path):
    comm_dest = os.path.join(BRAND, "comunidad-universitaria.png")
    Image.open(comm_path).save(comm_dest, "PNG")
    print(f"Saved: {comm_dest} ({os.path.getsize(comm_dest)} bytes)")

# 4. Copy extracted_3.jpeg as ciclo-estrategia.jpg
ciclo_path = os.path.join(EXTRACTED, "extracted_3.jpeg")
if os.path.exists(ciclo_path):
    ciclo_dest = os.path.join(BRAND, "ciclo-estrategia.jpg")
    Image.open(ciclo_path).save(ciclo_dest, "JPEG", quality=95)
    print(f"Saved: {ciclo_dest} ({os.path.getsize(ciclo_dest)} bytes)")

# 5. Create sphere textures
SPH = 512
comm = Image.open(os.path.join(BRAND, "comunidad-universitaria.png"))
front_tex = make_circle_image(comm, SPH)
front_path = os.path.join(BRAND, "sphere-front.png")
front_tex.save(front_path, "PNG")
print(f"Saved: {front_path} ({os.path.getsize(front_path)} bytes)")

logo = Image.open(os.path.join(BRAND, "logo-poli.jpg"))
back_tex = make_circle_image(logo, SPH)
back_path = os.path.join(BRAND, "sphere-back.png")
back_tex.save(back_path, "PNG")
print(f"Saved: {back_path} ({os.path.getsize(back_path)} bytes)")

print("\nDone!")
