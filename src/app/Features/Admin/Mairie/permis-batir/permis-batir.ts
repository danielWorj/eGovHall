import { Component, signal, computed, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PermisService } from '../../../../Core/Service/Permis/permis-service';
import { ConstructDossierPermis, DossierPermisBatir } from '../../../../Core/Model/Permis/DossierPermis';
import { TypePlan } from '../../../../Core/Model/Permis/TypePlan';
import { PlanExecution } from '../../../../Core/Model/Permis/PlanExecution';
import { ServerResponse } from '../../../../Core/Model/Server/ServerResponse';


// ──────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-permis-batir',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permis-batir.html',
  styleUrl: './permis-batir.css',
})
export class PermisBatir {

  // ── DI ────────────────────────────────────────────────────────────────────
  private fb            = inject(FormBuilder);
  private permisService = inject(PermisService);

  // ── Identité mairie ───────────────────────────────────────────────────────
  idMairie = signal<number>(0);

  // ── Données ───────────────────────────────────────────────────────────────
  listDossiers    = signal<DossierPermisBatir[]>([]);
  dossierSelected = signal<DossierPermisBatir | null>(null);
  dossierSelectedDetails = signal<ConstructDossierPermis | null>(null);
  listTypePlan    = signal<TypePlan[]>([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  isLoading      = signal(false);
  isSubmitting   = signal(false);
  successMessage = signal('');
  errorMessage   = signal('');

  // ── Recherche / pagination ────────────────────────────────────────────────
  searchTerm       = signal('');
  currentPage      = signal(1);
  readonly pageSize = 10;

  // ── Modals ────────────────────────────────────────────────────────────────
  showModalAdd  = signal(false);
  showModalView = signal(false);
  showModalEdit = signal(false);

  // ── Fichiers — création / édition ─────────────────────────────────────────
  fileCni                   = signal<File | null>(null);
  fileDemandeTimbre         = signal<File | null>(null);
  fileCertificatUrbanisme   = signal<File | null>(null);
  fileCertificatPropriete   = signal<File | null>(null);
  fileDevis                 = signal<File | null>(null);
  filePlanMasse             = signal<File | null>(null);
  filePlanSituationTerrain  = signal<File | null>(null);

  // ── Plans d'exécution ─────────────────────────────────────────────────────
  plansExecution    = signal<PlanExecution[]>([]);
  planEnCours       = signal<File | null>(null);
  typePlanIdEnCours = signal<number | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredList = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.listDossiers().filter(d => {
      if (!term) return true;
      const demandeur  = `${d.demandeur?.nom ?? ''} ${d.demandeur?.prenom ?? ''}`.toLowerCase();
      const numero     = (d.numeroDossier ?? '').toLowerCase();
      const statut     = (d.statut?.intitule ?? '').toLowerCase();
      const raison     = (d.raison ?? '').toLowerCase();
      return demandeur.includes(term) || numero.includes(term)
          || statut.includes(term)    || raison.includes(term);
    });
  });

