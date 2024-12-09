// user-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {User, UserRequest} from "../../../../../services/user.service";

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: 'user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isEditing = !!data?.user;
    this.initForm();
  }

  ngOnInit() {
    if (this.isEditing && this.data.user) {
      this.userForm.patchValue({
        username: this.data.user.username,
        email: this.data.user.email,
        role: this.data.user.role,
        active: this.data.user.active
      });
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
      role: ['user', [Validators.required]],
      active: [true]
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.userForm.get(field);
    return formControl ? (formControl.invalid && formControl.touched) : false;
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const userRequest: UserRequest = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
        active: formValue.active
      };

      this.dialogRef.close(userRequest);
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
