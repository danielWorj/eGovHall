import { Component } from '@angular/core';
import { AdminNavbar }  from './admin-navbar/admin-navbar';
import { AdminSidebar } from './admin-sidebar/admin-sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector    : 'app-layout',
  standalone  : true,
  imports     : [AdminNavbar, AdminSidebar, RouterOutlet],
  templateUrl : './layout.html',
  styleUrl    : './layout.css',
})
export class Layout {}