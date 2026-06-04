import re, base64, os, sys

html_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "PDI2025_v5 (21).html")
output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "img")

os.makedirs(output_dir, exist_ok=True)

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Find ALL data URIs - both in src attributes and in JS strings
pattern = r"data:(image/\w+);base64,([A-Za-z0-9+/=]+)"
matches = list(re.finditer(pattern, html))

print(f"Found {len(matches)} base64 images total")

# Group by content hash to find unique images
seen = {}
for i, m in enumerate(matches):
    mime = m.group(1)
    b64 = m.group(2)
    ext = mime.split('/')[-1]
    try:
        content = base64.b64decode(b64)
        content_preview = content[:500]
        h = hash(content_preview)
        if h not in seen:
            seen[h] = {"mime": mime, "ext": ext, "b64": b64, "content": content, "count": 0}
        seen[h]["count"] += 1
    except Exception as e:
        print(f"  Error decoding match {i}: {e}")

print(f"\nUnique images: {len(seen)}")
print()

# Sort by size
items = sorted(seen.items(), key=lambda x: len(x[1]["content"]))

for idx, (h, info) in enumerate(items):
    ext = info["ext"]
    fname = f"extracted_{idx}.{ext}"
    fpath = os.path.join(output_dir, fname)
    with open(fpath, "wb") as f:
        f.write(info["content"])
    size_kb = len(info["content"]) / 1024
    print(f"  [{idx}] {fname} ({size_kb:.1f} KB) - appears {info['count']} time(s)")

print("\nDone extracting images.")
