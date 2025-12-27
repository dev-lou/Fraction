const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PROPERTIES_FILE = path.join(__dirname, '..', 'lib', 'properties.ts');
const OUT_DIR = path.join(__dirname, '..', 'public', 'optimized');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const content = fs.readFileSync(PROPERTIES_FILE, 'utf8');
const urlRegex = /(https?:\/\/[^\s'",]+(?:jpg|jpeg|png|webp|gif))/gi;
const urls = new Set();
let m;
while ((m = urlRegex.exec(content)) !== null) {
  urls.add(m[1]);
}

console.log(`Found ${urls.size} image URLs to optimize.`);

async function downloadAndCompress(url) {
  try {
    const name = path.basename(new URL(url).pathname).split('?')[0];
    const safeName = name.replace(/[^a-z0-9.\-]/gi, '_');
    const outPath = path.join(OUT_DIR, safeName);

    if (fs.existsSync(outPath + '.webp')) {
      console.log(`Skipping existing: ${safeName}`);
      return;
    }

    console.log(`Downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      return;
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    // compress to webp and avif
    await sharp(buffer).rotate().jpeg({ quality: 80 }).toFile(outPath + '.jpg');
    await sharp(buffer).webp({ quality: 80 }).toFile(outPath + '.webp');
    await sharp(buffer).avif({ quality: 60 }).toFile(outPath + '.avif');
    console.log(`Saved ${safeName} -> ${outPath}.{jpg,webp,avif}`);
  } catch (e) {
    console.warn('Error optimizing', url, e.message);
  }
}

(async () => {
  for (const url of urls) {
    await downloadAndCompress(url);
  }
  console.log('Done.');
})();