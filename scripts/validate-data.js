const fs = require('fs');
const path = require('path');
const {
  FAMILIES,
  NOTE_TYPES,
  getAllNotes,
  normalizeSearchText,
  notes
} = require('../src');

const rootDir = path.join(__dirname, '..');
const imagesDir = path.join(rootDir, 'assets', 'images');
const errors = [];

function addError(message) {
  errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addLookupKey(index, key, slug, label) {
  const normalizedKey = normalizeSearchText(key);
  if (!normalizedKey) return;

  const existing = index.get(normalizedKey);
  if (existing && existing.slug !== slug) {
    addError(`Lookup key "${label}" for "${slug}" conflicts with "${existing.slug}".`);
    return;
  }

  index.set(normalizedKey, { slug, label });
}

if (!Array.isArray(notes)) {
  addError('assets/notes.json must export an array.');
}

const imageFiles = new Set(fs.readdirSync(imagesDir));
const referencedImages = new Set();
const slugs = new Set();
const names = new Set();
const lookupIndex = new Map();

notes.forEach((note, index) => {
  const label = note && note.slug ? note.slug : `note at index ${index}`;

  if (!note || typeof note !== 'object' || Array.isArray(note)) {
    addError(`${label} must be an object.`);
    return;
  }

  ['slug', 'name', 'image', 'family', 'type'].forEach(field => {
    if (!isNonEmptyString(note[field])) {
      addError(`${label} is missing required string field "${field}".`);
    }
  });

  if (isNonEmptyString(note.slug) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.slug)) {
    addError(`${label} has an invalid slug format.`);
  }

  if (slugs.has(note.slug)) {
    addError(`Duplicate slug "${note.slug}".`);
  }
  slugs.add(note.slug);

  const normalizedName = normalizeSearchText(note.name);
  if (names.has(normalizedName)) {
    addError(`Duplicate note name "${note.name}".`);
  }
  names.add(normalizedName);

  if (!FAMILIES.includes(note.family)) {
    addError(`${label} uses unsupported family "${note.family}".`);
  }

  if (!NOTE_TYPES.includes(note.type)) {
    addError(`${label} uses unsupported type "${note.type}".`);
  }

  if (note.families !== undefined) {
    if (!Array.isArray(note.families) || note.families.length === 0) {
      addError(`${label} has a families field that must be a non-empty array.`);
    } else {
      if (!note.families.includes(note.family)) {
        addError(`${label} families must include its primary family "${note.family}".`);
      }

      note.families.forEach(family => {
        if (!FAMILIES.includes(family)) {
          addError(`${label} uses unsupported secondary family "${family}".`);
        }
      });
    }
  }

  if (note.aliases !== undefined) {
    if (!Array.isArray(note.aliases)) {
      addError(`${label} aliases must be an array when provided.`);
    } else {
      note.aliases.forEach(alias => {
        if (!isNonEmptyString(alias)) {
          addError(`${label} has an empty alias.`);
        }
      });
    }
  }

  if (isNonEmptyString(note.image)) {
    if (note.image.includes('/') || note.image.includes('\\')) {
      addError(`${label} image must be a filename, not a path.`);
    }

    if (!note.image.endsWith('.jpg')) {
      addError(`${label} image must use a .jpg file.`);
    }

    referencedImages.add(note.image);
    if (!imageFiles.has(note.image)) {
      addError(`${label} references missing image "${note.image}".`);
    }
  }

  addLookupKey(lookupIndex, note.name, note.slug, note.name);
  addLookupKey(lookupIndex, note.slug, note.slug, note.slug);
  (Array.isArray(note.aliases) ? note.aliases : []).forEach(alias => {
    addLookupKey(lookupIndex, alias, note.slug, alias);
  });
});

imageFiles.forEach(file => {
  if (!referencedImages.has(file)) {
    addError(`Image "${file}" is not referenced by any note.`);
  }
});

getAllNotes().forEach(note => {
  if (!note.imageUrl || !note.imageUrl.includes('/assets/images/')) {
    addError(`${note.slug} is missing a public imageUrl.`);
  }

  if (!note.altText) {
    addError(`${note.slug} is missing altText.`);
  }
});

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${notes.length} notes and ${imageFiles.size} images.`);
