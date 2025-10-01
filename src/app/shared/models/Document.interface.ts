export interface Document {
  documentId: number;
  uploadedBy: number;
  bankId: number;
  clientId?: number;
  docType?: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface DocumentUploadRequest {
  file: File;
  docType: string;
}

export interface ClientVerificationRequest {
  verificationStatus: string;
  notes: string;
}

export interface DocumentUpdateRequest {
  file: File;
}
