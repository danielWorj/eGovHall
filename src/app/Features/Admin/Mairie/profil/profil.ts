import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { UtilisateurService } from '../../../../Core/Service/Utilisateur/utilisateur-service';
import { Utilisateur } from '../../../../Core/Model/Utilisateur/Utilisateur';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profil',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {

  userFb!: FormGroup;
  idUtilisateur  = signal<number>(0);
  utilisateurConneted = signal<Utilisateur | null>(null);
  showPwd   = signal<boolean>(false);
  loading   = signal<boolean>(false);
  successMsg = signal<string>('');
  errorMsg   = signal<string>('');

  private platformId = inject(PLATFORM_ID);

  constructor(
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const idStored = localStorage.getItem('id');
      this.idUtilisateur.set(idStored ? parseInt(idStored) : 0);
    }

    this.userFb = this.fb.group({
      id:        new FormControl(),
      nom:       new FormControl(),
      prenom:    new FormControl(),
      email:     new FormControl(),
      telephone: new FormControl(),
      password:  new FormControl(),
    });
  }

  ngOnInit(): void {
    this.getDataUtilisateur();
  }

  getDataUtilisateur(): void {
    this.utilisateurService.getAllInformationUtilisateur(this.idUtilisateur()).subscribe({
      next: (data) => {
        this.utilisateurConneted.set(data);
        // Pré-remplir le formulaire avec les données existantes
        this.userFb.patchValue({
          id:        data.id,
          nom:       data.nom,
          prenom:    data.prenom,
          email:     data.email,
          telephone: data.telephone,
          password:  '',
        });
      },
      error: () => {
        this.errorMsg.set('Impossible de charger les informations du profil.');
      }
    });
  }

  togglePwd(): void {
    this.showPwd.set(!this.showPwd());
  }

  resetForm(): void {
    const u = this.utilisateurConneted();
    if (!u) return;
    this.userFb.patchValue({ nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone, password: '' });
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  editData(): void {
    this.loading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const payload: any = { ...this.userFb.value };
    // Ne pas envoyer le champ password s'il est vide
    if (!payload.password || payload.password.trim() === '') {
      delete payload.password;
    } else {
      payload.password_hash = payload.password;
      delete payload.password;
    }

    const formData = new FormData();
    formData.append('user', JSON.stringify(payload));

    this.utilisateurService.updateAgent(formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status) {
          this.successMsg.set('Profil mis à jour avec succès.');
          this.getDataUtilisateur(); // Rafraîchir les données affichées
        } else {
          this.errorMsg.set(response.message ?? 'Une erreur est survenue.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Erreur réseau. Veuillez réessayer.');
      }
    });
  }
}