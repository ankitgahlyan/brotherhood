// Generates the PWA icons + favicon into `public/`.
// Pure Node — no canvas/sharp dependency. Draws a simple rounded icon with a
// vertical sea-to-lagoon gradient, a subtle ring, and a light pip.
//
//   nub run icons   (or:  nub scripts/generate-icons.mjs)
//
// Outputs in public/:
//   favicon.svg, icon-192.png, icon-512.png,
//   icon-512-maskable.png, apple-touch-icon.png
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public');

// --- tiny PNG encoder -----------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // ihdr[10..12] = 0 compression/filter/interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// color helpers -------------------------------------------------------------
const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
const lerp = (a, b, t) => a + (b - a) * t;

const TOP = [171, 55, 236]; // #ab37ec brand violet
const BOTTOM = [229, 77, 94]; // #e54d5e brand coral
const RING = [255, 190, 200]; // light coral ring
const PIP = [247, 247, 252]; // near-white pip

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.5; // decorative ring max radius
  const corner = size * 0.18;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect distance
      const nx = Math.max(Math.abs(x - center + corner) - corner, 0);
      const ny = Math.max(Math.abs(y - center + corner) - corner, 0);
      const d = Math.hypot(nx, ny);
      const distFromCenter = Math.hypot(x - center, y - center);
      const t = y / size;

      // vertical gradient background
      let r = lerp(TOP[0], BOTTOM[0], t);
      let g = lerp(TOP[1], BOTTOM[1], t);
      let b = lerp(TOP[2], BOTTOM[2], t);

      // ring (lagoon) between two radii
      const ringInner = radius * 0.5;
      const ringOuter = radius * 0.72;
      const thickness = radius * 0.1;
      if (
        distFromCenter >= ringInner - thickness &&
        distFromCenter <= ringInner + thickness * 2.4
      ) {
        r = lerp(r, RING[0], 0.9);
        g = lerp(g, RING[1], 0.9);
        b = lerp(b, RING[2], 0.9);
      }

      let alpha = 255;
      // rounded-rect cutout
      if (d > corner) alpha = Math.max(0, 255 - (d - corner) * 60);

      // central pip
      if (distFromCenter < radius * 0.14) {
        r = PIP[0];
        g = PIP[1];
        b = PIP[2];
      }

      buf[i] = clamp(r);
      buf[i + 1] = clamp(g);
      buf[i + 2] = clamp(b);
      buf[i + 3] = alpha;
    }
  }
  return buf;
}

function writeIcon(name, size) {
  const png = encodePng(size, size, drawIcon(size));
  writeFileSync(join(OUT_DIR, name), png);
  console.log(
    `  ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`,
  );
}

mkdirSync(OUT_DIR, { recursive: true });

console.log('Generating icons into public/ …');

// SVG favicon (used by browsers; feather-weight)
writeFileSync(
  join(OUT_DIR, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ab37ec"/>
      <stop offset="1" stop-color="#e54d5e"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#g)"/>
  <circle cx="32" cy="32" r="12" fill="none" stroke="#ffbec8" stroke-width="7" opacity="0.9"/>
  <circle cx="32" cy="32" r="3.4" fill="#f7f7fc"/>
</svg>
`,
);
console.log('  favicon.svg');

writeIcon('icon-192.png', 192);
writeIcon('icon-512.png', 512);
writeIcon('icon-512-maskable.png', 512);
writeIcon('apple-touch-icon.png', 180);

console.log('done.');
