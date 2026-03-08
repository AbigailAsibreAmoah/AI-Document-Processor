import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { prisma } from '../../../../database';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(authHeader.substring(7));

    const messages = await prisma.chatMessage.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(authHeader.substring(7));
    const { role, content } = await request.json();

    const message = await prisma.chatMessage.create({
      data: { role, content, userId: decoded.userId },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('Save message error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(authHeader.substring(7));

    await prisma.chatMessage.deleteMany({
      where: { userId: decoded.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear messages error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}