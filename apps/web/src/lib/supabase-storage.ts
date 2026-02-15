import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Supabase Storage will not work.');
}

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Supabase Storage uploads will not work.');
}

// Use service role key for server-side operations (bypasses RLS)
export const supabaseStorage = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Upload an image file to Supabase Storage
 * @param file - File buffer or File object
 * @param folder - Folder path in storage bucket (e.g., 'rooms', 'hero-images', 'avatars')
 * @param fileName - Optional custom file name. If not provided, generates a unique name
 * @returns Public URL of the uploaded image
 */
export async function uploadToSupabaseStorage(
  file: Buffer | File,
  folder: string = 'travel-booking',
  fileName?: string
): Promise<{ url: string; path: string }> {
  if (!supabaseStorage) {
    throw new Error('Supabase Storage is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const bucketName = 'images'; // Default bucket name - you can change this

  try {
    // Generate unique file name if not provided
    const fileExtension = file instanceof File 
      ? file.name.split('.').pop() || 'jpg'
      : 'jpg';
    
    const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Convert File to Buffer if needed
    let fileBuffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      fileBuffer = file;
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabaseStorage.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file instanceof File ? file.type : 'image/jpeg',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseStorage.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error instanceof Error ? error : new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param filePath - Path to the file in storage (e.g., 'rooms/image.jpg')
 */
export async function deleteFromSupabaseStorage(filePath: string): Promise<void> {
  if (!supabaseStorage) {
    throw new Error('Supabase Storage is not configured.');
  }

  const bucketName = 'images';

  try {
    const { error } = await supabaseStorage.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting from Supabase Storage:', error);
    throw error instanceof Error ? error : new Error('Failed to delete image');
  }
}

/**
 * Check if Supabase Storage is configured
 */
export function isSupabaseStorageConfigured(): boolean {
  return !!supabaseStorage;
}
