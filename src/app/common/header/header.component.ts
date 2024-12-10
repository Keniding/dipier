import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import {AuthService} from "../../login/auth/auth.service";
import {UserService} from "../../services/user.service";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    JwtModule
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private jwtHelper = new JwtHelperService();
  userName: string = '';
  userRole: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
  ) {}
  ngOnInit() {
    this.loadUserInfo();
  }

  private getUsername(): string {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.sub;
    }
    return '';
  }

  private async loadUserInfo() {
    try {
      const username = this.getUsername();
      if (!username) {
        throw new Error('No se encontró el nombre de usuario');
      }

      const userData = await firstValueFrom(this.userService.getUserForName(username));
      this.userName = userData.username;
      this.userRole = userData.role;
    } catch (error) {
      console.error('Error al cargar la información del usuario:', error);
    }
  }

  miPerfil() {
    this.router.navigate(['/mi-perfil'])
      .then(() => {
        console.log('Navegación exitosa al perfil');
      })
      .catch(error => {
        console.error('Error en la navegación:', error);
      });
  }
}
