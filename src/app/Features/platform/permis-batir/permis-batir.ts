import {
  Component,
  signal,
  computed,
  effect,
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
import { PermisService } from '../../../Core/Service/Permis/permis-service';
import { ServerResponse } from '../../../Core/Model/Server/ServerResponse';

/** Représente un plan d'exécution en attente d'envoi */
interface PlanExecutionEntry {
  file: File;
  typePlanId: number;
  preview: string; // nom affiché
}

@Component({
  selector: 'app-permis-batir',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permis-batir.html',
  styleUrl: './permis-batir.css',
})
export class PermisBatir {

  // ── Injection ──────────────────────────────────────────────────────────
  private fb             = inject(FormBuilder);
  private permisService  = inject(PermisService);

  // ── Formulaire réactif ─────────────────────────────────────────────────
  dossierPermisFb: FormGroup = this.fb.group({
    // Identité du demandeur
    nom          : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    prenom       : new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    telephone    : new FormControl<string>('', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]),
    email        : new FormControl<string>('', [Validators.required, Validators.email]),
    // Informations dossier
    raison       : new FormControl<string>('', Validators.required),
    raisonSociale: new FormControl<string>(''),
    mairieId     : new FormControl<number | null>(null, Validators.required),
  });

  // ── Signaux — fichiers uniques ─────────────────────────────────────────
  demandeTimbre        = signal<File | null>(null);
  certificatUrbanisme  = signal<File | null>(null);
  certificatPropriete  = signal<File | null>(null);
  devis                = signal<File | null>(null);
  planMasse            = signal<File | null>(null);
  planSituationTerrain = signal<File | null>(null);
  cni                  = signal<File | null>(null);

  // ── Signaux — plans d'exécution (multiple) ─────────────────────────────
  plansExecution = signal<PlanExecutionEntry[]>([]);

  // Saisie temporaire pour ajouter un plan (fichier + type)
  planEnCours        = signal<File | null>(null);
  typePlanIdEnCours  = signal<number | null>(null);

  // ── Signaux — état UI ──────────────────────────────────────────────────
  enCoursEnvoi  = signal<boolean>(false);
  messageRetour = signal<string>('');
  estSucces     = signal<boolean>(false);
  etapeActive   = signal<number>(1);

  // ── Signaux — mode édition ─────────────────────────────────────────────
  modeEdition    = signal<boolean>(false);
  dossierEditId  = signal<number | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────

  /** Indique si le formulaire peut être soumis */
  formulaireValide = computed(() =>
    this.dossierPermisFb.valid && !this.enCoursEnvoi()
  );

  /** Nombre de plans d'exécution ajoutés */
  nombrePlans = computed(() => this.plansExecution().length);

  /** Libellé du bouton de soumission */
  libelleAction = computed(() => {
    if (this.enCoursEnvoi()) return 'Envoi en cours…';
    return this.modeEdition() ? 'Mettre à jour le dossier' : 'Soumettre le dossier';
  });

  // ── Effect — log de debug (à retirer en prod) ──────────────────────────
  constructor() {
    effect(() => {
      if (this.messageRetour()) {
        // Auto-effacement du message après 6 secondes
        setTimeout(() => this.messageRetour.set(''), 6000);
      }
    });
  }

  // ── Handlers — fichiers uniques ────────────────────────────────────────

  onFileChange(
    event: Event,
    cible: 'demandeTimbre' | 'certificatUrbanisme' | 'certificatPropriete' |
           'devis' | 'planMasse' | 'planSituationTerrain' | 'cni'
  ): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0] ?? null;
    this[cible].set(fichier);
  }

  // ── Handlers — plans d'exécution ───────────────────────────────────────

  onPlanFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.planEnCours.set(input.files?.[0] ?? null);
  }

  onTypePlanChange(typePlanId: number): void {
    this.typePlanIdEnCours.set(typePlanId);
  }

  /** Ajoute le plan en cours à la liste */
  ajouterPlan(): void {
    const fichier = this.planEnCours();
    const typeId  = this.typePlanIdEnCours();

    if (!fichier || typeId === null) return;

    this.plansExecution.update(plans => [
      ...plans,
      { file: fichier, typePlanId: typeId, preview: fichier.name },
    ]);

    // Réinitialise la saisie en cours
    this.planEnCours.set(null);
    this.typePlanIdEnCours.set(null);
  }

  /** Supprime un plan de la liste par son index */
  supprimerPlan(index: number): void {
    this.plansExecution.update(plans => plans.filter((_, i) => i !== index));
  }

  // ── Construction du FormData ───────────────────────────────────────────

  private construireFormData(): FormData {
    const fd = new FormData();

    // Partie JSON « dossier »
    const valeurs = this.dossierPermisFb.value;
    const dossierDto = {
      nom          : valeurs.nom,
      prenom       : valeurs.prenom,
      telephone    : valeurs.telephone,
      email        : valeurs.email,
      raison       : valeurs.raison,
      raisonSociale: valeurs.raisonSociale ?? '',
      mairieId     : valeurs.mairieId,
      // typesPlansIds doit correspondre dans l'ordre aux fichiers plansExecution
      typesPlansIds: this.plansExecution().map(p => p.typePlanId),
    };
    fd.append('dossier', JSON.stringify(dossierDto));

    // Pièces justificatives (fichiers optionnels)
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

    // Plans d'exécution (tableau de fichiers)
    this.plansExecution().forEach(plan => {
      fd.append('plansExecution', plan.file, plan.file.name);
    });

    return fd;
  }

  // ── Soumission ─────────────────────────────────────────────────────────

  soumettreDossier(): void {
    if (!this.formulaireValide()) {
      this.dossierPermisFb.markAllAsTouched();
      return;
    }

    this.enCoursEnvoi.set(true);
    this.messageRetour.set('');

    const formData = this.construireFormData();

    const requete$ = this.modeEdition() && this.dossierEditId() !== null
      ? this.permisService.updateDossierPermis(formData)
      : this.permisService.creationDossierPermis(formData);

    requete$.subscribe({
      next: (reponse: ServerResponse) => {
        this.enCoursEnvoi.set(false);
        this.estSucces.set(reponse.status);
        this.messageRetour.set(reponse.message);

        if (reponse.status) {
          this.reinitialiserFormulaire();
        }
      },
      error: (err) => {
        this.enCoursEnvoi.set(false);
        this.estSucces.set(false);
        this.messageRetour.set(
          err?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.'
        );
      },
    });
  }

  // ── Mode édition ───────────────────────────────────────────────────────

  /**
   * Pré-remplit le formulaire pour une mise à jour.
   * Appelle cette méthode depuis le composant parent ou une liste de dossiers.
   */
  chargerDossierPourEdition(dossier: {
    id         : number;
    demandeur  : { nom: string; prenom: string; telephone: string; email: string };
    raison     : string;
    raisonSociale?: string;
    mairie     : { id: number };
  }): void {
    this.modeEdition.set(true);
    this.dossierEditId.set(dossier.id);

    this.dossierPermisFb.patchValue({
      nom          : dossier.demandeur.nom,
      prenom       : dossier.demandeur.prenom,
      telephone    : dossier.demandeur.telephone,
      email        : dossier.demandeur.email,
      raison       : dossier.raison,
      raisonSociale: dossier.raisonSociale ?? '',
      mairieId     : dossier.mairie.id,
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
  }

  // ── Helpers template ───────────────────────────────────────────────────

  /** Retourne true si le champ est invalide et a été touché */
  champInvalide(nomChamp: string): boolean {
    const ctrl = this.dossierPermisFb.get(nomChamp);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  /** Retourne le nom du fichier d'un signal ou un texte par défaut */
  nomFichier(fichier: File | null, defaut = 'Aucun fichier sélectionné'): string {
    return fichier?.name ?? defaut;
  }
}