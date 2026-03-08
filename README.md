# 🌸 Fragrance Notes Library

[![npm version](https://img.shields.io/npm/v/fragrance-notes.svg)](https://www.npmjs.com/package/fragrance-notes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Semantic Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A comprehensive, developer-friendly library containing **540+ fragrance notes** with high-quality images and metadata. Perfect for perfume enthusiasts, developers building fragrance apps, or anyone interested in the olfactory world.

---

## ✨ Features

- **540+ Fragrance Notes**: A vast collection of scents from Absinthe to Ylang-Ylang.
- **High-Quality Images**: Each note comes with a descriptive, high-resolution image.
- **Rich Metadata Included**: Includes slugs, fragrance families, note types, aliases, tags, accords, and image URLs.
- **Compact Source Data**: The package keeps a lean canonical note dataset and hydrates integration-ready metadata at runtime.
- **Easy Integration**: Simple API to retrieve notes by name or as a complete list.
- **Lightweight**: Optimized for performance with minimal dependencies.

---

## 🚀 Installation

Install the package via NPM:

```bash
npm install fragrance-notes
```

Or using Yarn:

```bash
yarn add fragrance-notes
```

---

## 📖 Usage

### Get All Notes

Retrieve the entire library of fragrance notes with their metadata and public image URLs.

```javascript
const { getAllNotes } = require('fragrance-notes');

const allNotes = getAllNotes();
console.log(allNotes[0]);
/*
{
  name: 'Absinth',
  slug: 'absinth',
  family: 'other',
  fragranceFamily: 'other',
  fragranceFamilies: ['other'],
  noteType: 'other',
  accords: ['Other'],
  tags: ['absinth', 'other', 'fragrance-note'],
  description: 'Absinth is a other fragrance note with characteristics that fit Other.',
  image: './images/absinth.jpg',
  imagePath: '/path/to/project/node_modules/fragrance-notes/assets/images/absinth.jpg',
  imageUrl: 'https://cdn.jsdelivr.net/gh/asifnawaz/fragrance-notes@v1.0.0/assets/images/absinth.jpg'
}
*/
```

The source `assets/notes.json` stores only compact canonical note fields such as `slug`, `name`, `image`, `family`, `families`, and `type`. The library derives integration-friendly fields like `fragranceFamily`, `accords`, `tags`, `description`, `imagePath`, and `imageUrl` at runtime.

### Find a Specific Note

Search for a note by its name (case-insensitive).

```javascript
const { getNoteByName } = require('fragrance-notes');

const tonkaBean = getNoteByName('Tonka Bean');
if (tonkaBean) {
  console.log(`Found: ${tonkaBean.name}`);
  console.log(`Family: ${tonkaBean.fragranceFamily}`);
  console.log(`Image URL: ${tonkaBean.imageUrl}`);
}
```

### Filter Notes by Family

```javascript
const { getAllFamilies, getNotesByFamily } = require('fragrance-notes');

const families = getAllFamilies();
const floralNotes = getNotesByFamily('floral');

console.log(families);
console.log(floralNotes[0]);
```

### Find a Note by Slug

```javascript
const { getNoteBySlug } = require('fragrance-notes');

const note = getNoteBySlug('african-neroli');
console.log(note?.aliases);
```

### Next.js Example

Use the returned `imageUrl` with `next/image` instead of loading files from `node_modules` directly.

```javascript
import Image from 'next/image';
import { getNoteByName } from 'fragrance-notes';

const note = getNoteByName('Tonka Bean');

export default function NoteCard() {
  return (
    <Image
      src={note.imageUrl}
      alt={note.name}
      width={400}
      height={400}
    />
  );
}
```

Add `cdn.jsdelivr.net` to your Next.js image remote patterns configuration.

---

## 📂 Project Structure

```text
fragrance-notes/
├── assets/
│   ├── images/       # 540+ JPG images of fragrance notes
│   └── notes.json    # Metadata for all notes
├── src/
│   └── index.js      # Main library entry point
├── .github/
│   └── workflows/    # Automated release workflows
└── README.md         # Documentation
```

---

## 🛠️ Development & Contributing

This project uses **Semantic Release** for automated versioning and package publishing.

### Commit Message Format

To trigger a release, please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `fix: ...` triggers a **patch** release (e.g., 1.0.1)
- `feat: ...` triggers a **minor** release (e.g., 1.1.0)
- `perf: ...` triggers a **patch** release
- `BREAKING CHANGE: ...` triggers a **major** release (e.g., 2.0.0)

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

If you find this library useful, please consider giving it a ⭐ on [GitHub](https://github.com/asifnawaz/fragrance-notes)!