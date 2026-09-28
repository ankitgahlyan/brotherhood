#!/usr/bin/env python3
import os
import shutil
import base64
import io
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SOURCE_IMAGE = "/home/zeta/.gemini/antigravity/brain/00977779-9b32-4751-8d0f-abf246b0576c/.user_uploaded/media_1790557693060.jpg"
WORKSPACE = "/home/zeta/jetton"

def backup_if_exists(filepath):
    if os.path.exists(filepath):
        base, ext = os.path.splitext(filepath)
        legacy_path = f"{base}.legacy{ext}"
        if not os.path.exists(legacy_path):
            shutil.copy2(filepath, legacy_path)
            print(f"Backed up: {filepath} -> {legacy_path}")

def generate_assets():
    print(f"Loading source image: {SOURCE_IMAGE}")
    src = Image.open(SOURCE_IMAGE).convert("RGB")
    arr = np.array(src, dtype=np.float32)

    cx, cy = 512, 517
    N = 1440
    thetas = np.linspace(0, 2 * np.pi, N, endpoint=False)
    detected_r = []

    print("Tracing chain boundary...")
    for theta in thetas:
        cos_t, sin_t = np.cos(theta), np.sin(theta)
        found_r = 400.0
        for r in np.arange(480, 380, -1.0):
            x = int(round(cx + r * cos_t))
            y = int(round(cy + r * sin_t))
            if 0 <= x < 1024 and 0 <= y < 1024:
                rgb = arr[y, x]
                is_chain = (np.mean(rgb) > 90) or (rgb[0] > 105 and rgb[1] > 80 and rgb[0] > rgb[2] + 20)
                if is_chain:
                    found_r = r
                    break
        detected_r.append(found_r)

    detected_r = np.array(detected_r)
    # Smooth contour with wrapping convolution
    kernel = np.ones(25) / 25.0
    smooth_r = np.convolve(np.pad(detected_r, 12, mode="wrap"), kernel, mode="valid")

    # 4x Supersampled anti-aliased mask
    scale = 4
    mask_ss = Image.new("L", (1024 * scale, 1024 * scale), 0)
    draw = ImageDraw.Draw(mask_ss)
    poly = []
    for i, theta in enumerate(thetas):
        r = smooth_r[i] + 2.0  # Preserve outermost golden specular highlight
        px = (cx + r * np.cos(theta)) * scale
        py = (cy + r * np.sin(theta)) * scale
        poly.append((px, py))
    draw.polygon(poly, fill=255)
    mask_ss = mask_ss.filter(ImageFilter.GaussianBlur(radius=2))
    mask = mask_ss.resize((1024, 1024), Image.Resampling.LANCZOS)

    # Cutout with transparent background
    cutout = src.copy().convert("RGBA")
    cutout.putalpha(mask)

    # Find tight bounding box of medallion
    bbox = cutout.getbbox()
    coin_cropped = cutout.crop(bbox)
    coin_w, coin_h = coin_cropped.size
    max_dim = max(coin_w, coin_h)

    print(f"Coin bounding box: {bbox}, size: {coin_w}x{coin_h}")

    # 1. Standard Master 1024x1024 (Adaptive ~2% margin: 984px content)
    target_content_size = 984
    scale_factor = target_content_size / max_dim
    new_w = int(round(coin_w * scale_factor))
    new_h = int(round(coin_h * scale_factor))
    coin_std = coin_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    master_1024 = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    paste_x = (1024 - new_w) // 2
    paste_y = (1024 - new_h) // 2
    master_1024.paste(coin_std, (paste_x, paste_y), coin_std)

    # 2. Maskable Master 1024x1024 (20% safe zone margin: 780px content)
    target_maskable_size = 780
    scale_factor_m = target_maskable_size / max_dim
    new_wm = int(round(coin_w * scale_factor_m))
    new_hm = int(round(coin_h * scale_factor_m))
    coin_maskable = coin_cropped.resize((new_wm, new_hm), Image.Resampling.LANCZOS)

    master_maskable_1024 = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    paste_xm = (1024 - new_wm) // 2
    paste_ym = (1024 - new_hm) // 2
    master_maskable_1024.paste(coin_maskable, (paste_xm, paste_ym), coin_maskable)

    # Pre-generate standard sizes
    def get_resized(master, size):
        return master.resize((size, size), Image.Resampling.LANCZOS)

    img_512 = get_resized(master_1024, 512)
    img_256 = get_resized(master_1024, 256)
    img_192 = get_resized(master_1024, 192)
    img_180 = get_resized(master_1024, 180)
    img_128 = get_resized(master_1024, 128)
    img_96 = get_resized(master_1024, 96)
    img_48 = get_resized(master_1024, 48)
    img_32 = get_resized(master_1024, 32)
    img_16 = get_resized(master_1024, 16)

    maskable_512 = get_resized(master_maskable_1024, 512)
    maskable_192 = get_resized(master_maskable_1024, 192)

    # Multi-resolution ICO bytes
    ico_buffer = io.BytesIO()
    img_48.save(
        ico_buffer,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[img_32, img_16]
    )
    ico_bytes = ico_buffer.getvalue()

    # High-Fidelity Embedded SVG
    png_512_buf = io.BytesIO()
    img_512.save(png_512_buf, format="PNG", optimize=True)
    b64_png = base64.b64encode(png_512_buf.getvalue()).decode("ascii")
    embedded_svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">\n'
        '  <title>Brotherhood Token</title>\n'
        f'  <image width="512" height="512" href="data:image/png;base64,{b64_png}"/>\n'
        '</svg>\n'
    )

    # Vectorized Traced SVG
    print("Generating vectorized traced SVG...")
    traced_size = 256
    img_traced_prep = master_1024.resize((traced_size, traced_size), Image.Resampling.LANCZOS)
    alpha_traced = np.array(img_traced_prep.split()[3]) > 64

    # Quantize RGB colors into 24 clusters
    paletted = img_traced_prep.convert("RGB").quantize(colors=24, method=Image.Quantize.MEDIANCUT)
    pal_arr = np.array(paletted)
    raw_palette = paletted.getpalette()

    def mask_to_rect_paths(mask):
        h, w = mask.shape
        visited = np.zeros((h, w), dtype=bool)
        path_cmds = []
        for y in range(h):
            for x in range(w):
                if mask[y, x] and not visited[y, x]:
                    rx = x
                    while rx < w and mask[y, rx] and not visited[y, rx]:
                        rx += 1
                    rw = rx - x
                    ry = y + 1
                    can_expand = True
                    while ry < h and can_expand:
                        if np.all(mask[ry, x:x+rw]) and not np.any(visited[ry, x:x+rw]):
                            ry += 1
                        else:
                            can_expand = False
                    rh = ry - y
                    visited[y:y+rh, x:x+rw] = True
                    path_cmds.append(f"M{x},{y}h{rw}v{rh}h{-rw}Z")
        return "".join(path_cmds)

    svg_paths = []
    # Sort palette colors by luminance
    color_indices = []
    for c_idx in range(24):
        r, g, b = raw_palette[c_idx*3 : c_idx*3 + 3]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        color_indices.append((lum, c_idx, r, g, b))
    color_indices.sort(key=lambda item: item[0])

    for _, c_idx, r, g, b in color_indices:
        c_mask = (pal_arr == c_idx) & alpha_traced
        if np.any(c_mask):
            d_str = mask_to_rect_paths(c_mask)
            if d_str:
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                svg_paths.append(f'  <path fill="{hex_color}" d="{d_str}"/>')

    traced_svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {traced_size} {traced_size}" width="100%" height="100%">\n'
        '  <title>Brotherhood Token (Vector Trace)</title>\n'
        + "\n".join(svg_paths)
        + "\n</svg>\n"
    )

    # 1. Export Master Package in public/branding/
    branding_dir = os.path.join(WORKSPACE, "public/branding")
    os.makedirs(branding_dir, exist_ok=True)
    print(f"Exporting master branding package to {branding_dir}...")

    master_1024.save(os.path.join(branding_dir, "brotherhood-token-1024.png"), optimize=True)
    img_512.save(os.path.join(branding_dir, "brotherhood-token-512.png"), optimize=True)
    img_256.save(os.path.join(branding_dir, "brotherhood-token-256.png"), optimize=True)
    img_128.save(os.path.join(branding_dir, "brotherhood-token-128.png"), optimize=True)
    master_1024.save(os.path.join(branding_dir, "brotherhood-token.webp"), format="WEBP", lossless=True)

    with open(os.path.join(branding_dir, "brotherhood-token.svg"), "w") as f:
        f.write(embedded_svg)
    with open(os.path.join(branding_dir, "brotherhood-token.traced.svg"), "w") as f:
        f.write(traced_svg)

    # 2. Deploy to apps/wallet/public/
    wallet_public = os.path.join(WORKSPACE, "apps/wallet/public")
    print(f"Deploying to {wallet_public}...")

    targets_wallet = [
        ("favicon.svg", embedded_svg, "text"),
        ("favicon.traced.svg", traced_svg, "text"),
        ("fi.svg", embedded_svg, "text"),
        ("fi.traced.svg", traced_svg, "text"),
        ("apple-touch-icon.png", img_180, "image"),
        ("favicon-96x96.png", img_96, "image"),
        ("favicon.ico", ico_bytes, "bytes"),
        ("web-app-manifest-192x192.png", img_192, "image"),
        ("web-app-manifest-512x512.png", maskable_512, "image"),
    ]

    for fname, data, dtype in targets_wallet:
        fpath = os.path.join(wallet_public, fname)
        backup_if_exists(fpath)
        if dtype == "text":
            with open(fpath, "w") as f:
                f.write(data)
        elif dtype == "bytes":
            with open(fpath, "wb") as f:
                f.write(data)
        elif dtype == "image":
            data.save(fpath, optimize=True)
        print(f"Wrote: {fpath}")

    # 3. Deploy to apps/wallet/public/dns/
    dns_public = os.path.join(wallet_public, "dns")
    if os.path.exists(dns_public):
        dns_png = os.path.join(dns_public, "bro-dns-logo.png")
        dns_svg = os.path.join(dns_public, "bro-dns-logo.svg")
        backup_if_exists(dns_png)
        backup_if_exists(dns_svg)
        img_512.save(dns_png, optimize=True)
        with open(dns_svg, "w") as f:
            f.write(embedded_svg)
        print(f"Wrote DNS logos in: {dns_public}")

    # 4. Deploy to root public/
    root_public = os.path.join(WORKSPACE, "public")
    print(f"Deploying to {root_public}...")

    targets_root = [
        ("logo.png", img_512, "image"),
        ("favicon.svg", embedded_svg, "text"),
        ("favicon.traced.svg", traced_svg, "text"),
        ("fi.svg", embedded_svg, "text"),
        ("fi.traced.svg", traced_svg, "text"),
        ("apple-touch-icon.png", img_180, "image"),
        ("icon-192.png", img_192, "image"),
        ("icon-512.png", img_512, "image"),
        ("icon-512-maskable.png", maskable_512, "image"),
        ("favicon-192x192.png", img_192, "image"),
        ("favicon-512x512.png", maskable_512, "image"),
    ]

    for fname, data, dtype in targets_root:
        fpath = os.path.join(root_public, fname)
        backup_if_exists(fpath)
        if dtype == "text":
            with open(fpath, "w") as f:
                f.write(data)
        elif dtype == "bytes":
            with open(fpath, "wb") as f:
                f.write(data)
        elif dtype == "image":
            data.save(fpath, optimize=True)
        print(f"Wrote: {fpath}")

    print("\nAll assets successfully generated and deployed!")

if __name__ == "__main__":
    generate_assets()
