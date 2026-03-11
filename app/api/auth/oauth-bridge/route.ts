import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('=== OAUTH BRIDGE ===');
    console.log('Session:', JSON.stringify(session));
    console.log('Cookies:', request.headers.get('cookie'));

    if (!session?.user?.email) {
      console.log('No session - returning 400');
      return NextResponse.json({ success: false, error: 'No session' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? session.user.email.split('@')[0],
          password: '',
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (error) {
    console.error('OAuth bridge error:', error);
    return NextResponse.json({ success: false, error: 'Bridge failed' }, { status: 500 });
  }
}