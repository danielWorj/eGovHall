import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../../../Core/Service/Archivage/archive-service';
import { DocumentsResponse, UploadResponse, Document } from '../../../../Core/Model/Rag/RagModel';

@Component({
  selector: 'app-archivage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archivage.html',
  styleUrl: './archivage.css',
})
export class Archivage implements OnInit {

  private archiveService = inject(ArchiveService);

  // ── Signaux état upload ────────────────────────────────────────────────────
  selectedFile   = signal<File | null>(null);
  intitule       = signal<string>('');
  uploading      = signal<boolean>(false);
  uploadSuccess  = signal<UploadResponse | null>(null);
  uploadError    = signal<string | null>(null);
  isDragOver     = signal<boolean>(false);

  // ── Signaux état documents ─────────────────────────────────────────────────
  documents      = signal<Document[]>([]);
  loadingDocs    = signal<boolean>(false);
  docsError      = signal<string | null>(null);
  searchQuery    = signal<string>('');

  // ── Signaux filtres ────────────────────────────────────────────────────────
  filterType     = signal<string>('tous');

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredDocs = computed(() => {
    let docs = this.documents();
    const q  = this.searchQuery().toLowerCase().trim();
    const ft = this.filterType();

    if (q) {
      docs = docs.filter(d => d.intitule.toLowerCase().includes(q));
    }
    if (ft !== 'tous') {
      docs = docs.filter(d => d.mime_type.includes(ft));
    }
    return docs;
  });

  totalDocuments = computed(() => this.documents().length);
  totalPdf       = computed(() => this.documents().filter(d => d.mime_type === 'application/pdf').length);
  totalImages    = computed(() => this.documents().filter(d => d.mime_type.startsWith('image/')).length);
  totalChunks    = computed(() => this.documents().reduce((acc, d) => acc + d.chunk_count, 0));

  canUpload = computed(() =>
    this.selectedFile() !== null && !this.uploading()
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDocuments();
  }

  // ── Gestion fichier ────────────────────────────────────────────────────────
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  setFile(file: File): void {
    this.selectedFile.set(file);
    this.uploadSuccess.set(null);
    this.uploadError.set(null);
    if (!this.intitule()) {
      this.intitule.set(file.name.replace(/\.[^.]+$/, ''));
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.intitule.set('');
    this.uploadSuccess.set(null);
    this.uploadError.set(null);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    this.archiveService.uploadDocument(file, this.intitule()).subscribe({
      next: (res) => {
        this.uploadSuccess.set(res);
        this.uploading.set(false);
        this.clearFile();
        this.loadDocuments();
      },
      error: (err) => {
        this.uploadError.set(err?.error?.error ?? 'Erreur lors de l\'archivage.');
        this.uploading.set(false);
      },
    });
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  loadDocuments(): void {
    this.loadingDocs.set(true);
    this.docsError.set(null);

    this.archiveService.getDocuments().subscribe({
      next: (res: DocumentsResponse) => {
        this.documents.set(res.documents);
        this.loadingDocs.set(false);
      },
      error: (err) => {
        this.docsError.set(err?.error?.error ?? 'Impossible de charger les documents.');
        this.loadingDocs.set(false);
      },
    });
  }

  mimeIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    return '📁';
  }

  mimeLabel(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase();
    return mimeType;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}