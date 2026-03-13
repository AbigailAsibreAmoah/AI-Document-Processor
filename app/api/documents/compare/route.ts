import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth';
import { DocumentService } from '../../../../services/document';

const authService = new AuthService();
const documentService = new DocumentService();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);
    const { docId1, docId2 } = await request.json();

    if (!docId1 || !docId2) {
      return NextResponse.json({ success: false, error: 'Two document IDs required' }, { status: 400 });
    }

    const comparison = await documentService.compareDocuments(docId1, docId2, decoded.userId);
    return NextResponse.json({ success: true, data: comparison });
  } catch (error) {
    console.error('Compare error:', error);
    return NextResponse.json({ success: false, error: 'Comparison failed' }, { status: 500 });
  }
}