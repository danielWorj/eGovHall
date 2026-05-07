import { Component, EventEmitter, Output } from '@angular/core';
import { BasicAuthData } from '../../../../Core/Model/Auth/BasicAuthData';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../Core/Service/Auth/auth-service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {

   @Output() statut = new EventEmitter<boolean>();
  authForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,           // ← ajout
    private route: ActivatedRoute     // ← ajout
  ) {
    this.authForm = this.fb.group({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  roleRoutes: Record<number, string> = {
    1: '/admin/home',
    2: '/portail-hopital',
    3: '/admin/mairie-home',
    4: '/admin/citoyen-home',
    
  };

  login(): void {
    this.isLoading = true;

    const formData: FormData = new FormData();
    formData.append('auth', JSON.stringify(this.authForm.value));

    console.log('Données du formulaire:', this.authForm.value);


    this.authService.login(formData).subscribe({
      next: (data: BasicAuthData) => {
        this.isLoading = false;
        if (data.id != 0) {
          console.log('Connexion réussie', data);
          this.statut.emit(true);
          localStorage.setItem('id', `${data.id}`);
          localStorage.setItem('role', `${data.role}`);
          localStorage.setItem('etablissement', `${data.etablissement}`);

          console.log('Données stockées dans localStorage:', {
            id: localStorage.getItem('id'),
            role: localStorage.getItem('role'),
            etablissement: localStorage.getItem('etablissement')
          });
          // ← Lecture du returnUrl + sécurité Open Redirect
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          console.log('Return URL:', returnUrl);
          const defaultRoute = this.roleRoutes[data.role] ?? '/landing-page';
          const safeUrl = returnUrl?.startsWith('/') ? returnUrl : defaultRoute;
          this.router.navigateByUrl(safeUrl);
        }
      },
      error: (err:any) => {
        this.isLoading = false;
        console.error('Erreur de connexion', err);
      }
    });
  }

}
