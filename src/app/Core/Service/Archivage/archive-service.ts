import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AskRequest, AskResponse, DocumentsResponse, StatusResponse, UploadResponse } from '../../Model/Rag/RagModel';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';


@Injectable({
  providedIn: 'root',
})
export class ArchiveService {

  constructor(private http: HttpClient) {}

  /**
   * Uploade un fichier (PDF ou image) pour l'archiver et l'indexer.
   * @param file     Le fichier à archiver
   * @param intitule Titre du document (optionnel)
   */
  uploadDocument(file: File, intitule?: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (intitule) {
      formData.append('intitule', intitule);
    }
    return this.http.post<UploadResponse>(
      eHAllSystemEndPoints.Archive.upload,
      formData
    );
  }

  /**
   * Pose une question au système RAG.
   * @param payload question + filtres optionnels
   */
  askQuestion(payload: AskRequest): Observable<AskResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<AskResponse>(
      eHAllSystemEndPoints.Archive.ask,
      payload,
      { headers }
    );
  }

  /**
   * Récupère la liste de tous les documents archivés.
   */
  getDocuments(): Observable<DocumentsResponse> {
    return this.http.get<DocumentsResponse>(
      eHAllSystemEndPoints.Archive.documents
    );
  }

  /**
   * Vérifie l'état du système (Groq, MySQL, ChromaDB).
   */
  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(
      eHAllSystemEndPoints.Archive.status
    );
  }
}