import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, isSupabaseStorageConfigured } from '@/lib/supabase-storage';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary-config';
import { FILE_UPLOAD } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload/image
 * Upload an image file to storage (Supabase Storage or Cloudinary)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (you can add JWT verification here)
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Allowed types: ${FILE_UPLOAD.ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    let url: string;
    let publicId: string | undefined;

    // Try Supabase Storage first, fallback to Cloudinary
    if (isSupabaseStorageConfigured()) {
      try {
        const result = await uploadToSupabaseStorage(file, 'travel-booking');
        url = result.url;
        publicId = result.path;
      } catch (error) {
        console.error('Supabase upload failed, trying Cloudinary:', error);
        // Fallback to Cloudinary if Supabase fails
        if (isCloudinaryConfigured()) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await uploadToCloudinary(
            buffer,
            'travel-booking'
          );
          url = result.url;
          publicId = result.publicId;
        } else {
          throw new Error('No storage service configured');
        }
      }
    } else if (isCloudinaryConfigured()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(
        buffer,
        'travel-booking'
      );
      url = result.url;
      publicId = result.publicId;
    } else {
      return NextResponse.json(
        { error: 'No storage service configured. Please configure Supabase Storage or Cloudinary.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url,
      publicId,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
