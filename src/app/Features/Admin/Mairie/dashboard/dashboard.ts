import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/* ══════════════════════════════════════════════════════════════
   Modèles légers (inline — à remplacer par vos vrais modèles)
══════════════════════════════════════════════════════════════ */
export interface ActiviteItem {
  id:      number;
  type:    'naissance' | 'permis' | 'paiement' | 'alerte' | 'rdv';
  titre:   string;
  detail:  string;
  temps:   string;
}

export interface DossierRepartition {
  label:   string;
  valeur:  number;
  total:   number;
  couleur: string;
}

/* ══════════════════════════════════════════════════════════════
   Composant Dashboard
══════════════════════════════════════════════════════════════ */
@Component({
  selector   : 'app-dashboard',
  standalone : true,
  imports    : [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl   : './dashboard.css',
})
export class Dashboard implements OnInit {

  /* ── Identité agent ───────────────────────────────────────── */
  nomAgent   = signal<string>('Agent');
  idMairie   = signal<number>(0);
  dateJour   = signal<string>('');

  /* ── KPI ──────────────────────────────────────────────────── */
  kpiAttenteTotal   = signal<number>(0);
  kpiUrgents        = signal<number>(0);
  kpiRdvAujourdhui  = signal<number>(0);
  kpiTraitesMois    = signal<number>(0);
  kpiTendance       = signal<string>('+0%');

  /* ── Actes de naissance ───────────────────────────────────── */
  totalNaissances   = signal<number>(0);
  naissancesOct     = signal<number>(0); // Mois courant
  naissancesPct     = computed(() =>
    this.totalNaissances() > 0
      ? Math.round((this.naissancesOct() / this.totalNaissances()) * 100)
      : 0
  );

  /* ── Permis de bâtir ──────────────────────────────────────── */
  totalPermis       = signal<number>(0);
  permisValides     = signal<number>(0);
  permisEvaluation  = signal<number>(0);
  permisRejetes     = signal<number>(0);
  permisPct         = computed(() =>
    this.totalPermis() > 0
      ? Math.round((this.permisValides() / this.totalPermis()) * 100)
      : 0
  );

  /* ── Actes de mariage ─────────────────────────────────────── */
  totalMariages     = signal<number>(0);
  mariagesPct       = computed(() => {
    const total = this.totalNaissances() + this.totalPermis() + this.totalMariages();
    return total > 0 ? Math.round((this.totalMariages() / total) * 100) : 0;
  });

  /* ── Documents archivés ───────────────────────────────────── */
  totalDocuments    = signal<number>(0);
  totalChunks       = signal<number>(0);

  /* ── Répartition barre ────────────────────────────────────── */
  repartitionTotal = computed(() =>
    this.totalNaissances() + this.totalPermis() + this.totalMariages()
  );

  repartition = computed<DossierRepartition[]>(() => {
    const tot = this.repartitionTotal() || 1;
    return [
      {
        label  : 'Actes de naissance',
        valeur : this.totalNaissances(),
        total  : tot,
        couleur: 'var(--primary)',
      },
      {
        label  : 'Permis de bâtir',
        valeur : this.totalPermis(),
        total  : tot,
        couleur: 'var(--gold)',
      },
      {
        label  : 'Actes de mariage',
        valeur : this.totalMariages(),
        total  : tot,
        couleur: '#198754',
      },
    ];
  });

  /* ── Activité récente ─────────────────────────────────────── */
  activites = signal<ActiviteItem[]>([]);
  chargement = signal<boolean>(false);

  /* ── Lifecycle ────────────────────────────────────────────── */
  ngOnInit(): void {
    const idStored = localStorage.getItem('etablissement');
    this.idMairie.set(idStored ? parseInt(idStored, 10) : 0);

    const nomStored = localStorage.getItem('nomAgent') ?? 'Agent';
    this.nomAgent.set(nomStored);

    this.dateJour.set(
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    );

    this.chargerDonnees();
  }

  /* ── Chargement ───────────────────────────────────────────── */
  chargerDonnees(): void {
    this.chargement.set(true);

    // Simulation des données — remplacez par vos appels de services
    // Ex : forkJoin([this.acteService.stats(), this.permisService.stats(), ...])
    setTimeout(() => {
      // KPI
      this.kpiAttenteTotal.set(23);
      this.kpiUrgents.set(6);
      this.kpiRdvAujourdhui.set(8);
      this.kpiTraitesMois.set(147);
      this.kpiTendance.set('+18%');

      // Modules
      this.totalNaissances.set(62);
      this.naissancesOct.set(18);

      this.totalPermis.set(51);
      this.permisValides.set(28);
      this.permisEvaluation.set(16);
      this.permisRejetes.set(7);

      this.totalMariages.set(34);

      this.totalDocuments.set(12);
      this.totalChunks.set(348);

      // Activités
      this.activites.set([
        {
          id    : 1,
          type  : 'naissance',
          titre : 'Nouvelle déclaration naissance',
          detail: 'Hôpital Général de Douala · Enfant : Marie Fotso · DCL-2026-0093',
          temps : 'Il y a 12 min',
        },
        {
          id    : 2,
          type  : 'permis',
          titre : 'Permis accordé — PB-2026-0010',
          detail: 'Construction immeuble R+3, Bonanjo',
          temps : 'Il y a 45 min',
        },
        {
          id    : 3,
          type  : 'paiement',
          titre : 'Paiement reçu — 5 000 XAF (MTN MoMo)',
          detail: 'Dossier DCL-2026-0087',
          temps : 'Il y a 1h 20min',
        },
        {
          id    : 4,
          type  : 'alerte',
          titre : 'Pièce complémentaire requise — MAR-2026-0005',
          detail: 'Dossier mariage incomplet : CNI manquante',
          temps : 'Il y a 2h 05min',
        },
        {
          id    : 5,
          type  : 'rdv',
          titre : 'RDV planifié — Remise permis PB-2026-0009',
          detail: 'Lundi 4 mai 2026, 09h00',
          temps : 'Il y a 3h 30min',
        },
      ]);

      this.chargement.set(false);
    }, 0);
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  iconActivite(type: ActiviteItem['type']): string {
    const map: Record<ActiviteItem['type'], string> = {
      naissance: 'bi-file-earmark-plus',
      permis   : 'bi-check-lg',
      paiement : 'bi-credit-card',
      alerte   : 'bi-x-circle',
      rdv      : 'bi-calendar-plus',
    };
    return map[type] ?? 'bi-dot';
  }

  couleurActivite(type: ActiviteItem['type']): string {
    const map: Record<ActiviteItem['type'], string> = {
      naissance: 'blue',
      permis   : 'green',
      paiement : 'orange',
      alerte   : 'red',
      rdv      : 'blue',
    };
    return map[type] ?? 'blue';
  }

  pctBarre(valeur: number, total: number): string {
    if (!total) return '0%';
    return Math.round((valeur / total) * 100) + '%';
  }
}