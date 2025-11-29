export type EvidenceType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';

export interface UserDetails {
  name: string;
  userName: string;
  email?: string;
}

export interface Evidence {
  id: string;
  incidentId: string;
  filename: string;
  description?: string;
  contentType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  downloadUrl: string;
  createdAt: number;
  updatedAt?: number;
  createdBy: UserDetails;
  updatedBy?: UserDetails;
}

export interface UploadEvidenceRequest {
  file: File;
  description?: string;
}

export interface AddTextEvidenceRequest {
  textContent: string;
  filename?: string;
  description?: string;
}
