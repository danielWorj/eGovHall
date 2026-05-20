
export interface UploadResponse {
  success:        boolean;
  document_id:    string;
  intitule:       string;
  cloudinary_url: string;
  chunks_created: number;
}

export interface AskSource {
  document_id: string;
  intitule:    string;
}

export interface AskResponse {
  question:    string;
  answer:      string;
  sources:     AskSource[];
  chunks_used: number;
}

export interface AskRequest {
  question:     string;
  document_id?: string;   // optionnel : limiter à un document
  n_results?:   number;   // optionnel : nombre de chunks (défaut 5)
}

export interface Document {
  id:                   string;
  intitule:             string;
  cloudinary_url:       string;
  cloudinary_public_id: string;
  mime_type:            string;
  chunk_count:          number;
  created_at:           string;
}

export interface DocumentsResponse {
  documents: Document[];
  total:     number;
}

export interface StatusResponse {
  groq_connected: boolean;
  chat_model:     string;
  embed_model:    string;
  db_connected:   boolean;
  chunks_indexes: number;
}
