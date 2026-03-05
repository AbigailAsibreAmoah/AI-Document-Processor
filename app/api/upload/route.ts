import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../services/document';
import { AuthService } from '../../../services/auth';
import { validateFileType, validateFileSize } from '../../../lib/utils';

const documentService = new DocumentService();
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
    const decoded = await authService.verifyToken(token);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file)) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;

    // Upload document
    const document = await documentService.uploadDocument(
      buffer,
      filename,
      file.name,
      file.type,
      file.size,
      decoded.userId
    );

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}