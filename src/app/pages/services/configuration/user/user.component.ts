// user.component.ts
import { Component, OnInit } from '@angular/core';
import {User, UserRequest, UserService} from "../../../../services/user.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {UserFormComponent} from "./user-form/user-form.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeleteConfirmationDialogComponent} from "./delete-confirmation-dialog/delete-confirmation-dialog.component";

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
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  users: User[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  selectedFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.obtenerUsers();
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
      }
    });
  }

  filterUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter = this.selectedFilter === 'all' ? true :
        this.selectedFilter === 'active' ? user.active :
          !user.active;
      return matchesSearch && matchesFilter;
    });
  }

  deleteUser(userId: string, event: Event) {
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

  openUserForm(user?: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: { user }
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

  createUser(userRequest: UserRequest) {
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

  private showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
