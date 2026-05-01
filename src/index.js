const path = require('path');
const notes = require('../assets/notes.json');
const packageJson = require('../package.json');

const repositoryUrl = packageJson.repository && packageJson.repository.url ? packageJson.repository.url : '';
const repositoryMatch = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
const REPOSITORY_OWNER = repositoryMatch ? repositoryMatch[1] : 'asifnawaz';
const REPOSITORY_NAME = repositoryMatch ? repositoryMatch[2] : 'fragrance-notes';
const CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/${REPOSITORY_OWNER}/${REPOSITORY_NAME}@v${packageJson.version}`;

const FAMILY_META = {
  amber: { label: 'Amber', colorHex: '#c98a2e', accords: ['Amber'] },
  aquatic: { label: 'Aquatic', colorHex: '#4f9fda', accords: ['Aquatic'] },
  citrus: { label: 'Citrus', colorHex: '#f2b632', accords: ['Citrus'] },
  floral: { label: 'Floral', colorHex: '#d96bb3', accords: ['Floral'] },
  fruity: { label: 'Fruity', colorHex: '#d96b6b', accords: ['Fruity'] },
  gourmand: { label: 'Gourmand', colorHex: '#9a6b3f', accords: ['Gourmand'] },
  green: { label: 'Green', colorHex: '#5c9f5c', accords: ['Green'] },
  musky: { label: 'Musky', colorHex: '#b88c7d', accords: ['Musky'] },
  other: { label: 'Other', colorHex: '#9c7c5a', accords: ['Other'] },
  smoky: { label: 'Smoky', colorHex: '#6b6b6b', accords: ['Smoky'] },
  spicy: { label: 'Spicy', colorHex: '#c75b39', accords: ['Spicy'] },
  woody: { label: 'Woody', colorHex: '#8b6b4a', accords: ['Woody'] }
};

const NOTE_TYPE_META = {
  base: { label: 'Base' },
  middle: { label: 'Middle' },
  other: { label: 'Other' },
  top: { label: 'Top' }
};

const FAMILIES = Object.freeze(Object.keys(FAMILY_META).sort((a, b) => a.localeCompare(b)));
const NOTE_TYPES = Object.freeze(Object.keys(NOTE_TYPE_META).sort((a, b) => a.localeCompare(b)));

const SUBSCRIPT_DIGITS = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9'
};

function toPublicImagePath(imagePath) {
  return `assets/images/${imagePath.replace(/^\.\/images\//, '').replace(/^images\//, '')}`;
}

function getImageUrl(imagePath) {
  return `${CDN_BASE_URL}/${toPublicImagePath(imagePath)}`;
}

function withImageMetadata(note) {
  const fragranceFamilies = Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family];
  const primaryFamilyMeta = FAMILY_META[note.family] || FAMILY_META.other;
  const noteTypeMeta = NOTE_TYPE_META[note.type] || NOTE_TYPE_META.other;
  const accords = Array.from(new Set(fragranceFamilies.flatMap(family => {
    const familyMeta = FAMILY_META[family] || FAMILY_META.other;
    return familyMeta.accords;
  })));
  const aliases = Array.from(new Set([note.name, ...(Array.isArray(note.aliases) ? note.aliases : [])]));
  const tags = Array.from(new Set([note.slug, ...fragranceFamilies, note.type, 'fragrance-note'].filter(Boolean)));
  const familyLabels = fragranceFamilies.map(family => {
    const familyMeta = FAMILY_META[family] || FAMILY_META.other;
    return familyMeta.label;
  });

  return {
    ...note,
    image: `./images/${note.image}`,
    fragranceFamily: note.family,
    fragranceFamilies,
    fragranceFamilyLabel: primaryFamilyMeta.label,
    fragranceFamilyLabels: familyLabels,
    noteType: note.type,
    noteTypeLabel: noteTypeMeta.label,
    description: note.description || getDefaultDescription(note, primaryFamilyMeta, noteTypeMeta, accords),
    accords,
    aliases,
    tags,
    colorHex: primaryFamilyMeta.colorHex,
    altText: `${note.name} fragrance note`,
    imagePath: path.join(__dirname, '..', 'assets', 'images', imagePathToRelativeFsPath(note.image)),
    imageUrl: getImageUrl(note.image)
  };
}

function getDefaultDescription(note, familyMeta, noteTypeMeta, accords) {
  const familyLabel = familyMeta.label === 'Other' ? 'versatile' : familyMeta.label.toLowerCase();
  const typeLabel = noteTypeMeta.label === 'Other' ? 'supporting' : noteTypeMeta.label.toLowerCase();
  const accordText = accords.length > 1 ? accords.join(', ') : accords[0];

  return `${note.name} is a ${familyLabel} fragrance note with ${accordText.toLowerCase()} facets, commonly used as a ${typeLabel} note in scent profiles.`;
}

