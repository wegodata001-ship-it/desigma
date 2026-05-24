#!/usr/bin/env python3
"""Generate premium smartphone demo WebP assets for /public/demo/smartphones/."""

from __future__ import annotations

import os
import re
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "demo" / "smartphones"
OUT.mkdir(parents=True, exist_ok=True)

COLOR_HINTS: dict[str, tuple[int, int, int]] = {
    "black": (24, 24, 27),
    "blue": (37, 99, 235),
    "pink": (236, 72, 153),
    "white": (245, 245, 244),
    "green": (22, 163, 74),
    "silver": (203, 213, 225),
    "purple": (124, 58, 237),
    "violet": (139, 92, 246),
    "gray": (107, 114, 128),
    "grey": (107, 114, 128),
    "natural": (168, 162, 158),
    "desert": (180, 155, 120),
    "titanium": (120, 113, 108),
}


def hint_color(filename: str) -> tuple[int, int, int]:
    lower = filename.lower()
    for key, rgb in COLOR_HINTS.items():
        if key in lower:
            return rgb
    return (55, 65, 81)


def draw_phone(canvas: Image.Image, body: tuple[int, int, int], view: str) -> None:
    w, h = canvas.size
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, w, h), fill=(15, 23, 42))

    margin = int(w * 0.12)
    phone_w = int(w * 0.42)
    phone_h = int(h * 0.78)
    x0 = (w - phone_w) // 2
    y0 = (h - phone_h) // 2
    radius = int(phone_w * 0.14)

    if view == "side":
        phone_w = int(w * 0.12)
        x0 = (w - phone_w) // 2
        draw.rounded_rectangle((x0, y0, x0 + phone_w, y0 + phone_h), radius=8, fill=body, outline=(255, 255, 255, 40))
        return

    draw.rounded_rectangle((x0, y0, x0 + phone_w, y0 + phone_h), radius=radius, fill=body, outline=(255, 255, 255, 60))

    if view == "front":
        inset = int(phone_w * 0.06)
        draw.rounded_rectangle(
            (x0 + inset, y0 + inset, x0 + phone_w - inset, y0 + phone_h - inset),
            radius=max(8, radius - inset),
            fill=(10, 10, 12),
        )
        cam_y = y0 + int(phone_h * 0.04)
        draw.ellipse((x0 + phone_w // 2 - 8, cam_y, x0 + phone_w // 2 + 8, cam_y + 16), fill=(30, 30, 35))
    elif view == "back":
        cam_size = int(phone_w * 0.28)
        cx = x0 + phone_w // 2
        cy = y0 + int(phone_h * 0.22)
        draw.rounded_rectangle(
            (cx - cam_size // 2, cy - cam_size // 2, cx + cam_size // 2, cy + cam_size // 2),
            radius=12,
            fill=(20, 20, 24),
            outline=(180, 180, 190),
        )
    elif view == "cover":
        draw.rectangle((0, int(h * 0.72), w, h), fill=(0, 0, 0, 120))
        label = "DESIGMA"
        draw.text((margin, int(h * 0.78)), label, fill=(255, 255, 255))


def render(path_key: str, size: int = 900) -> None:
    name = Path(path_key).name
    if name.endswith(".webp"):
        name = name[:-5]

    if name.endswith("-cover"):
        base = name[: -len("-cover")]
        view = "cover"
    elif name.endswith("-front"):
        base = name[: -len("-front")]
        view = "front"
    elif name.endswith("-back"):
        base = name[: -len("-back")]
        view = "back"
    elif name.endswith("-side"):
        base = name[: -len("-side")]
        view = "side"
    else:
        base = name
        view = "front"

    body = hint_color(name)
    img = Image.new("RGB", (size, size), (15, 23, 42))
    draw_phone(img, body, view)

    out = OUT / f"{name}.webp"
    img.save(out, "WEBP", quality=88, method=6)
    print("wrote", out.relative_to(ROOT))


def collect_paths_from_catalog() -> list[str]:
    catalog = ROOT / "src" / "lib" / "smartphone-demo-catalog.ts"
    text = catalog.read_text(encoding="utf-8")
    paths = set(re.findall(r"demo/smartphones/[a-z0-9-]+\.webp", text))
    for m in re.findall(r"\$\{IMG\}/([a-z0-9-]+\.webp)", text):
        paths.add(f"demo/smartphones/{m}")
    for slug in re.findall(r'slug: "([a-z0-9]+)"', text):
        for suffix in ("cover", "front", "back", "side"):
            paths.add(f"demo/smartphones/{slug}-{suffix}.webp")
    return sorted(paths)


def main() -> None:
    for rel in collect_paths_from_catalog():
        render(rel)
    print(f"Done — {len(list(OUT.glob('*.webp')))} images in {OUT}")


if __name__ == "__main__":
    main()
