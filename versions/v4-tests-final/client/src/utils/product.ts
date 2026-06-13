import { LocaleCode, Product, ProductFormData } from '../types';

export interface LocalizedProductText {
  title: string;
  description: string;
  categories: string[];
}

/**
 * Returns localized product text while keeping Russian fields as a fallback.
 *
 * @param product Product received from the API.
 * @param locale Active UI locale.
 * @returns Localized title, description and categories.
 */
export function getLocalizedProductText(product: Product, locale: LocaleCode): LocalizedProductText {
  const translation = product.translations?.[locale];

  return {
    title: translation?.title || product.title,
    description: translation?.description || product.description,
    categories: translation?.categories || product.categories || [],
  };
}

/**
 * Shortens long product descriptions for card layouts.
 *
 * @param description Source text.
 * @param maxLength Maximum visible length.
 * @returns Trimmed text with ellipsis when needed.
 */
export function truncateText(description?: string, maxLength = 120): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trim()}...`;
}

/**
 * Reads a product average rating from API data or calculates it from reviews.
 *
 * @param product Product with optional reviews.
 * @returns Average rating rounded to one decimal place.
 */
export function getAverageRating(product: Product): number {
  if (typeof product.averageRating === 'number') {
    return product.averageRating;
  }

  const reviews = product.reviews || [];

  if (reviews.length === 0) {
    return 0;
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return Math.round(average * 10) / 10;
}

/**
 * Converts a comma-separated form field into a normalized string array.
 *
 * @param value Comma-separated text.
 * @returns Non-empty normalized values.
 */
export function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Builds a product payload for the admin API from form state.
 *
 * @param form Product form state.
 * @returns Product payload ready for POST or PUT.
 */
export function normalizeProductForm(form: ProductFormData): ProductFormData {
  return {
    ...form,
    price: Number(form.price) || 0,
    categories: form.categories.filter(Boolean),
    tags: form.tags.map((tag) => tag.toLowerCase()).filter(Boolean),
    images: {
      preview: form.images.preview,
    },
  };
}
