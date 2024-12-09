import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserRequest, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import {FooterComponent} from "../../../common/footer/footer.component";
import {AuthService} from "../../../login/auth/auth.service";
import {Router} from "@angular/router";
import {HeaderComponent} from "../../../common/header/header.component";

type UserRole = 'user' | 'admin';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FooterComponent, HeaderComponent],
  templateUrl: './profile.component.html',
  styles: [`
    .profile-container {
      min-height: calc(100vh - 4rem);
      padding-top: 2rem;
      background-color: #f9fafb;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    input:disabled {
      cursor: not-allowed;
      background-color: #f3f4f6;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  private jwtHelper = new JwtHelperService();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      role: [{ value: '', disabled: true }],
      active: [{ value: false, disabled: true }]
    });
  }

  private getUsername(): string {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.sub;
    }
    return '';
  }

  async ngOnInit() {
    try {
      const username = this.getUsername();
      if (!username) {
        throw new Error('No se encontró el nombre de usuario');
      }

      const userData = await firstValueFrom(this.userService.getUserForName(username));
      this.user = userData;

      this.profileForm.patchValue({
        username: userData.username,
        email: userData.email,
        role: userData.role,
        active: userData.active
      });
    } catch (error) {
      this.errorMessage = 'Error al cargar el perfil';
      console.error('Error:', error);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      const usernameControl = this.profileForm.get('username');
      const emailControl = this.profileForm.get('email');

      if (usernameControl && emailControl) {
        usernameControl.enable();
        emailControl.enable();
      }
    } else {
      const usernameControl = this.profileForm.get('username');
      const emailControl = this.profileForm.get('email');

      if (usernameControl && emailControl) {
        usernameControl.disable();
        emailControl.disable();
      }

      if (this.user) {
        this.profileForm.patchValue({
          username: this.user.username,
          email: this.user.email
        });
      }
    }
  }

  async onSubmit() {
    if (this.profileForm.valid && this.user) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const formValue = this.profileForm.getRawValue();

        const updateData: UserRequest = {
          username: formValue.username,
          email: formValue.email,
          password: this.user.password,
          role: this.user.role,
          active: this.user.active
        };

        const updatedUser = await firstValueFrom(
          this.userService.updateUser(this.user.id, updateData)
        );

        this.user = updatedUser;
        this.isEditing = false;
        this.successMessage = 'Perfil actualizado correctamente';

        const usernameControl = this.profileForm.get('username');
        const emailControl = this.profileForm.get('email');

        if (usernameControl && emailControl) {
          usernameControl.disable();
          emailControl.disable();
        }
      } catch (error) {
        this.errorMessage = 'Error al actualizar el perfil';
        console.error('Error:', error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  getUserInitial(): string {
    return this.user?.username ? this.user.username.charAt(0).toUpperCase() : 'U';
  }

  getRoleDisplay(): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'USER': 'Usuario',
      'MANAGER': 'Gerente'
    };
    return this.user?.role ? (roleMap[this.user.role] || this.user.role) : '';
  }

  getRoleClass(): string {
    if (!this.user?.role) return '';

    const roleClasses: Record<UserRole, string> = {
      'admin': 'bg-purple-100 text-purple-800',
      'user': 'bg-blue-100 text-blue-800'
    };

    return roleClasses[this.user.role as UserRole] || 'bg-gray-100 text-gray-800';
  }

  async logout() {
    try {
      this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  }

}
