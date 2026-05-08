import { Component, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActeService } from '../../../../Core/Service/Acte/acte-service';
import { ActeNaissance } from '../../../../Core/Model/Acte/ActeNaissance';

@Component({
  selector: 'app-naissance',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './naissance.html',
  styleUrl: './naissance.css',
})
export class Naissance implements OnInit {

  // ── Identity ─────────────────────────────────────────────────────────────
  idMairie = signal<number>(0);

  // ── Data signals ─────────────────────────────────────────────────────────
  listActeNaissance  = signal<ActeNaissance[]>([]);
  acteSelected       = signal<ActeNaissance | null>(null);

  // ── UI state signals ─────────────────────────────────────────────────────
  isLoading          = signal(false);
  isSubmitting       = signal(false);
  successMessage     = signal('');
  errorMessage       = signal('');

  // ── Search / pagination ───────────────────────────────────────────────────
  searchTerm         = signal('');
  currentPage        = signal(1);
  readonly pageSize  = 10;

  // ── Modal visibility ─────────────────────────────────────────────────────
  showModalAdd       = signal(false);
  showModalView      = signal(false);
  showModalEdit      = signal(false);

  // ── Computed filtered list ────────────────────────────────────────────────
  filteredList = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.listActeNaissance().filter(a => {
      const enfant     = a.declaration?.enfant;
      const nomComplet = `${enfant?.prenom ?? ''} ${enfant?.nom ?? ''}`.toLowerCase();
      return !term || nomComplet.includes(term) || (a.numeroActe ?? '').toLowerCase().includes(term);
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────
  paginatedList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredList().length / this.pageSize)));

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Forms ─────────────────────────────────────────────────────────────────
  acteNaissanceFb!: FormGroup;   // Création
  acteEditFb!:      FormGroup;   // Mise à jour

  constructor(private fb: FormBuilder, private acteService: ActeService) {
    const idStored = localStorage.getItem('etablissement');
    this.idMairie.set(idStored ? parseInt(idStored) : 0);
    this.initForms();
  }

  ngOnInit(): void {
    this.getAllActe();
  }

  // ── Form initialisation ───────────────────────────────────────────────────
  private initForms(): void {
    const pereGroup = () => ({
      nomPere:       new FormControl('', Validators.required),
      prenomPere:    new FormControl('', Validators.required),
      telephonePere: new FormControl('', Validators.required),
      emailPere:     new FormControl('', [Validators.required, Validators.email]),
    });

    this.acteNaissanceFb = this.fb.group({
      id:          new FormControl(null),
      date:        new FormControl('', Validators.required),
      declaration: new FormControl(null, Validators.required),
      ...pereGroup(),
    });

    this.acteEditFb = this.fb.group({
      id:          new FormControl(null),
      date:        new FormControl('', Validators.required),
      declaration: new FormControl(null, Validators.required),
      ...pereGroup(),
    });
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  getAllActe(): void {
    this.isLoading.set(true);
    this.acteService.getAllActeNaissanceByMairie(this.idMairie()).subscribe({
      next: (data: ActeNaissance[]) => {
        this.listActeNaissance.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
      },
      error: () => {
        this.isLoading.set(false);
        this.notify('error', 'Impossible de charger les actes de naissance.');
      },
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  openModalAdd(): void {
    this.acteNaissanceFb.reset();
    this.showModalAdd.set(true);
  }
  closeModalAdd(): void { this.showModalAdd.set(false); }

  openModalView(acte: ActeNaissance): void {
    this.acteSelected.set(acte);
    this.showModalView.set(true);
  }
  closeModalView(): void { this.showModalView.set(false); }

  openModalEdit(acte: ActeNaissance): void {
    this.acteSelected.set(acte);
    this.acteEditFb.patchValue({
      id:          acte.id          ?? null,
      date:        acte.date        ?? '',
      declaration: acte.declaration?.id ?? null,
      nomPere:       acte.pere?.nom       ?? '',
      prenomPere:    acte.pere?.prenom    ?? '',
      telephonePere: acte.pere?.telephone ?? '',
      emailPere:     acte.pere?.email     ?? '',
    });
    this.showModalView.set(false);
    this.showModalEdit.set(true);
  }
  closeModalEdit(): void { this.showModalEdit.set(false); }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  createActe(): void {
    if (this.acteNaissanceFb.invalid) {
      this.acteNaissanceFb.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('acte', JSON.stringify(this.acteNaissanceFb.value));

    this.acteService.creationActeNaissance(formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.status) {
          this.notify('success', 'Acte de naissance créé avec succès !');
          this.closeModalAdd();
          this.getAllActe();
        } else {
          this.notify('error', res.message ?? 'Erreur lors de la création.');
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notify('error', 'Erreur serveur lors de la création.');
      },
    });
  }

  updateActe(): void {
    if (this.acteEditFb.invalid) {
      this.acteEditFb.markAllAsTouched();
      return;
    }
    const acte = this.acteSelected();
    if (!acte?.id) return;

    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('acte', JSON.stringify(this.acteEditFb.value));

    this.acteService.misAjourActeNaissance(acte.id, formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.status) {
          this.notify('success', 'Acte mis à jour avec succès !');
          this.closeModalEdit();
          this.getAllActe();
        } else {
          this.notify('error', res.message ?? 'Erreur lors de la mise à jour.');
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notify('error', 'Erreur serveur lors de la mise à jour.');
      },
    });
  }

  deleteActe(acte: ActeNaissance, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Confirmer la suppression de l'acte ${acte.numeroActe} ?`)) return;
    if (!acte.id) return;
    this.acteService.deleteActeNaissance(acte.id).subscribe({
      next: (res) => {
        if (res.status) {
          this.notify('success', 'Acte supprimé avec succès.');
          this.getAllActe();
        } else {
          this.notify('error', res.message ?? 'Erreur lors de la suppression.');
        }
      },
      error: () => this.notify('error', 'Erreur serveur lors de la suppression.'),
    });
  }

  // ── Search / pagination ───────────────────────────────────────────────────
  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Toast notification */
  private notify(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMessage.set(msg);
      setTimeout(() => this.successMessage.set(''), 4000);
    } else {
      this.errorMessage.set(msg);
      setTimeout(() => this.errorMessage.set(''), 5000);
    }
  }

  /** FormControl helper for template validation display */
  ctrl(form: FormGroup, name: string): FormControl {
    return form.get(name) as FormControl;
  }
}