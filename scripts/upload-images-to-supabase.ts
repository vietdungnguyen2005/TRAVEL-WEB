/**
 * Script to upload existing images to Supabase Storage
 * 
 * Usage:
 * 1. Place your images in a folder (e.g., ./images-to-upload/)
 * 2. Update the IMAGES_FOLDER path below
 * 3. Run: npx ts-node scripts/upload-images-to-supabase.ts
 * 
 * This script will:
 * - Read all images from the specified folder
 * - Upload them to Supabase Storage
 * - Output a JSON file with the mapping of local files to Supabase URLs
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.supabase' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Please configure these in your .env.supabase or .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const BUCKET_NAME = 'images';
const IMAGES_FOLDER = './images-to-upload'; // Change this to your images folder
const OUTPUT_FILE = './image-upload-mapping.json';

interface ImageMapping {
  localPath: string;
  supabaseUrl: string;
  supabasePath: string;
  uploadedAt: string;
}

async function ensureBucketExists() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // Make bucket public so images can be accessed
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
    console.log(`✅ Bucket created successfully`);
  } else {
    console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
  }
}

async function uploadImage(filePath: string, folder: string = 'travel-booking'): Promise<ImageMapping> {
  const fileName = filePath.split(/[/\\]/).pop() || 'image';
  const fileExtension = extname(fileName);
  const baseName = fileName.replace(fileExtension, '');
  
  // Create unique file name
  const uniqueFileName = `${baseName}-${Date.now()}${fileExtension}`;
  const supabasePath = `${folder}/${uniqueFileName}`;

  // Read file
  const fileBuffer = await readFile(filePath);

  // Upload to Supabase
  console.log(`📤 Uploading: ${fileName} -> ${supabasePath}`);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(supabasePath, fileBuffer, {
      contentType: `image/${fileExtension.slice(1)}`,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(supabasePath);

  if (!urlData?.publicUrl) {
    throw new Error(`Failed to get public URL for ${fileName}`);
  }

  console.log(`✅ Uploaded: ${urlData.publicUrl}`);

  return {
    localPath: filePath,
    supabaseUrl: urlData.publicUrl,
    supabasePath,
    uploadedAt: new Date().toISOString(),
  };
}

async function main() {
  try {
    console.log('🚀 Starting image upload to Supabase Storage...\n');

    // Ensure bucket exists
    await ensureBucketExists();
    console.log('');

    // Read all files from images folder
    const files = await readdir(IMAGES_FOLDER);
    const imageFiles = files.filter(file => {
      const ext = extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log(`⚠️  No image files found in ${IMAGES_FOLDER}`);
      console.log('Please add images to the folder and try again.');
      return;
    }

    console.log(`📁 Found ${imageFiles.length} image(s) to upload\n`);

    // Upload all images
    const mappings: ImageMapping[] = [];
    for (const file of imageFiles) {
      try {
        const filePath = join(IMAGES_FOLDER, file);
        const mapping = await uploadImage(filePath);
        mappings.push(mapping);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error);
      }
    }

    // Save mapping to JSON file
    const fs = await import('fs/promises');
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(mappings, null, 2));
    console.log(`\n📝 Mapping saved to: ${OUTPUT_FILE}`);

    console.log(`\n🎉 Successfully uploaded ${mappings.length}/${imageFiles.length} image(s)`);
    console.log('\n📋 Uploaded images:');
    mappings.forEach(m => {
      console.log(`   ${m.localPath} -> ${m.supabaseUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
