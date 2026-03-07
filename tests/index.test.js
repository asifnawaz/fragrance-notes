const path = require('path');
const {
  CDN_BASE_URL,
  getAllNotes,
  getImageUrl,
  getNoteByName,
  notes,
  toPublicImagePath
} = require('../src/index');

describe('Fragrance Notes Library', () => {
  test('should have a complete list of notes', () => {
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBeGreaterThan(500);
  });

  test('getAllNotes should return notes with image paths and public image URLs', () => {
    const allNotes = getAllNotes();
    expect(allNotes[0]).toHaveProperty('imagePath');
    expect(allNotes[0]).toHaveProperty('imageUrl');
    expect(typeof allNotes[0].imagePath).toBe('string');
    expect(typeof allNotes[0].imageUrl).toBe('string');
    expect(allNotes[0].imageUrl.startsWith('https://cdn.jsdelivr.net/gh/')).toBe(true);
  });

  test('should derive a jsDelivr CDN base URL from package repository metadata', () => {
    expect(CDN_BASE_URL).toContain('https://cdn.jsdelivr.net/gh/asifnawaz/fragrance-notes@v');
  });

  test('toPublicImagePath should normalize asset paths for CDN delivery', () => {
    expect(toPublicImagePath('./images/absinth.jpg')).toBe('assets/images/absinth.jpg');
  });

  test('getImageUrl should build a full public URL for an image path', () => {
    expect(getImageUrl('./images/absinth.jpg')).toBe(`${CDN_BASE_URL}/assets/images/absinth.jpg`);
  });

  test('getNoteByName should find a note by name (case-insensitive)', () => {
    const note = getNoteByName('Absinth');
    expect(note).not.toBeNull();
    expect(note.name).toBe('Absinth');
    expect(note.imageUrl).toBe(`${CDN_BASE_URL}/assets/images/absinth.jpg`);
    expect(note.imagePath).toBe(path.join(__dirname, '..', 'assets', 'images', 'absinth.jpg'));

    const lowercaseNote = getNoteByName('absinth');
    expect(lowercaseNote).not.toBeNull();
    expect(lowercaseNote.name).toBe('Absinth');
  });

  test('getNoteByName should return null for non-existent notes', () => {
    const note = getNoteByName('NonExistentNote123');
    expect(note).toBeNull();
  });

  test('all notes should expose jsDelivr-backed public image URLs', () => {
    const allNotes = getAllNotes();
    allNotes.forEach(note => {
      expect(note.imageUrl).toContain('/assets/images/');
      expect(note.imageUrl.endsWith('.jpg')).toBe(true);
    });
  });
});
