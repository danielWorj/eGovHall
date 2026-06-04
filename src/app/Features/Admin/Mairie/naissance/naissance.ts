import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { ActeService } from '../../../../Core/Service/Acte/acte-service';
import { ActeNaissance } from '../../../../Core/Model/Acte/ActeNaissance';
import { Declaration } from '../../../../Core/Model/Acte/Declaration';

@Component({
  selector: 'app-naissance',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './naissance.html',
  styleUrl: './naissance.css',
})
export class Naissance implements AfterViewInit {

  // ── Chart canvas refs ─────────────────────────────────────────────────────
  @ViewChild('chartEvolution') chartEvolutionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSexe')      chartSexeRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('chartHopital')   chartHopitalRef!:   ElementRef<HTMLCanvasElement>;

  private chartEvolution?: Chart;
  private chartSexe?:      Chart;
  private chartHopital?:   Chart;

  // ── Identity ─────────────────────────────────────────────────────────────
  readonly Math = Math;
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

  // ── Fichiers — Création ───────────────────────────────────────────────────
  cniPere:     File | null = null;
  photo4x4Pere: File | null = null;

  cniPereNom      = signal('Aucun fichier sélectionné');
  photo4x4PereNom = signal('Aucun fichier sélectionné');

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

  // ── Chart data computed ───────────────────────────────────────────────────

  /** Évolution mensuelle : { label: 'Jan 2025', count: 4 }[] */
  evolutionData = computed(() => {
    const map = new Map<string, number>();
    this.listActeNaissance().forEach(a => {
      if (!a.date) return;
      const d   = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const fmt = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' });
    return {
      labels: sorted.map(([k]) => fmt.format(new Date(k + '-01'))),
      values: sorted.map(([, v]) => v),
    };
  });

  /** Répartition par sexe : { masculin, feminin, inconnu } */
  sexeData = computed(() => {
    let m = 0, f = 0, inc = 0;
    this.listActeNaissance().forEach(a => {
      const s = (a.declaration?.enfant?.sexe.libelle ?? '').toLowerCase();
      if (s === 'm' || s === 'masculin' || s === 'male')      m++;
      else if (s === 'f' || s === 'feminin' || s === 'female') f++;
      else inc++;
    });
    return { masculin: m, feminin: f, inconnu: inc };
  });

  /** Répartition par hôpital : top 8 */
  hopitalData = computed(() => {
    const map = new Map<string, number>();
    this.listActeNaissance().forEach(a => {
      const nom = a.declaration?.hopital?.nom ?? 'Non renseigné';
      map.set(nom, (map.get(nom) ?? 0) + 1);
    });
    const sorted = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => v) };
  });

  // ── Forms ─────────────────────────────────────────────────────────────────
  acteNaissanceFb!: FormGroup;
  acteEditFb!:      FormGroup;

  constructor(private fb: FormBuilder, private acteService: ActeService) {
    const idStored = localStorage.getItem('etablissement');
    this.idMairie.set(idStored ? parseInt(idStored) : 0);
    this.initForms();
    this.loadPage();
  }

  loadPage(): void {
    this.getAllActe();
    this.getAllDeclarationByMairie();
  }

  ngAfterViewInit(): void {
    // Rendu immédiat dès l'ouverture — même avec données vides
    setTimeout(() => this.buildCharts(), 0);
  }

  private buildCharts(): void {
    this.buildChartEvolution();
    this.buildChartSexe();
    this.buildChartHopital();
  }

