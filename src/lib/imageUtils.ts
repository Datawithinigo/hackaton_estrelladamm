/**
 * Utility functions for handling base64 images
 */

/**
 * Validates if a string is a valid base64 data URL for images
 * @param dataUrl The data URL string to validate
 * @returns boolean indicating if it's a valid image data URL
 */
export const isValidImageDataUrl = (dataUrl: string): boolean => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return false;
  }
  
  // Check if it starts with data: and contains image type
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return dataUrlPattern.test(dataUrl);
};

/**
 * Gets the file extension from a base64 data URL
 * @param dataUrl The base64 data URL
 * @returns The file extension (e.g., 'jpeg', 'png')
 */
export const getImageTypeFromDataUrl = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:image\/([^;]+);base64,/);
  return match ? match[1] : 'jpeg';
};

/**
 * Checks if a photo URL is valid (either base64 data URL or HTTP URL)
 * @param photoUrl The profile photo URL to validate
 * @returns boolean indicating if it's a valid photo URL
 */
export const isValidPhotoUrl = (photoUrl: string | undefined | null): boolean => {
  if (!photoUrl || typeof photoUrl !== 'string') {
    return false;
  }
  
  return isValidImageDataUrl(photoUrl) || photoUrl.startsWith('http');
};

/**
 * Gets the initial letter from a name for placeholder avatars
 * @param name The user's name
 * @returns The first letter in uppercase
 */
export const getInitialFromName = (name?: string): string => {
  return (name || 'U').charAt(0).toUpperCase();
};