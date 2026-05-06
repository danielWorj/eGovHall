import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { SiteNavbar } from "./site-navbar/site-navbar";
import { SiteFooter } from "./site-footer/site-footer";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SiteNavbar, SiteFooter],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
