import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, name, password } = await request.json();

    if (!username || !email || !name || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = findUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);
    const newUser = createUser({
      username,
      email,
      name,
      password: hashedPassword,
    });

    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}