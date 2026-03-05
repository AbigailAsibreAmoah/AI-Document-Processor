import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const user = await authService.register(email, password, name);

    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}