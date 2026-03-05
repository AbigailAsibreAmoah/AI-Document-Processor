import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../../services/document';
import { AuthService } from '../../../../services/auth';

const documentService = new DocumentService();
const authService = new AuthService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);

    const document = await documentService.getDocument(id, decoded.userId);
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    const processingResult = await documentService.getProcessingResult(id);

    return NextResponse.json({
      success: true,
      data: {
        document,
        processingResult
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}