  paginatedList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredList().length / this.pageSize)));
  pages      = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Stats ─────────────────────────────────────────────────────────────────
  totalEnEvaluation = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule?.toUpperCase() === 'EN EVALUATION').length);
  totalValides = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule?.toUpperCase() === 'VALIDE').length);
  totalRejetes = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule?.toUpperCase() === 'REJETE').length);

  // ── Formulaires ───────────────────────────────────────────────────────────
  dossierFb!:     FormGroup;
  dossierEditFb!: FormGroup;

  // ─────────────────────────────────────────────────────────────────────────
  constructor() {
    const idStored = localStorage.getItem('etablissement');
    this.idMairie.set(idStored ? parseInt(idStored) : 0);
    this.initForms();
    this.loadPage();
  }

  loadPage(): void {
    this.getAllDossiers();
    this.getAllTypePlan();
  }

  // ── Initialisation formulaires ────────────────────────────────────────────
  private champsDemandeur() {
    return {
      nom      : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
      prenom   : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
      telephone: new FormControl<string>('', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]),
      email    : new FormControl<string>('', [Validators.required, Validators.email]),
      raison   : new FormControl<string>('', Validators.required),
    };
  }

  private initForms(): void {
    this.dossierFb     = this.fb.group({ id: new FormControl(null), ...this.champsDemandeur() });
    this.dossierEditFb = this.fb.group({ id: new FormControl(null), ...this.champsDemandeur() });
  }

  // ── Chargement des données ────────────────────────────────────────────────
  getAllDossiers(): void {
    this.isLoading.set(true);
    this.permisService.findAllDossierPermisByMairie(this.idMairie()).subscribe({
      next: (data: DossierPermisBatir[]) => {
        this.listDossiers.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
      },
      error: () => {
        this.isLoading.set(false);
        this.notify('error', 'Impossible de charger les dossiers de permis de bâtir.');
      },
    });
  }

  getAllTypePlan(): void {
    this.permisService.findAllTypePlan().subscribe({
      next: (data: TypePlan[]) => this.listTypePlan.set(data),
      error: () => console.error('Erreur chargement types de plan'),
    });
  }

  // ── Gestion des modals ────────────────────────────────────────────────────
  openModalAdd(): void {
    this.dossierFb.reset();
    this.resetFichiers();
    this.plansExecution.set([]);
    this.showModalAdd.set(true);
  }

  closeModalAdd(): void {
    this.resetFichiers();
    this.plansExecution.set([]);
    this.showModalAdd.set(false);
  }

  openModalView(dossier: DossierPermisBatir): void {
    this.dossierSelected.set(dossier);
    this.showModalView.set(true);
  }

  closeModalView(): void {
    this.showModalView.set(false);
  }

  openModalEdit(dossier: DossierPermisBatir): void {
    this.dossierSelected.set(dossier);
    this.dossierEditFb.patchValue({
      id       : dossier.id,
      nom      : dossier.demandeur?.nom        ?? '',
      prenom   : dossier.demandeur?.prenom     ?? '',
      telephone: dossier.demandeur?.telephone  ?? '',
      email    : dossier.demandeur?.email      ?? '',
      raison   : dossier.raison                ?? '',
    });
    this.resetFichiers();
    this.plansExecution.set([]);
    this.showModalView.set(false);
    this.showModalEdit.set(true);
  }

  closeModalEdit(): void {
    this.showModalEdit.set(false);
  }

  // ── Gestion des fichiers ──────────────────────────────────────────────────
  onFileChange(
    event: Event,
    cible: 'fileCni' | 'fileDemandeTimbre' | 'fileCertificatUrbanisme' |
           'fileCertificatPropriete' | 'fileDevis' | 'filePlanMasse' | 'filePlanSituationTerrain'
  ): void {
    const input = event.target as HTMLInputElement;
    this[cible].set(input.files?.[0] ?? null);
  }

  onPlanFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.planEnCours.set(input.files?.[0] ?? null);
  }

  onTypePlanChange(valeur: string): void {
    this.typePlanIdEnCours.set(+valeur);
  }

  ajouterPlan(): void {
   
  }

  supprimerPlan(index: number): void {
    this.plansExecution.update(plans => plans.filter((_, i) => i !== index));
  }

  private resetFichiers(): void {
    this.fileCni.set(null);
    this.fileDemandeTimbre.set(null);
    this.fileCertificatUrbanisme.set(null);
    this.fileCertificatPropriete.set(null);
    this.fileDevis.set(null);
    this.filePlanMasse.set(null);
    this.filePlanSituationTerrain.set(null);
    this.planEnCours.set(null);
    this.typePlanIdEnCours.set(null);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  createDossier(): void {
    if (this.dossierFb.invalid) {
      this.dossierFb.markAllAsTouched();
      this.notify('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.isSubmitting.set(true);
    this.permisService.creationDossierPermis(this.construireFormData(this.dossierFb)).subscribe({
      next: (res: ServerResponse) => {
        this.isSubmitting.set(false);
        if (res.status) {
          this.notify('success', 'Dossier de permis créé avec succès !');
          this.closeModalAdd();
          this.getAllDossiers();
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

  updateDossier(): void {
    if (this.dossierEditFb.invalid) {
      this.dossierEditFb.markAllAsTouched();
      this.notify('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.isSubmitting.set(true);
    this.permisService.updateDossierPermis(this.construireFormData(this.dossierEditFb)).subscribe({
      next: (res: ServerResponse) => {
        this.isSubmitting.set(false);
        if (res.status) {
          this.notify('success', 'Dossier mis à jour avec succès !');
          this.closeModalEdit();
          this.getAllDossiers();
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

  deleteDossier(dossier: DossierPermisBatir, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Confirmer la suppression du dossier ${dossier.numeroDossier ?? ''} ?`)) return;
    if (!dossier.id) return;
    this.permisService.deleteDossierPermis(dossier.id).subscribe({
      next: () => {
        this.notify('success', 'Dossier supprimé avec succès.');
        this.getAllDossiers();
      },
      error: () => this.notify('error', 'Erreur serveur lors de la suppression.'),
    });
  }

  // ── Construction FormData ─────────────────────────────────────────────────
  private construireFormData(form: FormGroup): FormData {
    const fd = new FormData();
    const v  = form.value;

    const dto = {
      id           : v.id          ?? undefined,
      nom          : v.nom?.trim(),
      prenom       : v.prenom?.trim(),
      telephone    : v.telephone?.trim(),
      email        : v.email?.trim(),
      raison       : v.raison?.trim(),
      mairieId     : this.idMairie(),
      typesPlansIds: this.plansExecution().map(p => p.id),
    };
    fd.append('dossier', JSON.stringify(dto));

    const annexer = (cle: string, f: File | null) => {
      if (f) fd.append(cle, f, f.name);
    };

    annexer('cni',                  this.fileCni());
    annexer('demandeTimbre',        this.fileDemandeTimbre());
    annexer('certificatUrbanisme',  this.fileCertificatUrbanisme());
    annexer('certificatPropriete',  this.fileCertificatPropriete());
    annexer('devis',                this.fileDevis());
    annexer('planMasse',            this.filePlanMasse());
    annexer('planSituationTerrain', this.filePlanSituationTerrain());

   // this.plansExecution().forEach(p => fd.append('plansExecution', p.file, p.file.name)); // A ADAPTER AVEC LES NOUVELLES MODIFICATIONS ET

    return fd;
  }

  // ── Helpers template ──────────────────────────────────────────────────────
  nomFichier(fichier: File | null, defaut = 'Aucun fichier sélectionné'): string {
    return fichier?.name ?? defaut;
  }

  get nombrePlans(): number {
    return this.plansExecution().length;
  }

  /** Retourne true si le chemin correspond à une image */
  isImage(chemin: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(chemin ?? '');
  }

  /** Retourne true si le chemin correspond à un PDF */
  isPdf(chemin: string): boolean {
    return /\.pdf$/i.test(chemin ?? '');
  }

  /** Classe CSS du badge de statut */
  statutClass(intitule: string): string {
    switch ((intitule ?? '').toUpperCase()) {
      case 'EN EVALUATION': return 'badge-evaluation';
      case 'VALIDE':        return 'badge-valide';
      case 'REJETE':        return 'badge-rejete';
      default:              return 'badge-default';
    }
  }

  // ── Recherche & pagination ────────────────────────────────────────────────
  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  ctrl(form: FormGroup, name: string): FormControl {
    return form.get(name) as FormControl;
  }

  private notify(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMessage.set(msg);
      setTimeout(() => this.successMessage.set(''), 4500);
    } else {
      this.errorMessage.set(msg);
      setTimeout(() => this.errorMessage.set(''), 5500);
    }
  }
}