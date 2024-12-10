import { User, UserRequest, UserService } from '../../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserFormComponent } from './user-form/user-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, firstValueFrom } from 'rxjs';
import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { isPlatformBrowser, PLATFORM_ID } from '@angular/common';
import { fadeAnimation, itemAnimation, listAnimation } from '../../../../../../animations';
import { AuthService } from '../../../../login/auth/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './user.component.html',
  animations: [fadeAnimation, listAnimation, itemAnimation]
})
export class UserComponent implements OnInit, OnDestroy {
  private jwtHelper = new JwtHelperService();
  profileForm!: FormGroup;
  errorMessage = '';
  isBrowser: boolean;
  user: User | null = null;

  users: User[] = [];
  loading = false;
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'grid';
  selectedFilter: 'all' | 'active' | 'inactive' = 'all';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private admin!: boolean;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterUsers();
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

    this.obtenerUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  obtenerUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
        this.showNotification('Error al cargar usuarios', true);
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  filterUsers(): User[] {
    return this.users.filter(user => {
      const searchTerm = this.searchTerm.toLowerCase().trim();
      const matchesSearch = searchTerm === '' ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm);

      const matchesFilter = this.selectedFilter === 'all' ? true :
        this.selectedFilter === 'active' ? user.active :
          !user.active;

      return matchesSearch && matchesFilter;
    });
  }

  getRoleBadgeColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 ring-purple-600';
      case 'user':
        return 'bg-blue-100 text-blue-800 ring-blue-600';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600';
    }
  }

  validarAcciones(): boolean {
    return this.user?.role === 'admin';
  }

  deleteUser(userId: string, event: Event) {
    if (!this.validarAcciones()) {
      this.showNotification('No tienes permisos para eliminar usuarios', true);
      return;
    }

    event.stopPropagation();

    const user = this.users.find(u => u.id === userId);
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data: { username: user?.username },
      panelClass: ['delete-dialog-container'],
      backdropClass: 'delete-dialog-backdrop',
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.obtenerUsers();
            this.showNotification('Usuario eliminado exitosamente');
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            this.showNotification('Error al eliminar usuario', true);
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  createUser(userRequest: UserRequest) {
    if (!this.validarAcciones()) {
      this.showNotification('No tienes permisos para crear usuarios', true);
      return;
    }

    this.loading = true;
    this.userService.storeUser(userRequest).subscribe({
      next: () => {
        this.obtenerUsers();
        this.showNotification('Usuario creado exitosamente');
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.showNotification('Error al crear usuario', true);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  updateUser(userId: string, userRequest: UserRequest) {
    if (!this.validarAcciones()) {
      this.showNotification('No tienes permisos para actualizar usuarios', true);
      return;
    }

    this.loading = true;
    this.userService.updateUser(userId, userRequest).subscribe({
      next: () => {
        this.obtenerUsers();
        this.showNotification('Usuario actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.showNotification('Error al actualizar usuario', true);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openUserForm(user?: User) {
    if (!this.validarAcciones() && !user) {
      this.showNotification('No tienes permisos para crear usuarios', true);
      return;
    }

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: { user },
      panelClass: ['user-form-dialog']
    });

    dialogRef.afterClosed().subscribe((result: UserRequest | undefined) => {
      if (result) {
        if (user) {
          this.updateUser(user.id, result);
        } else {
          this.createUser(result);
        }
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.searchSubject.next('');
    this.showNotification('Filtros limpiados');
  }

  private showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
