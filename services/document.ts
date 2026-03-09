import { prisma } from '../database';
import { StorageService } from './storage';
import { AIService } from '../ai';
import { Document, ProcessingResult } from '../types';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export class DocumentService {
  private storageService = new StorageService();
  private aiService = new AIService();

  async uploadDocument(
    file: Buffer,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number,
    userId: string
  ): Promise<Document> {
    const filePath = await this.storageService.uploadFile(file, filename);

    const document = await prisma.document.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        filePath,
        userId,
        status: 'UPLOADED',
      },
    });

    this.processDocumentAsync(document.id, file, mimeType);

    return document as Document;
  }

  async getDocuments(userId: string): Promise<Document[]> {
    const docs = await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
    return docs as Document[];
  }

  async getDocument(id: string, userId: string): Promise<Document | null> {
    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });
    return doc as Document | null;
  }

  async getProcessingResult(documentId: string): Promise<ProcessingResult | null> {
    const result = await prisma.processingResult.findFirst({
      where: { documentId },
    });

    if (!result) return null;

    return {
      ...result,
      keyData: result.keyData ? JSON.parse(result.keyData) : null,
      clauses: result.clauses ? JSON.parse(result.clauses) : null,
      tags: result.tags ? JSON.parse(result.tags) : [],
    } as ProcessingResult;
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) throw new Error('Document not found');

    await this.storageService.deleteFile(document.filePath);

    await prisma.document.delete({
      where: { id },
    });
  }

  private async processDocumentAsync(documentId: string, file: Buffer, mimeType: string) {
    try {
      console.log(`Starting processing for document ${documentId}`);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      });

      console.log(`Extracting text from ${mimeType}`);
      const text = await this.extractText(file, mimeType);
      console.log(`Extracted text length: ${text.length}`);

      console.log('Processing with AI service');
      const result = await this.aiService.processDocument(text);
      console.log('AI processing completed:', result);

      await prisma.processingResult.create({
        data: {
          documentId,
          summary: result.summary,
          extractedText: text,
          keyData: JSON.stringify(result.keyData),
          clauses: JSON.stringify(result.clauses),
          confidence: result.confidence,
          documentType: result.documentType,
          category: result.category,
          tags: JSON.stringify(result.tags),
          recommendation: result.recommendation,
        },
      });

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      console.log(`Document ${documentId} processing completed successfully`);
    } catch (error) {
      console.error('Error processing document:', error);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async extractText(file: Buffer, mimeType: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdfParse(file);
          return pdfData.text;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxData = await mammoth.extractRawText({ buffer: file });
          return docxData.value;

        case 'text/plain':
          return file.toString('utf-8');

        default:
          return file.toString('utf-8');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      return 'Error: Could not extract text from this document.';
    }
  }
}