#!/usr/bin/env python3
"""Generate premium transparent PNG product renders under public/products/."""

from __future__ import annotations

import re
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src" / "lib" / "smartphone-demo-catalog.ts"
OUT = ROOT / "public" / "products"

SIZE = 900

COLOR_RGB: dict[str, tuple[int, int, int]] = {
    "black": (28, 28, 32),
    "blue": (45, 85, 145),
    "white": (235, 236, 240),
    "silver": (185, 192, 202),
    "gold": (198, 168, 110),
    "natural": (168, 158, 148),
    "desert": (178, 148, 108),
    "pink": (228, 140, 168),
    "green": (52, 120, 88),
    "purple": (110, 78, 160),
    "gray": (95, 100, 108),
}


def parse_catalog() -> list[tuple[str, str, list[str]]]:
    text = CATALOG.read_text(encoding="utf-8")
    blocks = re.findall(
        r'key: "([^"]+)"\s*,\s*slug: "[^"]+"\s*,\s*categoryKey: "(iphone|samsung)"[\s\S]*?colors: \[([\s\S]*?)\],',
        text,
    )
    products: list[tuple[str, str, list[str]]] = []
    for key, cat, colors_block in blocks:
        brand = "apple" if cat == "iphone" else "samsung"
        colors = re.findall(r'value: "([^"]+)"', colors_block)
        products.append((brand, key, colors))
    return products


def tint(base: tuple[int, int, int], factor: float = 1.0) -> tuple[int, int, int]:
    return tuple(min(255, max(0, int(c * factor))) for c in base)


def add_shadow(img: Image.Image, cx: int, cy: int, rx: int, ry: int) -> None:
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow)


def draw_standard_phone(body: tuple[int, int, int], style: str) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    w, h = SIZE, SIZE
    pw = int(w * 0.34)
    ph = int(h * 0.76)
    x0 = (w - pw) // 2
    y0 = (h - ph) // 2 - int(h * 0.02)
    radius = int(pw * 0.16 if style == "apple" else pw * 0.12)

    add_shadow(img, w // 2, y0 + ph + int(h * 0.04), int(pw * 0.55), int(h * 0.035))

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # metallic edge
    d.rounded_rectangle((x0 - 2, y0 - 2, x0 + pw + 2, y0 + ph + 2), radius=radius + 2, fill=(*tint(body, 1.35), 255))
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=radius, fill=(*body, 255))

    inset = int(pw * 0.055)
    sx0, sy0 = x0 + inset, y0 + inset
    sx1, sy1 = x0 + pw - inset, y0 + ph - inset
    d.rounded_rectangle((sx0, sy0, sx1, sy1), radius=max(8, radius - inset), fill=(8, 10, 14, 255))

    # screen gloss
    d.rounded_rectangle((sx0, sy0, sx1, sy1), radius=max(8, radius - inset), fill=(18, 22, 30, 255))
    gloss_h = int((sy1 - sy0) * 0.45)
    d.rounded_rectangle((sx0, sy0, sx1, sy0 + gloss_h), radius=max(8, radius - inset), fill=(255, 255, 255, 18))

    if style == "apple":
        di_w = int(pw * 0.28)
        di_h = int(ph * 0.028)
        d.rounded_rectangle(
            (x0 + pw // 2 - di_w // 2, y0 + int(ph * 0.045), x0 + pw // 2 + di_w // 2, y0 + int(ph * 0.045) + di_h),
            radius=di_h // 2,
            fill=(4, 4, 6, 255),
        )

    # camera bump (back-style accent visible on hero angle)
    cam = int(pw * 0.22)
    cx = x0 + pw - inset - cam - int(pw * 0.04)
    cy = y0 + int(ph * 0.08)
    d.rounded_rectangle((cx, cy, cx + cam, cy + cam), radius=int(cam * 0.22), fill=(22, 24, 28, 230), outline=(180, 185, 195, 80))
    for i, (ox, oy) in enumerate([(0.28, 0.28), (0.68, 0.28), (0.48, 0.68)]):
        r = int(cam * 0.11)
        px = cx + int(cam * ox)
        py = cy + int(cam * oy)
        d.ellipse((px - r, py - r, px + r, py + r), fill=(12, 14, 18, 255), outline=(120, 130, 150, 100))

    # highlight stripe (titanium feel)
    d.rectangle((x0 + int(pw * 0.08), y0 + int(ph * 0.15), x0 + int(pw * 0.11), y0 + int(ph * 0.75)), fill=(255, 255, 255, 22))

    img.alpha_composite(layer)
    return img


def draw_z_flip(body: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    w, h = SIZE, SIZE
    pw = int(w * 0.42)
    ph = int(h * 0.52)
    x0 = (w - pw) // 2
    y0 = (h - ph) // 2
    add_shadow(img, w // 2, y0 + ph + 20, int(pw * 0.5), 22)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    r = int(pw * 0.14)
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=r, fill=(*body, 255))
    d.rounded_rectangle((x0 + 6, y0 + 6, x0 + pw - 6, y0 + ph - 6), radius=r - 4, fill=(10, 12, 16, 255))
    d.rectangle((x0, y0 + ph // 2 - 2, x0 + pw, y0 + ph // 2 + 2), fill=(40, 42, 48, 200))
    img.alpha_composite(layer)
    return img


def draw_z_fold(body: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    w, h = SIZE, SIZE
    pw = int(w * 0.62)
    ph = int(h * 0.72)
    x0 = (w - pw) // 2
    y0 = (h - ph) // 2
    add_shadow(img, w // 2, y0 + ph + 24, int(pw * 0.48), 26)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    r = int(ph * 0.06)
    half = pw // 2
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=r, fill=(*body, 255))
    d.line((x0 + half, y0 + 8, x0 + half, y0 + ph - 8), fill=(30, 32, 38, 220), width=3)
    d.rounded_rectangle((x0 + 10, y0 + 10, x0 + pw - 10, y0 + ph - 10), radius=r - 6, fill=(8, 10, 14, 255))
    img.alpha_composite(layer)
    return img


def slug_color(name: str) -> str:
    n = name.lower()
    for key in COLOR_RGB:
        if key in n:
            return key
    return "black"


def render_product(brand: str, model: str, color_name: str) -> None:
    slug = slug_color(color_name)
    rgb = COLOR_RGB.get(slug, COLOR_RGB["black"])
    style = "apple" if brand == "apple" else "samsung"
    if "z-flip" in model:
        img = draw_z_flip(rgb)
    elif "z-fold" in model:
        img = draw_z_fold(rgb)
    else:
        img = draw_standard_phone(rgb, style)

    out_dir = OUT / brand / model
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{slug}.png"
    img.save(out, "PNG", optimize=True)
    print("wrote", out.relative_to(ROOT))


def main() -> None:
    count = 0
    for brand, model, colors in parse_catalog():
        seen: set[str] = set()
        for color in colors:
            slug = slug_color(color)
            if slug in seen:
                continue
            seen.add(slug)
            render_product(brand, model, color)
            count += 1
    print(f"Done — {count} PNG files in {OUT}")


if __name__ == "__main__":
    main()
