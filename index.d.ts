export type FragranceFamily =
  | 'amber'
  | 'aquatic'
  | 'citrus'
  | 'floral'
  | 'fruity'
  | 'gourmand'
  | 'green'
  | 'musky'
  | 'other'
  | 'smoky'
  | 'spicy'
  | 'woody';

export type NoteType = 'base' | 'middle' | 'other' | 'top';

export interface SourceNote {
  slug: string;
  name: string;
  image: string;
  family: FragranceFamily;
  families?: FragranceFamily[];
  type: NoteType;
  aliases?: string[];
  description?: string;
}

export interface FragranceNote extends SourceNote {
  image: string;
  fragranceFamily: FragranceFamily;
  fragranceFamilies: FragranceFamily[];
  fragranceFamilyLabel: string;
  fragranceFamilyLabels: string[];
  noteType: NoteType;
  noteTypeLabel: string;
  description: string;
  accords: string[];
  aliases: string[];
  tags: string[];
  colorHex: string;
  altText: string;
  imagePath: string;
  imageUrl: string;
  imagePackagePath: string;
  originalImage: string;
  originalImagePath: string;
  originalImageUrl: string;
  originalImagePackagePath: string;
  transparentImage: string;
  transparentImagePath: string;
  transparentImageUrl: string;
  imageVariants: {
    original: ImageVariant;
    transparent: ImageVariant;
  };
}

export interface ImageVariant {
  format: 'jpg' | 'webp';
  image: string;
  imagePath: string;
  imageUrl: string;
}

export interface FamilyMeta {
  label: string;
  colorHex: string;
  accords: string[];
}

export interface NoteTypeMeta {
  label: string;
}

export interface SearchOptions {
  family?: FragranceFamily | string;
  type?: NoteType | string;
  limit?: number;
}

export const CDN_BASE_URL: string;
export const FAMILIES: readonly FragranceFamily[];
export const FAMILY_META: Record<FragranceFamily, FamilyMeta>;
export const NOTE_TYPES: readonly NoteType[];
export const NOTE_TYPE_META: Record<NoteType, NoteTypeMeta>;
export const notes: SourceNote[];

export function getAllFamilies(): FragranceFamily[];
export function getAllNotes(): FragranceNote[];
export function getImageUrl(imagePath: string): string;
export function getTransparentImageUrl(imagePath: string): string;
export function getNoteByAlias(alias: string): FragranceNote | null;
export function getNoteByName(name: string): FragranceNote | null;
export function getNoteBySlug(slug: string): FragranceNote | null;
export function getNotesByFamily(family: FragranceFamily | string): FragranceNote[];
export function getNotesByType(type: NoteType | string): FragranceNote[];
export function normalizeSearchText(value: unknown): string;
export function searchNotes(query: string, options?: SearchOptions): FragranceNote[];
export function toPublicImagePath(imagePath: string): string;
export function toTransparentImagePath(imagePath: string): string;
