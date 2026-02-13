/**
 * Re-encode PNGs that fail AAPT compile on Android (e.g. 16-bit or unusual color profile).
 * Writes standard 8-bit RGBA PNGs that Android's resource compiler accepts.
 */
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const FILES = ['01.png', '02.png', '03.png', '04.png', '05.png', '05-1.png', '6.png', '7.png', '8-1.png'];

async function fixPng(fileName) {
  const inputPath = path.join(ASSETS_DIR, fileName);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Skip (not found): ${fileName}`);
    return;
  }
  const inputBuffer = fs.readFileSync(inputPath);
  const buffer = await sharp(inputBuffer)
    .png({ compressionLevel: 6, palette: false })
    .toBuffer();
  fs.writeFileSync(inputPath, buffer);
  console.log(`Fixed: ${fileName}`);
}

async function main() {
  for (const file of FILES) {
    try {
      await fixPng(file);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
      process.exit(1);
    }
  }
  console.log('Done.');
}

main();
