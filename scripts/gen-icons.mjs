// Zero-dependency PNG icon generator for the Nabed PWA.
// Renders the brand mark (teal rounded square + white medical cross) at several
// sizes using a hand-rolled PNG encoder (Node's built-in zlib). No SVG renderer
// or npm deps required.
import { deflateSync } from "node:zlib"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "public", "icons")
mkdirSync(OUT, { recursive: true })

const TEAL = [13, 122, 107] // #0d7a6b
const WHITE = [255, 255, 255]

// CRC32 (PNG)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, "ascii")
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // bytes 10-12 = 0 (compression, filter, interlace)
  // raw scanlines with filter byte 0
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

// Rounded-corner test (corner radius as fraction of size)
function inRoundedRect(x, y, size, radius) {
  const r = radius
  const minX = r, maxX = size - r, minY = r, maxY = size - r
  if (x >= minX && x <= maxX) return true
  if (y >= minY && y <= maxY) return true
  // corners
  const cx = x < minX ? minX : maxX
  const cy = y < minY ? minY : maxY
  const dx = x - cx, dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function drawIcon(size, { scale, rounded }) {
  const rgba = Buffer.alloc(size * size * 4)
  const box = size * scale
  const offset = (size - box) / 2
  const radius = rounded ? size * 0.22 : 0
  // cross geometry in 32-unit grid (matches src/app/icon.svg)
  const vX0 = 13 / 32, vX1 = 19 / 32, vY0 = 5 / 32, vY1 = 27 / 32
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      let color = null
      const bg = !rounded || inRoundedRect(x, y, size, radius)
      if (bg) {
        color = TEAL
        const cx = (x - offset) / box
        const cy = (y - offset) / box
        if (cx >= 0 && cx <= 1 && cy >= 0 && cy <= 1) {
          const vert = cx >= vX0 && cx <= vX1 && cy >= vY0 && cy <= vY1
          const horiz = cy >= vX0 && cy <= vX1 && cx >= vY0 && cx <= vY1
          if (vert || horiz) color = WHITE
        }
      }
      if (color) {
        rgba[i] = color[0]; rgba[i + 1] = color[1]; rgba[i + 2] = color[2]; rgba[i + 3] = 255
      } else {
        rgba[i] = 0; rgba[i + 1] = 0; rgba[i + 2] = 0; rgba[i + 3] = 0 // transparent outside rounded square
      }
    }
  }
  return encodePNG(size, rgba)
}

const targets = [
  { name: "icon-192.png", size: 192, scale: 0.9, rounded: true },
  { name: "icon-512.png", size: 512, scale: 0.9, rounded: true },
  { name: "icon-maskable-512.png", size: 512, scale: 0.6, rounded: false }, // full-bleed, safe zone
  { name: "apple-touch-icon.png", size: 180, scale: 0.78, rounded: false }, // iOS adds its own mask
]

for (const t of targets) {
  const png = drawIcon(t.size, t)
  writeFileSync(join(OUT, t.name), png)
  console.log("wrote", t.name, png.length, "bytes")
}
