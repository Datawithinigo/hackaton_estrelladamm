import { supabase } from './supabase';

/**
 * Uploads a profile photo to Supabase Storage
 * @param file The image file to upload
 * @param userId The user's ID for file naming
 * @returns The public URL of the uploaded image
 */
export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('La imagen no puede ser mayor a 5MB');
    }

    // Check if bucket exists and create it if needed
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'profile-photos');
    
    if (!bucketExists) {
      console.log('📁 Creating profile-photos bucket...');
      const { error: bucketError } = await supabase.storage.createBucket('profile-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (bucketError) {
        console.error('❌ Error creating bucket:', bucketError);
        throw new Error(`Error al crear el bucket: ${bucketError.message}`);
      }
      console.log('✅ Profile-photos bucket created successfully');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Error al obtener la URL de la imagen');
    }

    console.log('✅ Photo uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Error uploading profile photo:', error);
    throw error;
  }
};

/**
 * Deletes a profile photo from Supabase Storage
 * @param photoUrl The URL of the photo to delete
 */
export const deleteProfilePhoto = async (photoUrl: string): Promise<void> => {
  try {
    if (!photoUrl.includes('profile-photos/')) {
      // Not a storage URL, nothing to delete
      return;
    }

    // Extract file path from URL
    const urlParts = photoUrl.split('/storage/v1/object/public/profile-photos/');
    if (urlParts.length !== 2) {
      console.warn('Could not parse photo URL for deletion:', photoUrl);
      return;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting photo:', error);
      // Don't throw here, as this is not critical
    } else {
      console.log('✅ Photo deleted successfully:', filePath);
    }
  } catch (error) {
    console.error('❌ Error deleting profile photo:', error);
    // Don't throw here, as this is not critical for user experience
  }
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