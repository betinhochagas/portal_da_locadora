import { extname } from 'path';

/**
 * Generate a random filename for uploaded files
 * @param originalname - The original filename from the upload
 * @returns A random filename with the original extension
 */
export function generateRandomFilename(originalname: string): string {
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${randomName}${extname(originalname)}`;
}
