import { Component, EventEmitter, Output } from '@angular/core';
import { BasicAuthData } from '../../../../Core/Model/Auth/BasicAuthData';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../Core/Service/Auth/auth-service';
import { Router,ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
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
    1: '/super/user-structure',
    2: '/portail-hopital',
    3: '/mairie/home',
    4: '/admin/citoyen-home',
    
  };

 login(): void {
  if (this.authForm.invalid) return;
  this.isLoading = true;

  this.authService.login(this.authForm.value).subscribe({
    next: () => {
      this.isLoading = false;
      this.statut.emit(true);

      console.log('Connexion réussie');
      console.log('Token:', this.authService.getToken());
      console.log('ID:', localStorage.getItem('id'));
      console.log('Role:', localStorage.getItem('role'));
      console.log('Établissement:', localStorage.getItem('etablissement'));

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const role = Number(localStorage.getItem('role'));
      const defaultRoute = this.roleRoutes[role] ?? '/landing-page';
      const safeUrl = returnUrl?.startsWith('/') ? returnUrl : defaultRoute;

      this.router.navigateByUrl(safeUrl);
    },
    error: (err: any) => {
      this.isLoading = false;
      console.error('Erreur de connexion', err);
    }
  });
}
}
