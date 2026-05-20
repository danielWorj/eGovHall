import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PermisService }        from '../../../../Core/Service/Permis/permis-service';
import { ServerResponse }       from '../../../../Core/Model/Server/ServerResponse';
import { DossierPermisBatir, ConstructDossierPermis } from '../../../../Core/Model/Permis/DossierPermis';
import { StatutDossier }        from '../../../../Core/Model/Permis/StatutDossier';
import { PlanExecution }        from '../../../../Core/Model/Permis/PlanExecution';

/* ══════════════════════════════════════════════════════════════
   Toast
══════════════════════════════════════════════════════════════ */
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast {
  id      : number;
  type    : ToastType;
  title   : string;
  message : string;
  duration: number;
}

/* ══════════════════════════════════════════════════════════════
   Composant CRUD — Permis de Bâtir (côté plateforme / agent)
══════════════════════════════════════════════════════════════ */
@Component({
  selector    : 'app-permis-batir',
  standalone  : true,
  imports     : [CommonModule, ReactiveFormsModule],
  templateUrl : './permis-batir.html',
  styleUrl    : './permis-batir.css',
})
export class PermisBatir {

  idMairie = signal<number>(0);

  constructor() {
    const idStored = localStorage.getItem('etablissement');
    this.idMairie.set(idStored ? parseInt(idStored) : 0);
    this.chargerDossiers();
    this.chargerStatuts();
    

  }

  private fb            = inject(FormBuilder);
  private permisService = inject(PermisService);

  /* ── Données ──────────────────────────────────────────────── */
  listDossiers   = signal<DossierPermisBatir[]>([]);
  listStatuts    = signal<StatutDossier[]>([]);
  enChargement   = signal<boolean>(false);

  /* ── Recherche & pagination ───────────────────────────────── */
  recherche      = signal<string>('');
  pageCourante   = signal<number>(1);
  readonly PAR_PAGE = 10;

