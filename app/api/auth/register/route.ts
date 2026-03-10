import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const user = await authService.register(email, password, name);

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Register error:', error);

    const message =
      error instanceof Error ? error.message : 'Registration failed';

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}