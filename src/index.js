const path = require('path');
const notes = require('../assets/notes.json');

/**
 * Returns the full list of fragrance notes with metadata.
 * @returns {Array} Array of note objects.
 */
function getAllNotes() {
  return notes.map(note => ({
    ...note,
    imagePath: path.join(__dirname, '..', 'assets', 'images', `${note.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '_').replace(/[']/g, '_').replace(/'/g, '_').replace(/\u2019/g, '_').replace(/\s*\(([^)]+)\)\s*/g, '_$1_').replace(/[^a-z0-9\-_àáâäãåāăçéèêëēėęíìîïīįóòôöõøōőœúùûüūůýÿñß\u2082]/g, '')}.jpg`)
  }));
}

/**
 * Finds a specific note by name.
 * @param {string} name - The name of the note to find.
 * @returns {Object|null} The note object or null if not found.
 */
function getNoteByName(name) {
  const note = notes.find(n => n.name.toLowerCase() === name.toLowerCase());
  if (!note) return null;
  
  return {
    ...note,
    imagePath: path.join(__dirname, '..', 'assets', 'images', `${note.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '_').replace(/[']/g, '_').replace(/'/g, '_').replace(/\u2019/g, '_').replace(/\s*\(([^)]+)\)\s*/g, '_$1_').replace(/[^a-z0-9\-_àáâäãåāăçéèêëēėęíìîïīįóòôöõøōőœúùûüūůýÿñß\u2082]/g, '')}.jpg`)
  };
}

module.exports = {
  getAllNotes,
  getNoteByName,
  notes
};
