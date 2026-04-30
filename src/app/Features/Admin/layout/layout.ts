import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-layout',
  imports: [],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  role=signal<number>(0); 
  constructor(){
    this.role.set(0);
    //this.role.set(parseInt(sessionStorage.getItem("role")!));
  }

}
