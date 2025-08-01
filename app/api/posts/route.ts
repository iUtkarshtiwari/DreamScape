import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllPosts, createPost, getPostsByUser } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const posts = userId ? getPostsByUser(userId) : getAllPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { image_url, caption } = await request.json();
    
    if (!image_url) {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
        { status: 400 }
      );
    }

    const newPost = createPost({
      user_id: payload.userId,
      image_url,
      caption: caption || '',
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}