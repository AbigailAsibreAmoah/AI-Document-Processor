import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { prisma } from '../../../../database';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);

    const results = await prisma.processingResult.findMany({
      where: {
        document: { userId: decoded.userId, status: 'COMPLETED' }
      },
      include: {
        document: { select: { originalName: true } }
      },
      orderBy: { processedAt: 'desc' },
    });

    const documentsContext = results.map(r => ({
      name: r.document.originalName,
      text: r.extractedText?.substring(0, 3000) ?? '',
    }));

    return NextResponse.json({ success: true, data: documentsContext });
  } catch (error) {
    console.error('Hakuna documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}