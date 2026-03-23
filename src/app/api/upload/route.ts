import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadBufferToCloudinary(
        buffer,
        filename,
        'products'
      );

      urls.push(cloudinaryUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
