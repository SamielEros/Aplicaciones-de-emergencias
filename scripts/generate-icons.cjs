const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <!-- Tactical Shield -->
  <path d="M256 64 L416 128 V272 C416 360 348 424 256 448 C164 424 96 360 96 272 V128 Z" fill="none" stroke="url(#gold)" stroke-width="24" stroke-linejoin="round"/>
  <!-- Central Command Core -->
  <circle cx="256" cy="240" r="64" fill="#1e293b" stroke="url(#gold)" stroke-width="12"/>
  <polygon points="256,200 270,228 300,232 278,252 284,282 256,266 228,282 234,252 212,232 242,228" fill="url(#gold)"/>
  <!-- Subtitle Text -->
  <text x="256" y="375" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#f8fafc" text-anchor="middle" letter-spacing="4">SCI · MÉXICO</text>
  <text x="256" y="405" font-family="system-ui, -apple-system, monospace" font-weight="700" font-size="18" fill="#f59e0b" text-anchor="middle" letter-spacing="2">NOM-010-SEGOB</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Function to generate a simple RGBA uncompressed PNG
function createPng(width, height, isMaskable = false) {
  // RGBA raw buffer
  const rowSize = width * 4 + 1; // 1 filter byte per line
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rShield = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Base background: Slate-950 (#020617)
      let r = 2, g = 6, b = 23, a = 255;

      const dx = x - cx;
      const dy = y - (cy - height * 0.04);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold shield circle / star representation in raster
      if (dist < rShield && dist > rShield - (width * 0.05)) {
        // Gold outline (#f59e0b)
        r = 245; g = 158; b = 11;
      } else if (dist <= rShield - (width * 0.05) && dist > width * 0.16) {
        // Slate-900 inner shield fill (#0f172a)
        r = 15; g = 23; b = 42;
      } else if (dist <= width * 0.16 && dist > width * 0.12) {
        // Ring
        r = 251; g = 191; b = 36;
      } else if (dist <= width * 0.12) {
        // Core Star center (#d97706)
        r = 217; g = 119; b = 6;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG chunks
  const compressed = zlib.deflateSync(rawData);

  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Header: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));

console.log('PWA icons created successfully in public/');