  dossiersFiltres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    if (!q) return this.listDossiers();
    return this.listDossiers().filter(d =>
      d.numeroDossier?.toLowerCase().includes(q) ||
      d.demandeur?.nom?.toLowerCase().includes(q) ||
      d.demandeur?.prenom?.toLowerCase().includes(q) ||
      d.raison?.toLowerCase().includes(q)
    );
  });

  dossiersPage = computed(() => {
    const debut = (this.pageCourante() - 1) * this.PAR_PAGE;
    return this.dossiersFiltres().slice(debut, debut + this.PAR_PAGE);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.dossiersFiltres().length / this.PAR_PAGE))
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  onRecherche(event: Event): void {
    this.recherche.set((event.target as HTMLInputElement).value);
    this.pageCourante.set(1);
  }

  allerPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.pageCourante.set(p);
  }

  /* ── Stats ────────────────────────────────────────────────── */
  statTotal      = computed(() => this.listDossiers().length);
  statEvaluation = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule === 'EN EVALUATION').length);
  statValide     = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule === 'VALIDE').length);
  statRejete     = computed(() =>
    this.listDossiers().filter(d => d.statut?.intitule === 'REJETE').length);

  dossiersRecents = computed(() =>
    [...this.listDossiers()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  );

  /* ── Toasts ───────────────────────────────────────────────── */
  toasts = signal<Toast[]>([]);
  private _toastCounter = 0;

  afficherToast(type: ToastType, title: string, message: string, duration = 5000): void {
    const id = ++this._toastCounter;
    this.toasts.update(l => [...l, { id, type, title, message, duration }]);
    if (duration > 0) setTimeout(() => this.fermerToast(id), duration);
  }

  fermerToast(id: number): void {
    this.toasts.update(l => l.filter(t => t.id !== id));
  }

  /* ── Helper statut badge ──────────────────────────────────── */
  classeBadge(statut: StatutDossier | undefined): string {
    switch (statut?.intitule) {
      case 'EN EVALUATION': return 'badge-evaluation';
      case 'VALIDE'       : return 'badge-valide';
      case 'REJETE'       : return 'badge-rejete';
      default             : return 'badge-default';
    }
  }

  /* ── Chargement liste ─────────────────────────────────────── */
  chargerDossiers(): void {
    this.enChargement.set(true);
    this.permisService.findAllDossierPermisByMairie(this.idMairie()).subscribe({
      next : (data: DossierPermisBatir[]) => {
        this.listDossiers.set(data);
        this.enChargement.set(false);
      },
      error: () => {
        this.enChargement.set(false);
        this.afficherToast('error', 'Erreur de chargement',
          'Impossible de charger les dossiers.', 6000);
      },
    });
  }

  chargerStatuts(): void {
    // this.permisService.findAllStatutDossier().subscribe({
    //   next : (data: StatutDossier[]) => this.listStatuts.set(data),
    //   error: () => console.error('Erreur chargement statuts'),
    // });
  }

  /* ══════════════════════════════════════════════════════════
     MODAL VOIR
  ══════════════════════════════════════════════════════════ */
  dossierVoir       = signal<ConstructDossierPermis | null>(null);
  modalVoirOuvert   = signal<boolean>(false);
  chargementDetail  = signal<boolean>(false);

  ouvrirModalVoir(dossier: DossierPermisBatir): void {
    this.modalVoirOuvert.set(true);
    this.chargementDetail.set(true);
    this.dossierVoir.set(null);


     this.permisService.getPlanExecutionByDossier(dossier.id).subscribe({
      next: (data:PlanExecution[])=>{
          const dp : ConstructDossierPermis = {
            dossier: dossier, 
            plans: data,
            statut : dossier.statut
          }

          this.dossierVoir.set(dp); 

          this.chargementDetail.set(false); 
      }
     }); 
    
    // this.permisService.findDossierPermisById(dossier.id).subscribe({
    //   next : (data: ConstructDossierPermis) => {
    //     this.dossierVoir.set(data);
    //     this.chargementDetail.set(false);
    //   },
    //   error: () => {
    //     this.chargementDetail.set(false);
    //     this.afficherToast('error', 'Erreur', 'Impossible de charger le détail.', 5000);
    //     this.modalVoirOuvert.set(false);
    //   },
    // });
  }

  fermerModalVoir(): void {
    this.modalVoirOuvert.set(false);
    this.dossierVoir.set(null);
  }

  /* ══════════════════════════════════════════════════════════
     MODAL ÉDITION (changement de statut)
  ══════════════════════════════════════════════════════════ */
  dossierEdition    = signal<DossierPermisBatir | null>(null);
  modalEditOuvert   = signal<boolean>(false);
  enCoursEdit       = signal<boolean>(false);

  editFb: FormGroup = this.fb.group({
    statutId: new FormControl<number | null>(null, Validators.required),
    note    : new FormControl<string>(''),
  });

  ouvrirModalEdit(dossier: DossierPermisBatir): void {
    this.dossierEdition.set(dossier);
    this.editFb.patchValue({
      statutId: dossier.statut?.id ?? null,
      note    : '',
    });
    this.modalEditOuvert.set(true);
  }

  fermerModalEdit(): void {
    this.modalEditOuvert.set(false);
    this.dossierEdition.set(null);
    this.editFb.reset();
  }

  enregistrerStatut(): void {
    const dossier = this.dossierEdition();
    if (!dossier || this.editFb.invalid) return;

    this.enCoursEdit.set(true);
    const { statutId, note } = this.editFb.value;

    // this.permisService.changerStatutDossier(dossier.id, statutId, note).subscribe({
    //   next: (reponse: ServerResponse) => {
    //     this.enCoursEdit.set(false);
    //     if (reponse.status) {
    //       this.afficherToast('success', 'Statut mis à jour',
    //         reponse.message || 'Le statut a bien été modifié.', 6000);
    //       this.fermerModalEdit();
    //       this.chargerDossiers();
    //     } else {
    //       this.afficherToast('error', 'Échec', reponse.message || 'Une erreur est survenue.', 6000);
    //     }
    //   },
    //   error: (err: any) => {
    //     this.enCoursEdit.set(false);
    //     this.afficherToast('error', 'Erreur',
    //       err?.error?.message ?? 'Une erreur est survenue.', 6000);
    //   },
    // });
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  paginationInfo = computed(() => {
    const debut = (this.pageCourante() - 1) * this.PAR_PAGE;
    const fin   = Math.min(this.pageCourante() * this.PAR_PAGE, this.dossiersFiltres().length);
    return `${debut + 1} – ${fin} sur ${this.dossiersFiltres().length} résultats`;
  });
  /* ══════════════════════════════════════════════════════════
     MODAL SUPPRESSION
  ══════════════════════════════════════════════════════════ */
  dossierSupprimer   = signal<DossierPermisBatir | null>(null);
  modalSuppOuvert    = signal<boolean>(false);
  enCoursSuppr       = signal<boolean>(false);

  ouvrirModalSuppr(dossier: DossierPermisBatir): void {
    this.dossierSupprimer.set(dossier);
    this.modalSuppOuvert.set(true);
  }

  fermerModalSuppr(): void {
    this.modalSuppOuvert.set(false);
    this.dossierSupprimer.set(null);
  }

  confirmerSuppression(): void {
    const dossier = this.dossierSupprimer();
    if (!dossier) return;

    this.enCoursSuppr.set(true);
    this.permisService.deleteDossierPermis(dossier.id).subscribe({
      next: (reponse: ServerResponse) => {
        this.enCoursSuppr.set(false);
        if (reponse.status) {
          this.afficherToast('success', 'Dossier supprimé',
            reponse.message || `Le dossier ${dossier.numeroDossier} a été supprimé.`, 6000);
          this.fermerModalSuppr();
          this.chargerDossiers();
        } else {
          this.afficherToast('error', 'Échec', reponse.message || 'Une erreur est survenue.', 6000);
        }
      },
      error: (err: any) => {
        this.enCoursSuppr.set(false);
        this.afficherToast('error', 'Erreur',
          err?.error?.message ?? 'Une erreur est survenue.', 6000);
      },
    });
  }

  /* ── Formatage date ───────────────────────────────────────── */
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }
}