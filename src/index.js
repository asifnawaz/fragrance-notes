const path = require('path');
const notes = require('../assets/notes.json');
const packageJson = require('../package.json');

const repositoryUrl = packageJson.repository && packageJson.repository.url ? packageJson.repository.url : '';
const repositoryMatch = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
const REPOSITORY_OWNER = repositoryMatch ? repositoryMatch[1] : 'asifnawaz';
const REPOSITORY_NAME = repositoryMatch ? repositoryMatch[2] : 'fragrance-notes';
const CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/${REPOSITORY_OWNER}/${REPOSITORY_NAME}@v${packageJson.version}`;

const FAMILY_META = {
  amber: { colorHex: '#c98a2e', accords: ['Amber'] },
  aquatic: { colorHex: '#4f9fda', accords: ['Aquatic'] },
  citrus: { colorHex: '#f2b632', accords: ['Citrus'] },
  floral: { colorHex: '#d96bb3', accords: ['Floral'] },
  fruity: { colorHex: '#d96b6b', accords: ['Fruity'] },
  gourmand: { colorHex: '#9a6b3f', accords: ['Gourmand'] },
  green: { colorHex: '#5c9f5c', accords: ['Green'] },
  musky: { colorHex: '#b88c7d', accords: ['Musky'] },
  other: { colorHex: '#9c7c5a', accords: ['Other'] },
  smoky: { colorHex: '#6b6b6b', accords: ['Smoky'] },
  spicy: { colorHex: '#c75b39', accords: ['Spicy'] },
  woody: { colorHex: '#8b6b4a', accords: ['Woody'] }
};

function toPublicImagePath(imagePath) {
  return `assets/images/${imagePath.replace(/^\.\/images\//, '').replace(/^images\//, '')}`;
}

function getImageUrl(imagePath) {
  return `${CDN_BASE_URL}/${toPublicImagePath(imagePath)}`;
}

function withImageMetadata(note) {
  const fragranceFamilies = Array.isArray(note.families) ? note.families : [note.family];
  const primaryFamilyMeta = FAMILY_META[note.family] || FAMILY_META.other;
  const accords = Array.from(new Set(fragranceFamilies.flatMap(family => {
    const familyMeta = FAMILY_META[family] || FAMILY_META.other;
    return familyMeta.accords;
  })));
  const aliases = Array.from(new Set([note.name, ...(Array.isArray(note.aliases) ? note.aliases : [])]));
  const tags = Array.from(new Set([note.slug, ...fragranceFamilies, note.type, 'fragrance-note'].filter(Boolean)));

  return {
    ...note,
    image: `./images/${note.image}`,
    fragranceFamily: note.family,
    fragranceFamilies,
    noteType: note.type,
    description: note.description || `${note.name} is a ${note.family} fragrance note with characteristics that fit ${accords.join(', ')}.`,
    accords,
    aliases,
    tags,
    colorHex: primaryFamilyMeta.colorHex,
    imagePath: path.join(__dirname, '..', 'assets', 'images', imagePathToRelativeFsPath(note.image)),
    imageUrl: getImageUrl(note.image)
  };
}

function normalizeValue(value) {
  return String(value).trim().toLowerCase();
}

function imagePathToRelativeFsPath(imagePath) {
  return imagePath.replace(/^\.\/images\//, '').replace(/^images\//, '');
}

/**
 * Returns the full list of fragrance notes with metadata.
 * @returns {Array} Array of note objects.
 */
function getAllNotes() {
  return notes.map(withImageMetadata);
}

/**
 * Finds a specific note by name.
 * @param {string} name - The name of the note to find.
 * @returns {Object|null} The note object or null if not found.
 */
function getNoteByName(name) {
  const normalizedName = normalizeValue(name);
  const note = notes.find(n => normalizeValue(n.name) === normalizedName);
  if (!note) return null;

  return withImageMetadata(note);
}

function getNoteBySlug(slug) {
  const normalizedSlug = normalizeValue(slug);
  const note = notes.find(n => normalizeValue(n.slug) === normalizedSlug);
  if (!note) return null;

  return withImageMetadata(note);
}

function getNotesByFamily(family) {
  const normalizedFamily = normalizeValue(family);

  return notes
    .filter((note) => {
      const fragranceFamilies = Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family];
      return fragranceFamilies.some(item => normalizeValue(item) === normalizedFamily);
    })
    .map(withImageMetadata);
}

function getAllFamilies() {
  return Array.from(
    new Set(
      notes.flatMap((note) => Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family])
    )
  ).sort((a, b) => a.localeCompare(b));
}

module.exports = {
  CDN_BASE_URL,
  getAllFamilies,
  getAllNotes,
  getImageUrl,
  getNotesByFamily,
  getNoteByName,
  getNoteBySlug,
  toPublicImagePath,
  notes
};
