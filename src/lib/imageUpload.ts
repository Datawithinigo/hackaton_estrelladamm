/**
 * Converts a file to base64 data URL
 * @param file The image file to convert
 * @returns Promise that resolves to base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Error al convertir la imagen a base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a profile photo as base64 to the database
 * @param file The image file to upload
 * @returns The base64 data URL string
 */
export const uploadProfilePhoto = async (file: File): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validate file size (max 2MB for base64 storage)
    const maxSize = 2 * 1024 * 1024; // 2MB (smaller limit for base64)
    if (file.size > maxSize) {
      throw new Error('La imagen no puede ser mayor a 2MB');
    }

    // Compress the image before converting to base64
    const compressedFile = await compressImage(file, 400, 0.7); // Smaller size and lower quality for base64

    // Convert to base64
    const base64String = await fileToBase64(compressedFile);

    console.log('✅ Photo converted to base64 successfully');
    return base64String;

  } catch (error) {
    console.error('❌ Error converting profile photo to base64:', error);
    throw error;
  }
};

/**
 * Deletes/clears a profile photo (for base64 storage, this just returns)
 * @param _photoUrl The base64 data URL (no actual deletion needed)
 */
export const deleteProfilePhoto = async (_photoUrl: string): Promise<void> => {
  try {
    // For base64 storage, no actual deletion is needed from external storage
    // The data is stored directly in the database
    console.log('✅ Photo reference cleared (base64 storage)');
    return;
  } catch (error) {
    console.error('❌ Error clearing profile photo reference:', error);
    // Don't throw here, as this is not critical for user experience
  }
};

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
 * Compresses an image file before upload
 * @param file The original image file
 * @param maxWidth Maximum width in pixels
 * @param quality JPEG quality (0-1)
 * @returns Compressed image file
 */
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = img;
      let { width: newWidth, height: newHeight } = img;

      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      }

      // Set canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al comprimir la imagen'));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    img.src = URL.createObjectURL(file);
  });
};