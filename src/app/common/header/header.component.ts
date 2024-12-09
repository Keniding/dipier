import { Component } from '@angular/core';
import {Router, Routes} from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private router: Router
  ) {
  }

  miPerfil() {
    this.router.navigate(['/mi-perfil']).then(r =>
       console.log(r),
    )
  }
}
