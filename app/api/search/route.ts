import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../services/auth';
import { DocumentService } from '../../../services/document';

const authService = new AuthService();
const documentService = new DocumentService();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);
    const query = request.nextUrl.searchParams.get('q');

    if (!query?.trim()) {
      return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 });
    }

    const results = await documentService.semanticSearch(query, decoded.userId);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}