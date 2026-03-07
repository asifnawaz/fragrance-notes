const path = require('path');
const notes = require('../assets/notes.json');
const packageJson = require('../package.json');

const repositoryUrl = packageJson.repository && packageJson.repository.url ? packageJson.repository.url : '';
const repositoryMatch = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
const REPOSITORY_OWNER = repositoryMatch ? repositoryMatch[1] : 'asifnawaz';
const REPOSITORY_NAME = repositoryMatch ? repositoryMatch[2] : 'fragrance-notes';
const CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/${REPOSITORY_OWNER}/${REPOSITORY_NAME}@v${packageJson.version}`;

function toPublicImagePath(imagePath) {
  return imagePath.replace(/^\.\//, 'assets/');
}

function getImageUrl(imagePath) {
  return `${CDN_BASE_URL}/${toPublicImagePath(imagePath)}`;
}

function withImageMetadata(note) {
  return {
    ...note,
    imagePath: path.join(__dirname, '..', 'assets', imagePathToRelativeFsPath(note.image)),
    imageUrl: getImageUrl(note.image)
  };
}

function imagePathToRelativeFsPath(imagePath) {
  return imagePath.replace(/^\.\//, '');
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
  const note = notes.find(n => n.name.toLowerCase() === name.toLowerCase());
  if (!note) return null;

  return withImageMetadata(note);
}

module.exports = {
  CDN_BASE_URL,
  getAllNotes,
  getImageUrl,
  getNoteByName,
  toPublicImagePath,
  notes
};
