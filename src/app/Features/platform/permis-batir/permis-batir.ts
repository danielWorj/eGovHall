import {
  Component,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PermisService } from '../../../Core/Service/Permis/permis-service';
import { ServerResponse } from '../../../Core/Model/Server/ServerResponse';
import { TypePlan } from '../../../Core/Model/Permis/TypePlan';

interface PlanExecutionEntry {
  file: File;
  typePlanId: number;
  preview: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number; // ms, 0 = persistant
}

@Component({
  selector: 'app-permis-batir',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permis-batir.html',
  styleUrl: './permis-batir.css',
})
export class PermisBatir {
  //
  //
  // PERMIS BATIR COTE PLATEFORME POUR LE PORTAIL DU SITE 
  //
  //
  //
    private platformId = inject(PLATFORM_ID);


   constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.getAllTypePlan();
    }
  }

  private fb            = inject(FormBuilder);
  private permisService = inject(PermisService);

  // ── Formulaire ─────────────────────────────────────────────────────────
  dossierPermisFb: FormGroup = this.fb.group({
    nom      : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    prenom   : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    telephone: new FormControl<string>('', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]),
    email    : new FormControl<string>('', [Validators.required, Validators.email]),
    raison   : new FormControl<string>('', Validators.required),
    mairieId : new FormControl<number | null>(null, Validators.required),
  });

  // ── Fichiers uniques ───────────────────────────────────────────────────
  demandeTimbre        = signal<File | null>(null);
  certificatUrbanisme  = signal<File | null>(null);
  certificatPropriete  = signal<File | null>(null);
  devis                = signal<File | null>(null);
  planMasse            = signal<File | null>(null);
  planSituationTerrain = signal<File | null>(null);
  cni                  = signal<File | null>(null);

  // ── Plans d'exécution ──────────────────────────────────────────────────
  plansExecution    = signal<PlanExecutionEntry[]>([]);
  planEnCours       = signal<File | null>(null);
  typePlanIdEnCours = signal<number | null>(null);

  // ── État UI ────────────────────────────────────────────────────────────
  enCoursEnvoi             = signal<boolean>(false);
  messageRetour            = signal<string>('');
  estSucces                = signal<boolean>(false);
  etapeActive              = signal<number>(1);
  declarationHonneurCochee = signal<boolean>(false);

  // ── Toasts ─────────────────────────────────────────────────────────────
  toasts   = signal<Toast[]>([]);
  private _toastCounter = 0;

  afficherToast(
    type: ToastType,
    title: string,
    message: string,
    duration = 5000
  ): void {
    const id = ++this._toastCounter;
    this.toasts.update(list => [...list, { id, type, title, message, duration }]);
    if (duration > 0) {
      setTimeout(() => this.fermerToast(id), duration);
    }
  }

  fermerToast(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  // ── Mode édition ───────────────────────────────────────────────────────
  modeEdition   = signal<boolean>(false);
  dossierEditId = signal<number | null>(null);

  // ── Helpers template ───────────────────────────────────────────────────

  get nombrePlans(): number {
    return this.plansExecution().length;
  }

  get libelleAction(): string {
    if (this.enCoursEnvoi()) return 'Envoi en cours…';
    return this.modeEdition() ? 'Mettre à jour le dossier' : 'Soumettre le dossier';
  }

  champInvalide(nomChamp: string): boolean {
    const ctrl = this.dossierPermisFb.get(nomChamp);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  nomFichier(fichier: File | null, defaut = 'Aucun fichier sélectionné'): string {
    return fichier?.name ?? defaut;
  }

  // ── Handlers fichiers uniques ──────────────────────────────────────────

  onFileChange(
    event: Event,
    cible: 'demandeTimbre' | 'certificatUrbanisme' | 'certificatPropriete' |
           'devis' | 'planMasse' | 'planSituationTerrain' | 'cni'
  ): void {
    const input = event.target as HTMLInputElement;
    this[cible].set(input.files?.[0] ?? null);
  }

  // ── Handlers plans d'exécution ─────────────────────────────────────────

  onPlanFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.planEnCours.set(input.files?.[0] ?? null);
  }

  onTypePlanChange(typePlanId: number): void {
    this.typePlanIdEnCours.set(+typePlanId);
  }

  ajouterPlan(): void {
    const fichier = this.planEnCours();
    const typeId  = this.typePlanIdEnCours();
    if (!fichier || typeId === null || typeId === 0) return;

    this.plansExecution.update(plans => [
      ...plans,
      { file: fichier, typePlanId: typeId, preview: fichier.name },
    ]);
    this.planEnCours.set(null);
    this.typePlanIdEnCours.set(null);
  }

  supprimerPlan(index: number): void {
    this.plansExecution.update(plans => plans.filter((_, i) => i !== index));
  }

  listTypePlan = signal<TypePlan[]>([]);
  getAllTypePlan(){
    this.permisService.findAllTypePlan().subscribe({
      next:(data:TypePlan[])=>{
        this.listTypePlan.set(data); 
      }, 
      error:()=>{
        console.log('List type de plan'); 
      }
    })
  }

  // ── Validation simple ──────────────────────────────────────────────────

  /**
   * Vérifie chaque champ manuellement.
   * Retourne le premier message d'erreur trouvé, ou null si tout est valide.
   */
  private validerFormulaire(): string | null {
    const v = this.dossierPermisFb.value;

    if (!v.nom || v.nom.trim().length < 2)
      return 'Le nom est requis (minimum 2 caractères).';

    if (!v.prenom || v.prenom.trim().length < 2)
      return 'Le prénom est requis (minimum 2 caractères).';

    if (!v.telephone || !/^\+?[0-9]{8,15}$/.test(v.telephone.trim()))
      return 'Le numéro de téléphone est invalide (8 à 15 chiffres).';

    if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
      return 'L\'adresse email est invalide.';

    if (!v.raison || v.raison.trim().length === 0)
      return 'La description du projet est requise.';

    if (!v.mairieId)
      return 'Veuillez sélectionner une mairie.';

    if (!this.declarationHonneurCochee())
      return 'Vous devez cocher la déclaration sur l\'honneur.';

    return null;
  }

  // ── Soumission ─────────────────────────────────────────────────────────

  soumettreDossier(): void {
    // Validation simple
    const erreur = this.validerFormulaire();
    if (erreur) {
      this.afficherToast('warning', 'Formulaire incomplet', erreur, 7000);
      return;
    }

    this.enCoursEnvoi.set(true);
    this.messageRetour.set('');
    this.afficherToast('info', 'Envoi en cours…', 'Votre dossier est en cours de transmission. Veuillez patienter.', 0);

    const formData = this.construireFormData();

    const requete$ = this.modeEdition() && this.dossierEditId() !== null
      ? this.permisService.updateDossierPermis(formData)
      : this.permisService.creationDossierPermis(formData);

    requete$.subscribe({
      next: (reponse: ServerResponse) => {
        this.enCoursEnvoi.set(false);
        this.estSucces.set(reponse.status);
        this.messageRetour.set(reponse.message);
        // Ferme le toast "Envoi en cours"
        this.toasts.update(list => list.filter(t => t.type !== 'info'));

        if (reponse.status) {
          const action = this.modeEdition() ? 'mis à jour' : 'soumis';
          this.afficherToast(
            'success',
            `Dossier ${action} avec succès`,
            reponse.message || `Votre dossier de permis de bâtir a bien été ${action}.`,
            8000
          );
          this.reinitialiserFormulaire();
        } else {
          this.afficherToast('error', 'Échec de la soumission', reponse.message || 'Une erreur est survenue.', 8000);
        }
        setTimeout(() => this.messageRetour.set(''), 6000);
      },
      error: (err) => {
        this.enCoursEnvoi.set(false);
        this.estSucces.set(false);
        // Ferme le toast "Envoi en cours"
        this.toasts.update(list => list.filter(t => t.type !== 'info'));

        const msg = err?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
        this.messageRetour.set(msg);
        this.afficherToast('error', 'Erreur de connexion', msg, 8000);
        setTimeout(() => this.messageRetour.set(''), 6000);
      },
    });
  }

  // ── Construction FormData ──────────────────────────────────────────────

  private construireFormData(): FormData {
    const fd = new FormData();
    const v  = this.dossierPermisFb.value;

    const dossierDto = {
      nom          : v.nom.trim(),
      prenom       : v.prenom.trim(),
      telephone    : v.telephone.trim(),
      email        : v.email.trim(),
      raison       : v.raison.trim(),
      mairieId     : v.mairieId,
      typesPlansIds: this.plansExecution().map(p => p.typePlanId),
    };
    fd.append('dossier', JSON.stringify(dossierDto));

    const ajouterFichier = (cle: string, fichier: File | null) => {
      if (fichier) fd.append(cle, fichier, fichier.name);
    };

    ajouterFichier('demandeTimbre',        this.demandeTimbre());
    ajouterFichier('certificatUrbanisme',  this.certificatUrbanisme());
    ajouterFichier('certificatPropriete',  this.certificatPropriete());
    ajouterFichier('devis',                this.devis());
    ajouterFichier('planMasse',            this.planMasse());
    ajouterFichier('planSituationTerrain', this.planSituationTerrain());
    ajouterFichier('cni',                  this.cni());

    this.plansExecution().forEach(plan => {
      fd.append('plansExecution', plan.file, plan.file.name);
    });

    return fd;
  }

  // ── Mode édition ───────────────────────────────────────────────────────

  chargerDossierPourEdition(dossier: {
    id       : number;
    demandeur: { nom: string; prenom: string; telephone: string; email: string };
    raison   : string;
    mairie   : { id: number };
  }): void {
    this.modeEdition.set(true);
    this.dossierEditId.set(dossier.id);
    this.dossierPermisFb.patchValue({
      nom      : dossier.demandeur.nom,
      prenom   : dossier.demandeur.prenom,
      telephone: dossier.demandeur.telephone,
      email    : dossier.demandeur.email,
      raison   : dossier.raison,
      mairieId : dossier.mairie.id,
    });
  }

  // ── Réinitialisation ───────────────────────────────────────────────────

  reinitialiserFormulaire(): void {
    this.dossierPermisFb.reset();
    this.demandeTimbre.set(null);
    this.certificatUrbanisme.set(null);
    this.certificatPropriete.set(null);
    this.devis.set(null);
    this.planMasse.set(null);
    this.planSituationTerrain.set(null);
    this.cni.set(null);
    this.plansExecution.set([]);
    this.planEnCours.set(null);
    this.typePlanIdEnCours.set(null);
    this.modeEdition.set(false);
    this.dossierEditId.set(null);
    this.declarationHonneurCochee.set(false);
  }
}