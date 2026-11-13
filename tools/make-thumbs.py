# Makes small preview copies of every gallery photo listed in js/data.js into assets/images/gallery/thumbs/.
# Run after adding photos:  py tools/make-thumbs.py   (needs: pip install pillow)
import re, os
from PIL import Image, ImageOps

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = open(os.path.join(root, "js", "data.js"), encoding="utf-8").read()
srcs = sorted(set(re.findall(r'src:\s*"(assets/images/gallery/[^"]+)"', data)))
made = skipped = 0
before = after = 0
for s in srcs:
    src_path = os.path.join(root, *s.split("/"))
    rel = s[len("assets/images/gallery/"):]
    out_path = os.path.join(root, "assets", "images", "gallery", "thumbs", *rel.split("/"))
    if not os.path.exists(src_path):
        skipped += 1
        continue
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src_path))
    im.thumbnail((720, 1080), Image.LANCZOS)
    ext = os.path.splitext(out_path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        im.convert("RGB").save(out_path, "JPEG", quality=80, optimize=True, progressive=True)
    elif ext == ".webp":
        im.save(out_path, "WEBP", quality=78, method=4)
    else:
        im.save(out_path)
    made += 1
    before += os.path.getsize(src_path)
    after += os.path.getsize(out_path)
print("thumbs made:", made, "missing:", skipped)
print("original MB: %.1f  ->  thumbs MB: %.1f" % (before / 1e6, after / 1e6))
