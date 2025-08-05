import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
		const authUser = formData.get('auth_user') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('image-plant')
      .upload(filePath, uint8Array, {
        contentType: image.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('image-plant')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get image URL' },
        { status: 500 }
      );
    }

    // Create diagnosis record in database
		const { data: diagnosisData, error: dbError } = await supabase
			.from('diagnoses')
			.insert([
			{
				image_url: urlData.publicUrl,
				id_anon: authUser || uuidv4(),
				is_public: authUser ? false : true,
				is_bookmark: authUser ? true : false,
				created_by: authUser || null,
			}
			])
			.select()
			.single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save diagnosis record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: diagnosisData.id,
      image_url: urlData.publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
