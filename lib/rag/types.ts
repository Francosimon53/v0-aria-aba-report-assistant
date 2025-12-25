export type DocumentType = 'insurance' | 'report' | 'guideline' | 'research';

export type InsuranceProvider = 
  | 'aetna' | 'bcbs' | 'uhc' | 'cigna' | 'anthem' | 'humana' | 'optum' | 'magellan' | 'other';

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  file_name?: string;
  file_size?: number;
  document_type: DocumentType;
  insurance_provider?: InsuranceProvider;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QueryRequest {
  query: string;
  filters?: {
    documentType?: DocumentType[];
    insurance?: InsuranceProvider;
    minSimilarity?: number;
  };
  topK?: number;
  includeMetadata?: boolean;
}

export interface QueryChunk {
  id: string;
  text: string;
  similarity: number;
  documentId: string;
  documentTitle: string;
  documentType: DocumentType;
  insuranceProvider?: InsuranceProvider;
  chunkIndex: number;
  metadata: Record<string, any>;
}

export interface QueryResponse {
  chunks: QueryChunk[];
  query: string;
  totalResults: number;
  processingTime: number;
}

export class RagError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'RagError';
  }
}

export class ValidationError extends RagError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}