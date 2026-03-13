import { prisma } from '../database';
import { StorageService } from './storage';
import { AIService } from '../ai';
import { generateEmbedding, chunkText } from './embedding';
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
      tables: result.tables ? JSON.parse(result.tables) : [],
      figures: result.figures ? JSON.parse(result.figures) : [],
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

  async semanticSearch(query: string, userId: string, limit = 5): Promise<any[]> {
    const queryEmbedding = await generateEmbedding(query);
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const results = await prisma.$queryRaw`
      SELECT
        dc.id,
        dc.content,
        dc."documentId",
        d."originalName",
        d.id as "docId",
        1 - (dc.embedding <=> ${vectorStr}::vector) as similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."documentId"
      WHERE d."userId" = ${userId}
      ORDER BY dc.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;

    return results as any[];
  }

  async compareDocuments(docId1: string, docId2: string, userId: string): Promise<any> {
    const [result1, result2] = await Promise.all([
      prisma.processingResult.findFirst({
        where: { documentId: docId1 },
        include: { document: true },
      }),
      prisma.processingResult.findFirst({
        where: { documentId: docId2 },
        include: { document: true },
      }),
    ]);

    if (!result1 || !result2) throw new Error('Documents not found');

    const prompt = `Compare these two documents and provide a detailed comparison:

DOCUMENT 1: ${result1.document.originalName}
Summary: ${result1.summary}
Type: ${result1.documentType}
Key Data: ${result1.keyData}
Clauses: ${result1.clauses}

DOCUMENT 2: ${result2.document.originalName}
Summary: ${result2.summary}
Type: ${result2.documentType}
Key Data: ${result2.keyData}
Clauses: ${result2.clauses}

Provide comparison in JSON format with these fields:
{
  "similarities": ["..."],
  "differences": ["..."],
  "doc1Advantages": ["..."],
  "doc2Advantages": ["..."],
  "recommendation": "..."
}`;

    const comparison = await this.aiService.generateCompletion(prompt);
    return JSON.parse(comparison);
  }

  private async processDocumentAsync(documentId: string, file: Buffer, mimeType: string) {
    try {
      console.log(`Starting processing for document ${documentId}`);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      });

      const { text, tables, figures } = await this.extractContent(file, mimeType);
      console.log(`Extracted text: ${text.length} chars, ${tables.length} tables, ${figures.length} figures`);

      const result = await this.aiService.processDocument(text);

      await prisma.processingResult.create({
        data: {
          documentId,
          summary: result.summary,
          extractedText: text,
          keyData: JSON.stringify(result.keyData),
          clauses: JSON.stringify(result.clauses),
          tables: JSON.stringify(tables),
          figures: JSON.stringify(figures),
          confidence: result.confidence,
          documentType: result.documentType,
          category: result.category,
          tags: JSON.stringify(result.tags),
          recommendation: result.recommendation,
        },
      });

      // Generate embeddings for semantic search
      await this.generateAndStoreEmbeddings(documentId, text);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });

      console.log(`Document ${documentId} processing completed`);
    } catch (error) {
      console.error('Error processing document:', error);
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async generateAndStoreEmbeddings(documentId: string, text: string) {
    try {
      // Delete existing chunks if reprocessing
      await prisma.documentChunk.deleteMany({ where: { documentId } });

      const chunks = chunkText(text);
      console.log(`Generating embeddings for ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        const vectorStr = `[${embedding.join(',')}]`;

        await prisma.$executeRaw`
          INSERT INTO document_chunks (id, content, "chunkIndex", embedding, "createdAt", "documentId")
          VALUES (
            ${`chunk_${documentId}_${i}`},
            ${chunks[i]},
            ${i},
            ${vectorStr}::vector,
            NOW(),
            ${documentId}
          )
        `;
      }

      console.log(`Stored ${chunks.length} embeddings for document ${documentId}`);
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  }

  private async extractContent(file: Buffer, mimeType: string): Promise<{
    text: string;
    tables: any[];
    figures: any[];
  }> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractFromPDF(file);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxData = await mammoth.extractRawText({ buffer: file });
          const docxHtml = await mammoth.convertToHtml({ buffer: file });
          const docxTables = this.extractTablesFromHtml(docxHtml.value);
          return { text: docxData.value, tables: docxTables, figures: [] };

        case 'text/plain':
          return { text: file.toString('utf-8'), tables: [], figures: [] };

        default:
          return { text: file.toString('utf-8'), tables: [], figures: [] };
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      return { text: 'Error: Could not extract content.', tables: [], figures: [] };
    }
  }

  private async extractFromPDF(file: Buffer): Promise<{
    text: string;
    tables: any[];
    figures: any[];
  }> {
    const pdfData = await pdfParse(file);
    const text = pdfData.text;
    const tables = this.extractTablesFromText(text);
    const figures = this.detectFigures(text, pdfData);

    return { text, tables, figures };
  }

  private extractTablesFromText(text: string): any[] {
    const tables: any[] = [];
    const lines = text.split('\n');
    let currentTable: string[][] = [];
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      // Detect table rows — lines with multiple whitespace-separated columns
      const cells = trimmed.split(/\s{2,}|\t/).filter(c => c.trim());
      if (cells.length >= 2 && trimmed.length > 0) {
        currentTable.push(cells);
        inTable = true;
      } else {
        if (inTable && currentTable.length >= 2) {
          tables.push({
            headers: currentTable[0],
            rows: currentTable.slice(1),
            rowCount: currentTable.length - 1,
            colCount: currentTable[0].length,
          });
        }
        currentTable = [];
        inTable = false;
      }
    }

    if (inTable && currentTable.length >= 2) {
      tables.push({
        headers: currentTable[0],
        rows: currentTable.slice(1),
        rowCount: currentTable.length - 1,
        colCount: currentTable[0].length,
      });
    }

    return tables;
  }

  private extractTablesFromHtml(html: string): any[] {
    const tables: any[] = [];
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const rows: string[][] = [];
      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableMatch[1])) !== null) {
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        if (cells.length > 0) rows.push(cells);
      }
      if (rows.length >= 2) {
        tables.push({
          headers: rows[0],
          rows: rows.slice(1),
          rowCount: rows.length - 1,
          colCount: rows[0].length,
        });
      }
    }

    return tables;
  }

  private detectFigures(text: string, pdfData: any): any[] {
    const figures: any[] = [];
    const figureRegex = /(?:figure|fig\.?|chart|graph|diagram|image)\s*(\d+)?[:\s]/gi;
    let match;

    while ((match = figureRegex.exec(text)) !== null) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + 120);
      figures.push({
        label: match[0].trim(),
        number: match[1] || null,
        context: text.slice(start, end).trim(),
      });
    }

    return figures;
  }
}