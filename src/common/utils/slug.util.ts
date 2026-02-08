/**
 * Utility functions for generating slugs
 */

export class SlugUtil {
  /**
   * Generate a URL-friendly slug from a string
   * @param title - The string to convert to slug
   * @returns A URL-friendly slug
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      // Normalize Vietnamese characters and other special characters
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd') // Replace đ with d
      // Remove all non-alphanumeric characters except spaces and hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace multiple spaces with single hyphen
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .trim();
  }
}
