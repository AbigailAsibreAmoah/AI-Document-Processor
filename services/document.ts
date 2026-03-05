import { prisma } from '../database';
import { StorageService } from './storage';
import { AIService } from '../ai';
import { DocumentStatus, Document, ProcessingResult } from '../types';
import * as pdfParse from 'pdf-parse';
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
    // Upload file to storage
    const filePath = await this.storageService.uploadFile(file, filename);

    // Save document record
    const document = await prisma.document.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        filePath,
        userId,
        status: DocumentStatus.UPLOADED,
      },
    });

    // Start processing asynchronously
    this.processDocumentAsync(document.id, file, mimeType);

    return document;
  }

  async getDocuments(userId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getDocument(id: string, userId: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: { id, userId },
    });
  }

  async getProcessingResult(documentId: string): Promise<ProcessingResult | null> {
    return prisma.processingResult.findFirst({
      where: { documentId },
    });
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) throw new Error('Document not found');

    // Delete file from storage
    await this.storageService.deleteFile(document.filePath);

    // Delete database record
    await prisma.document.delete({
      where: { id },
    });
  }

  private async processDocumentAsync(documentId: string, file: Buffer, mimeType: string) {
    try {
      // Update status to processing
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING },
      });

      // Extract text based on file type
      const text = await this.extractText(file, mimeType);

      // Process with AI
      const result = await this.aiService.processDocument(text);

      // Save processing result
      await prisma.processingResult.create({
        data: {
          documentId,
          summary: result.summary,
          extractedText: text,
          keyData: result.keyData,
          clauses: result.clauses,
          confidence: result.confidence,
        },
      });

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: { 
          status: DocumentStatus.COMPLETED,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update status to failed
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.FAILED },
      });
    }
  }

  private async extractText(file: Buffer, mimeType: string): Promise<string> {
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
        throw new Error('Unsupported file type');
    }
  }
}