  private buildChartEvolution(): void {
    const ref = this.chartEvolutionRef?.nativeElement;
    if (!ref) return;
    this.chartEvolution?.destroy();
    const { labels, values } = this.evolutionData();
    this.chartEvolution = new Chart(ref, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Actes créés',
          data: values,
          fill: true,
          backgroundColor: 'rgba(0,49,137,0.08)',
          borderColor: '#003189',
          borderWidth: 2.5,
          pointBackgroundColor: '#003189',
          pointRadius: 4,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
      },
    });
  }

  private buildChartSexe(): void {
    const ref = this.chartSexeRef?.nativeElement;
    if (!ref) return;
    this.chartSexe?.destroy();
    const { masculin, feminin, inconnu } = this.sexeData();
    const data   = [masculin, feminin, ...(inconnu > 0 ? [inconnu] : [])];
    const labels = ['Masculin', 'Féminin', ...(inconnu > 0 ? ['Non renseigné'] : [])];
    this.chartSexe = new Chart(ref, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#003189', '#e8002d', '#94a3b8'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, boxWidth: 12 } },
        },
      },
    });
  }

  private buildChartHopital(): void {
    const ref = this.chartHopitalRef?.nativeElement;
    if (!ref) return;
    this.chartHopital?.destroy();
    const { labels, values } = this.hopitalData();
    const palette = ['#003189','#0046c0','#1a5fcf','#3d7ddf','#6099e8','#003189','#e8002d','#ff3355'];
    this.chartHopital = new Chart(ref, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Actes',
          data: values,
          backgroundColor: labels.map((_, i) => palette[i % palette.length] + 'cc'),
          borderColor:      labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 1.5,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  // ── Form initialisation ───────────────────────────────────────────────────
  private initForms(): void {
    const pereGroup = () => ({
      nomPere:       new FormControl('', Validators.required),
      prenomPere:    new FormControl('', Validators.required),
      telephonePere: new FormControl('', Validators.required),
      emailPere:     new FormControl('', [Validators.required, Validators.email]),
      profession:     new FormControl('', Validators.required),
      domicile:     new FormControl('', Validators.required),
      dateNaissance:     new FormControl('', Validators.required),
      lieuNaissance:     new FormControl('', Validators.required),
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
        setTimeout(() => this.buildCharts(), 50);
      },
      error: () => {
        this.isLoading.set(false);
        this.notify('error', 'Impossible de charger les actes de naissance.');
      },
    });
  }

  listDeclaration = signal<Declaration[]>([]); 

  getAllDeclarationByMairie(){
    console.log('Get declaration')
    this.acteService.getAllDeclarationByMairie(this.idMairie()).subscribe({
      next:(data:Declaration[])=>{
        console.log('data declaration', data); 
        this.listDeclaration.set(data); 
      }, 
      error:()=>{
        console.log('Get all declaration by mairie'); 
      }
    })
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  openModalAdd(): void {
    this.acteNaissanceFb.reset();
    this.supprimerCniPere();
    this.supprimerPhoto4x4Pere();
    this.showModalAdd.set(true);
  }

  closeModalAdd(): void {
    this.supprimerCniPere();
    this.supprimerPhoto4x4Pere();
    this.showModalAdd.set(false);
  }

  openModalView(acte: ActeNaissance): void {
    this.acteSelected.set(acte);
    this.showModalView.set(true);
  }
  closeModalView(): void { this.showModalView.set(false); }

  openModalEdit(acte: ActeNaissance): void {
    this.acteSelected.set(acte);
    this.acteEditFb.patchValue({
      id:            acte.id          ?? null,
      date:          acte.date        ?? '',
      declaration:   acte.declaration?.id ?? null,
      nomPere:       acte.pere?.nom       ?? '',
      prenomPere:    acte.pere?.prenom    ?? '',
      telephonePere: acte.pere?.telephone ?? '',
      emailPere:     acte.pere?.email     ?? '',
    });
    this.showModalView.set(false);
    this.showModalEdit.set(true);
  }
  closeModalEdit(): void { this.showModalEdit.set(false); }

  // ── Sélection fichiers ────────────────────────────────────────────────────

  onSelectCniPere(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const typesAcceptes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!typesAcceptes.includes(file.type)) {
      this.notify('error', 'CNI : format accepté — JPG, PNG ou PDF uniquement.');
      this.supprimerCniPere();
      return;
    }
    this.cniPere = file;
    this.cniPereNom.set(file.name);
    this.errorMessage.set('');
  }

  onSelectPhoto4x4Pere(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const typesAcceptes = ['image/jpeg', 'image/png'];

    if (!typesAcceptes.includes(file.type)) {
      this.notify('error', 'Photo 4×4 : format accepté — JPG ou PNG uniquement.');
      this.supprimerPhoto4x4Pere();
      return;
    }
    this.photo4x4Pere = file;
    this.photo4x4PereNom.set(file.name);
    this.errorMessage.set('');
  }

  // ── Suppression fichiers ──────────────────────────────────────────────────

  supprimerCniPere(): void {
    this.cniPere = null;
    this.cniPereNom.set('Aucun fichier sélectionné');
  }

  supprimerPhoto4x4Pere(): void {
    this.photo4x4Pere = null;
    this.photo4x4PereNom.set('Aucun fichier sélectionné');
  }

  // ── Validation fichiers ───────────────────────────────────────────────────

  private fichiersValides(): boolean {
    if (!this.cniPere) {
      this.notify('error', 'Veuillez fournir la CNI du père.');
      return false;
    }
    if (!this.photo4x4Pere) {
      this.notify('error', 'Veuillez fournir la photo d\'identité 4×4 du père.');
      return false;
    }
    return true;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  createActe(): void {
  if (this.acteNaissanceFb.invalid) {
    this.acteNaissanceFb.markAllAsTouched();
    return;
  }
  if (!this.fichiersValides()) return;

  this.isSubmitting.set(true);

  // ✅ Même pattern que hopital.ts : on enrichit le DTO avec les typesPiecesJointes
  // 1 = CNI père  |  2 = Photo 4×4 père  (IDs TypePieceDeclaration en base)
  const dto = {
    ...this.acteNaissanceFb.value,
    typesPiecesJointes: [1, 2]
  };

  const formData = new FormData();
  formData.append('acte', JSON.stringify(dto));  // ← dto enrichi, pas .value brut
  formData.append('fichiers', this.cniPere!);
  formData.append('fichiers', this.photo4x4Pere!);

  this.acteService.creationActeNaissance(formData).subscribe({
    next: (res) => {
      this.isSubmitting.set(false);
      if (res.status) {
        this.notify('success', 'Acte de naissance créé avec succès !');
        this.closeModalAdd();
        this.getAllActe();
      } else {
        console.log(res);
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


  downloadActe(acte: ActeNaissance, event: Event): void {
  event.stopPropagation();
  this.acteService.downloadActeNaissance(acte.id!).subscribe({
    next: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acte_naissance_${acte.numeroActe}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    error: () => this.notify('error', 'Erreur lors du téléchargement du PDF.')
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
  private notify(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMessage.set(msg);
      setTimeout(() => this.successMessage.set(''), 4000);
    } else {
      this.errorMessage.set(msg);
      setTimeout(() => this.errorMessage.set(''), 5000);
    }
  }

  ctrl(form: FormGroup, name: string): FormControl {
    return form.get(name) as FormControl;
  }
}