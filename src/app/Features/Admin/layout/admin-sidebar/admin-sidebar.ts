import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive }    from '@angular/router';
import { CommonModule }                    from '@angular/common';

@Component({
  selector    : 'app-admin-sidebar',
  standalone  : true,
  imports     : [CommonModule, RouterLink, RouterLinkActive],
  templateUrl : './admin-sidebar.html',
  styleUrl    : './admin-sidebar.css',
})
export class AdminSidebar {

  role           = signal<number>(0);
  sidebarOuverte = signal<boolean>(false);

  constructor() {
    const roleStocke = localStorage.getItem('role');
    this.role.set(roleStocke ? parseInt(roleStocke, 10) : 0);
  }

  toggleSidebar(): void {
    this.sidebarOuverte.update(v => !v);
  }

  fermerSidebar(): void {
    this.sidebarOuverte.set(false);
  }

  /** Ferme la sidebar avec la touche Échap */
  @HostListener('document:keydown.escape')
  onEchap(): void {
    this.fermerSidebar();
  }
}