import { NextRequest, NextResponse } from 'next/server';
import { HakunaAIService } from '../../../../services/hakuna-ai-service';
import { AuthService } from '../../../../services/auth';

const hakunaService = new HakunaAIService();
const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    await authService.verifyToken(token);

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await hakunaService.handleChatMessage(message);

    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Hakuna chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