function normalizeSearchText(value) {
  return String(value == null ? '' : value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, digit => SUBSCRIPT_DIGITS[digit])
    .replace(/[’‘`´]/g, "'")
    .replace(/[_-]+/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeValue(value) {
  return normalizeSearchText(value);
}

function imagePathToRelativeFsPath(imagePath) {
  return imagePath.replace(/^\.\/images\//, '').replace(/^images\//, '');
}

function getRawAliases(note) {
  return Array.isArray(note.aliases) ? note.aliases : [];
}

function getSearchFields(note) {
  const fragranceFamilies = Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family];
  const accords = fragranceFamilies.flatMap(family => {
    const familyMeta = FAMILY_META[family] || FAMILY_META.other;
    return familyMeta.accords;
  });

  return [
    note.name,
    note.slug,
    ...getRawAliases(note),
    note.family,
    ...fragranceFamilies,
    note.type,
    ...accords
  ].filter(Boolean);
}

function scoreSearchMatch(note, normalizedQuery) {
  const fields = getSearchFields(note).map(value => normalizeSearchText(value));
  const [name, slug, ...remainingFields] = fields;
  const aliases = getRawAliases(note).map(value => normalizeSearchText(value));
  const terms = normalizedQuery.split(' ').filter(Boolean);
  const combined = fields.join(' ');

  if (!normalizedQuery) return 1;
  if (name === normalizedQuery) return 100;
  if (aliases.some(alias => alias === normalizedQuery)) return 95;
  if (slug === normalizedQuery) return 90;
  if (name.startsWith(normalizedQuery)) return 80;
  if (aliases.some(alias => alias.startsWith(normalizedQuery))) return 75;
  if (name.includes(normalizedQuery)) return 65;
  if (aliases.some(alias => alias.includes(normalizedQuery))) return 60;
  if (slug.includes(normalizedQuery)) return 55;
  if (remainingFields.some(field => field === normalizedQuery)) return 45;
  if (remainingFields.some(field => field.includes(normalizedQuery))) return 30;
  if (terms.length > 0 && terms.every(term => combined.includes(term))) return 20;

  return 0;
}

function matchesFamily(note, family) {
  if (!family) return true;

  const normalizedFamily = normalizeValue(family);
  const fragranceFamilies = Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family];
  return fragranceFamilies.some(item => normalizeValue(item) === normalizedFamily);
}

function matchesType(note, type) {
  if (!type) return true;

  return normalizeValue(note.type) === normalizeValue(type);
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
  const note = notes.find(n => normalizeValue(n.name) === normalizedName) ||
    notes.find(n => getRawAliases(n).some(alias => normalizeValue(alias) === normalizedName));
  if (!note) return null;

  return withImageMetadata(note);
}

function getNoteByAlias(alias) {
  const normalizedAlias = normalizeValue(alias);
  const note = notes.find(n => getRawAliases(n).some(item => normalizeValue(item) === normalizedAlias));
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
  if (!normalizeValue(family)) return [];

  return notes
    .filter(note => matchesFamily(note, family))
    .map(withImageMetadata);
}

function getNotesByType(type) {
  if (!normalizeValue(type)) return [];

  return notes
    .filter(note => matchesType(note, type))
    .map(withImageMetadata);
}

function getAllFamilies() {
  return Array.from(
    new Set(
      notes.flatMap((note) => Array.isArray(note.families) && note.families.length > 0 ? note.families : [note.family])
    )
  ).sort((a, b) => a.localeCompare(b));
}

function searchNotes(query, options = {}) {
  options = options || {};
  const normalizedQuery = normalizeSearchText(query);
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : null;
  const results = notes
    .filter(note => matchesFamily(note, options.family))
    .filter(note => matchesType(note, options.type))
    .map(note => ({
      note,
      score: scoreSearchMatch(note, normalizedQuery)
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.note.name.localeCompare(b.note.name))
    .map(result => withImageMetadata(result.note));

  return limit ? results.slice(0, limit) : results;
}

module.exports = {
  CDN_BASE_URL,
  FAMILIES,
  FAMILY_META,
  NOTE_TYPES,
  NOTE_TYPE_META,
  getAllFamilies,
  getAllNotes,
  getImageUrl,
  getNoteByAlias,
  getNotesByFamily,
  getNotesByType,
  getNoteByName,
  getNoteBySlug,
  normalizeSearchText,
  searchNotes,
  toPublicImagePath,
  notes
};
