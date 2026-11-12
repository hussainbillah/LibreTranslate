"""Contact sheet of review stills: python3 tools/sheet.py out.png still1.png still2.png ..."""
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in files]
w, h = ims[0].size
cols = 2 if len(ims) <= 4 else 3
rows = (len(ims) + cols - 1) // cols
s = Image.new("RGB", (w * cols, h * rows), "white")
for i, im in enumerate(ims):
    s.paste(im, ((i % cols) * w, (i // cols) * h))
s.resize((w * cols * 2 // 3 // (cols // 2 if cols > 2 else 1) if False else 2000, int(2000 * h * rows / (w * cols)))).save(out)
