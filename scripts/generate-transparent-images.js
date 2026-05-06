const fs = require('fs');
const https = require('https');
const path = require('path');
const sharp = require('sharp');
const notes = require('../assets/notes.json');
const sourceNotes = require('../notes_full_src.json');
const { normalizeSearchText } = require('../src');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'assets', 'images-transparent');
const keyColor = { red: 0, green: 128, blue: 0 };

const shouldForce = process.argv.includes('--force');
const shouldDryRun = process.argv.includes('--dry-run');
const keyMode = process.argv.includes('--key=exact') ? 'exact' : 'soft';
const requestedFiles = process.argv
  .slice(2)
  .filter(arg => !arg.startsWith('--') && !arg.startsWith('--key='))
  .map(arg => arg.replace(/\.(jpg|jpeg|webp)$/i, '.jpg'));

const sourceByName = new Map(
  sourceNotes.map(note => [normalizeSearchText(note.name), note])
);

function getOutputFile(sourceFile) {
  return sourceFile.replace(/\.[^.]+$/, '.webp');
}

function getGreenMatteUrl(sourceImageUrl) {
  const url = new URL(sourceImageUrl);
  const encodedSourcePath = url.pathname.split('/').pop();

  return `${url.origin}/_/rt:fill/w:3840/bg:008000/f:png/${encodedSourcePath}`;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        resolve(download(new URL(response.headers.location, url).toString()));
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function getKeyDistance(red, green, blue) {
  return Math.hypot(
    red - keyColor.red,
    green - keyColor.green,
    blue - keyColor.blue
  );
}

function isExactKey(red, green, blue) {
  return red === keyColor.red && green === keyColor.green && blue === keyColor.blue;
}

function isGreenDominant(red, green, blue) {
  return green > red * 1.18 && green > blue * 1.18;
}

function despillGreen(red, green, blue) {
  return [red, Math.min(green, Math.max(red, blue)), blue];
}

async function chromaKeyGreen(inputBuffer, destinationPath) {
  const { data, info } = await sharp(inputBuffer)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const output = Buffer.from(data);
  const width = info.width;
  const height = info.height;
  const matte = new Uint8Array(width * height);

  for (let offset = 0; offset < output.length; offset += 4) {
    const red = output[offset];
    const green = output[offset + 1];
    const blue = output[offset + 2];
    const index = offset / 4;

    if (isExactKey(red, green, blue)) {
      matte[index] = 1;
      output[offset] = 0;
      output[offset + 1] = 0;
      output[offset + 2] = 0;
      output[offset + 3] = 0;
    }
  }

  if (keyMode === 'soft') {
    const alphaDistance = 90;
    const despillDistance = 145;

    for (let index = 0; index < matte.length; index += 1) {
      if (matte[index] === 1) continue;

      const offset = index * 4;
      const red = output[offset];
      const green = output[offset + 1];
      const blue = output[offset + 2];
      const distance = getKeyDistance(red, green, blue);

      if (distance > despillDistance || !isGreenDominant(red, green, blue)) continue;

      const [despilledRed, despilledGreen, despilledBlue] = despillGreen(red, green, blue);

      output[offset] = despilledRed;
      output[offset + 1] = despilledGreen;
      output[offset + 2] = despilledBlue;

      if (distance <= alphaDistance) {
        const alpha = clamp(((distance - 20) / (alphaDistance - 20)) * 255);
        output[offset + 3] = Math.min(output[offset + 3] || 255, alpha);
      }
    }
  }

  await sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .webp({ quality: 94, alphaQuality: 98, effort: 4 })
    .toFile(destinationPath);
}

async function main() {
  const selectedNotes = notes
    .filter(note => requestedFiles.length === 0 || requestedFiles.includes(note.image))
    .sort((a, b) => a.image.localeCompare(b.image));

  if (!shouldDryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;

  for (const note of selectedNotes) {
    const sourceNote = sourceByName.get(normalizeSearchText(note.name));
    if (!sourceNote) {
      throw new Error(`Missing source image URL for "${note.name}".`);
    }

    const destinationFile = getOutputFile(note.image);
    const destinationPath = path.join(outputDir, destinationFile);

    if (!shouldForce && fs.existsSync(destinationPath)) {
      skipped += 1;
      continue;
    }

    generated += 1;

    if (shouldDryRun) {
      continue;
    }

    const sourceUrl = getGreenMatteUrl(sourceNote.imageUrl);
    const sourceImage = await download(sourceUrl);
    await chromaKeyGreen(sourceImage, destinationPath);
  }

  const action = shouldDryRun ? 'Would generate' : 'Generated';
  console.log(`${action} ${generated} transparent image(s); skipped ${skipped}; key mode: ${keyMode}.`);
  console.log(`Output directory: ${path.relative(rootDir, outputDir)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
