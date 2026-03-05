import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { z } from 'zod';

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const result = await authService.login(email, password);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}