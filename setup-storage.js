// Script to manually create storage bucket and policies for profile photos
// Run this once in the browser console or as a one-time setup

import { supabase } from './src/lib/supabase.ts';

async function setupProfilePhotosStorage() {
  try {
    console.log('🔧 Setting up profile photos storage...');
    
    // Create the storage bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating bucket:', bucketError);
      throw bucketError;
    } else if (bucketError && bucketError.message.includes('already exists')) {
      console.log('✅ Bucket already exists, continuing...');
    } else {
      console.log('✅ Bucket created successfully:', bucket);
    }
    
    // Check if bucket exists now
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      throw listError;
    }
    
    const profilePhotosBucket = buckets?.find(b => b.name === 'profile-photos');
    if (profilePhotosBucket) {
      console.log('✅ Profile photos bucket is available:', profilePhotosBucket);
    } else {
      console.error('❌ Profile photos bucket not found after creation');
    }
    
    console.log('🎉 Storage setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error);
    return false;
  }
}

// Export for manual execution
window.setupProfilePhotosStorage = setupProfilePhotosStorage;

console.log('📝 Run setupProfilePhotosStorage() in the browser console to create the storage bucket');