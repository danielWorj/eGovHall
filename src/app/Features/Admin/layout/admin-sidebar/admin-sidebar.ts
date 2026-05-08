import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  role = signal<number>(0); 

  constructor(){
    this.role.set(localStorage.getItem('role') ? parseInt(localStorage.getItem('role')!) : 0);
    console.log('Rôle récupéré du localStorage:', this.role());
   // this.role.set(3); //pour les tests, à remplacer par la récupération du rôle de l'utilisateur connecté
  }

  
}
