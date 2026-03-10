export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  status: DocumentStatus;
  uploadedAt: Date;
  processedAt?: Date;
  userId: string;
}

export interface ProcessingResult {
  id: string;
  summary?: string;
  extractedText?: string;
  keyData?: KeyData;
  clauses?: Clauses;
  confidence?: number;
  processedAt: Date;
  documentId: string;
  documentType?: string;
  category?: string;
  tags?: string[];
  recommendation?: string;
}

export interface KeyData {
  parties?: string[];
  dates?: string[];
  amounts?: string[];
  obligations?: string[];
}

export interface Clauses {
  risks?: string[];
  protections?: string[];
  ambiguities?: string[];
  paymentTerms?: string[];
  obligations?: string[];
  deadlines?: string[];
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface ProcessingResponse {
  success: boolean;
  result?: ProcessingResult;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}