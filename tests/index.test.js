const { getAllNotes, getNoteByName, notes } = require('../src/index');
const fs = require('fs');
const path = require('path');

describe('Fragrance Notes Library', () => {
  test('should have a complete list of notes', () => {
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBeGreaterThan(500);
  });

  test('getAllNotes should return notes with image paths', () => {
    const allNotes = getAllNotes();
    expect(allNotes[0]).toHaveProperty('imagePath');
    expect(typeof allNotes[0].imagePath).toBe('string');
  });

  test('getNoteByName should find a note by name (case-insensitive)', () => {
    const note = getNoteByName('Absinth');
    expect(note).not.toBeNull();
    expect(note.name).toBe('Absinth');

    const lowercaseNote = getNoteByName('absinth');
    expect(lowercaseNote).not.toBeNull();
    expect(lowercaseNote.name).toBe('Absinth');
  });

  test('getNoteByName should return null for non-existent notes', () => {
    const note = getNoteByName('NonExistentNote123');
    expect(note).toBeNull();
  });

  test('all notes should have a corresponding image file', () => {
    const allNotes = getAllNotes();
    allNotes.forEach(note => {
      const exists = fs.existsSync(note.imagePath);
      if (!exists) {
        console.warn(`Missing image for note: ${note.name} at ${note.imagePath}`);
      }
      // We expect the image to exist
      expect(exists).toBe(true);
    });
  });
});
