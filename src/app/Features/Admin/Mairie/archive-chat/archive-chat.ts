import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../../../Core/Service/Archivage/archive-service';
import { AskResponse, DocumentsResponse, Document } from '../../../../Core/Model/Rag/RagModel';

export interface ChatMessage {
  role:        'user' | 'assistant' | 'error';
  content:     string;
  sources?:    { document_id: string; intitule: string }[];
  chunks_used?: number;
  timestamp:   Date;
}

@Component({
  selector: 'app-archive-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive-chat.html',
  styleUrl: './archive-chat.css',
})
export class ArchiveChat implements AfterViewChecked {

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private archiveService = inject(ArchiveService);

  // ── Signaux ────────────────────────────────────────────────────────────────
  messages      = signal<ChatMessage[]>([]);
  question      = signal<string>('');
  isLoading     = signal<boolean>(false);
  documents     = signal<Document[]>([]);
  selectedDocId = signal<string>('');
  nResults      = signal<number>(5);
  loadingDocs   = signal<boolean>(false);
  sidebarOpen   = signal<boolean>(true);

  // ── Computed ───────────────────────────────────────────────────────────────
  hasMessages   = computed(() => this.messages().length > 0);
  canSend       = computed(() => this.question().trim().length > 0 && !this.isLoading());

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDocuments();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  loadDocuments(): void {
    this.loadingDocs.set(true);
    this.archiveService.getDocuments().subscribe({
      next: (res: DocumentsResponse) => {
        this.documents.set(res.documents);
        this.loadingDocs.set(false);
      },
      error: () => this.loadingDocs.set(false),
    });
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  sendQuestion(): void {
    const q = this.question().trim();
    if (!q || this.isLoading()) return;

    // Ajouter le message utilisateur
    this.messages.update(msgs => [
      ...msgs,
      { role: 'user', content: q, timestamp: new Date() }
    ]);
    this.question.set('');
    this.isLoading.set(true);

    const payload: any = { question: q, n_results: this.nResults() };
    if (this.selectedDocId()) payload.document_id = this.selectedDocId();

    this.archiveService.askQuestion(payload).subscribe({
      next: (res: AskResponse) => {
        this.messages.update(msgs => [
          ...msgs,
          {
            role:        'assistant',
            content:     res.answer,
            sources:     res.sources,
            chunks_used: res.chunks_used,
            timestamp:   new Date(),
          }
        ]);
        this.isLoading.set(false);
      },
      error: (err) => {
        const errMsg = err?.error?.error ?? 'Erreur lors de la communication avec le serveur.';
        this.messages.update(msgs => [
          ...msgs,
          { role: 'error', content: errMsg, timestamp: new Date() }
        ]);
        this.isLoading.set(false);
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendQuestion();
    }
  }

  clearChat(): void {
    this.messages.set([]);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  selectedDocLabel = computed(() => {
    const id = this.selectedDocId();
    if (!id) return 'Tous les documents';
    const doc = this.documents().find(d => d.id === id);
    return doc?.intitule ?? 'Document sélectionné';
  });
}