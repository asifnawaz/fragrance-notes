const path = require('path');
const {
  CDN_BASE_URL,
  FAMILIES,
  NOTE_TYPES,
  getAllFamilies,
  getAllNotes,
  getImageUrl,
  getNoteByAlias,
  getNotesByFamily,
  getNotesByType,
  getNoteByName,
  getNoteBySlug,
  normalizeSearchText,
  notes,
  searchNotes,
  toPublicImagePath
} = require('../src/index');

describe('Fragrance Notes Library', () => {
  test('should have a complete list of notes', () => {
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBeGreaterThan(500);
    expect(notes[0]).toHaveProperty('family');
    expect(notes[0]).toHaveProperty('type');
    expect(notes[0]).not.toHaveProperty('fragranceFamily');
  });

  test('getAllNotes should return notes with image paths and public image URLs', () => {
    const allNotes = getAllNotes();
    expect(allNotes[0]).toHaveProperty('imagePath');
    expect(allNotes[0]).toHaveProperty('imageUrl');
    expect(allNotes[0]).toHaveProperty('slug');
    expect(allNotes[0]).toHaveProperty('fragranceFamily');
    expect(allNotes[0]).toHaveProperty('fragranceFamilies');
    expect(allNotes[0]).toHaveProperty('noteType');
    expect(allNotes[0]).toHaveProperty('accords');
    expect(allNotes[0]).toHaveProperty('tags');
    expect(allNotes[0]).toHaveProperty('colorHex');
    expect(allNotes[0]).toHaveProperty('altText');
    expect(allNotes[0]).toHaveProperty('fragranceFamilyLabel');
    expect(allNotes[0]).toHaveProperty('fragranceFamilyLabels');
    expect(allNotes[0]).toHaveProperty('noteTypeLabel');
    expect(typeof allNotes[0].imagePath).toBe('string');
    expect(typeof allNotes[0].imageUrl).toBe('string');
    expect(typeof allNotes[0].altText).toBe('string');
    expect(allNotes[0].imageUrl.startsWith('https://cdn.jsdelivr.net/gh/')).toBe(true);
    expect(Array.isArray(allNotes[0].fragranceFamilies)).toBe(true);
    expect(Array.isArray(allNotes[0].fragranceFamilyLabels)).toBe(true);
  });

  test('should derive a jsDelivr CDN base URL from package repository metadata', () => {
    expect(CDN_BASE_URL).toContain('https://cdn.jsdelivr.net/gh/asifnawaz/fragrance-notes@v');
  });

  test('toPublicImagePath should normalize asset paths for CDN delivery', () => {
    expect(toPublicImagePath('./images/absinth.jpg')).toBe('assets/images/absinth.jpg');
  });

  test('getImageUrl should build a full public URL for an image path', () => {
    expect(getImageUrl('absinth.jpg')).toBe(`${CDN_BASE_URL}/assets/images/absinth.jpg`);
  });

  test('getNoteByName should find a note by name (case-insensitive)', () => {
    const note = getNoteByName('Absinth');
    expect(note).not.toBeNull();
    expect(note.name).toBe('Absinth');
    expect(note.slug).toBe('absinth');
    expect(note.fragranceFamily).toBe('other');
    expect(note.noteType).toBe('other');
    expect(note.accords).toEqual(['Other']);
    expect(note.imageUrl).toBe(`${CDN_BASE_URL}/assets/images/absinth.jpg`);
    expect(note.imagePath).toBe(path.join(__dirname, '..', 'assets', 'images', 'absinth.jpg'));

    const lowercaseNote = getNoteByName('absinth');
    expect(lowercaseNote).not.toBeNull();
    expect(lowercaseNote.name).toBe('Absinth');
  });

  test('getNoteByName should handle accents and aliases', () => {
    const note = getNoteByName('creme de cassis');
    expect(note).not.toBeNull();
    expect(note.name).toBe('Crème de Cassis');

    const co2Note = getNoteByName('vanilla co2 lmr');
    expect(co2Note).not.toBeNull();
    expect(co2Note.name).toBe('Vanilla CO₂ LMR');
  });

  test('getNoteByAlias should find notes by configured aliases', () => {
    const note = getNoteByAlias('accord dragee');
    expect(note).not.toBeNull();
    expect(note.name).toBe('Accord Dragée');
  });

  test('getNoteByName should return null for non-existent notes', () => {
    const note = getNoteByName('NonExistentNote123');
    expect(note).toBeNull();
  });

  test('getNoteBySlug should find a note by slug', () => {
    const note = getNoteBySlug('african-neroli');
    expect(note).not.toBeNull();
    expect(note.name).toBe('African Neroli');
    expect(note.fragranceFamilies).toEqual(expect.arrayContaining(['citrus', 'floral']));
    expect(note.tags).toEqual(expect.arrayContaining(['african-neroli', 'citrus', 'floral', 'top']));
  });

  test('getNotesByFamily should return notes that belong to a fragrance family', () => {
    const floralNotes = getNotesByFamily('floral');
    expect(floralNotes.length).toBeGreaterThan(0);
    floralNotes.forEach(note => {
      expect(note.fragranceFamilies).toContain('floral');
    });
  });

  test('getNotesByType should return notes that match a note type', () => {
    const topNotes = getNotesByType('top');
    expect(topNotes.length).toBeGreaterThan(0);
    topNotes.forEach(note => {
      expect(note.noteType).toBe('top');
    });
  });

  test('getAllFamilies should return a sorted unique list of fragrance families', () => {
    const families = getAllFamilies();
    expect(families.length).toBeGreaterThan(0);
    expect(families).toContain('floral');
    expect(families).toContain('other');
    expect([...families].sort((a, b) => a.localeCompare(b))).toEqual(families);
  });

  test('FAMILIES and NOTE_TYPES should expose supported filter values', () => {
    expect(FAMILIES).toEqual(getAllFamilies());
    expect(NOTE_TYPES).toEqual(['base', 'middle', 'other', 'top']);
  });

  test('normalizeSearchText should normalize accents, separators, and subscript digits', () => {
    expect(normalizeSearchText('Crème-de-Cassis')).toBe('creme de cassis');
    expect(normalizeSearchText('Vanilla CO₂ LMR')).toBe('vanilla co2 lmr');
  });

  test('searchNotes should rank exact and fuzzy matches', () => {
    const results = searchNotes('tonka bean', { limit: 3 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Tonka Bean');

    const accentResults = searchNotes('creme cassis');
    expect(accentResults[0].name).toBe('Crème de Cassis');
  });

  test('searchNotes should support family and type filters', () => {
    const results = searchNotes('rose', { family: 'floral', type: 'middle', limit: 10 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach(note => {
      expect(note.fragranceFamilies).toContain('floral');
      expect(note.noteType).toBe('middle');
    });
  });

  test('all notes should expose jsDelivr-backed public image URLs', () => {
    const allNotes = getAllNotes();
    allNotes.forEach(note => {
      expect(note.imageUrl).toContain('/assets/images/');
      expect(note.imageUrl.endsWith('.jpg')).toBe(true);
    });
  });
});
