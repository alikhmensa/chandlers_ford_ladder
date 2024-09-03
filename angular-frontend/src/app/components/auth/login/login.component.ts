import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service'; // Assuming you have an AuthService
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {
  fullname: string = '';
  password: string = '';
  errorMessage: string = '';
  loginForm!: FormGroup;

  constructor(private router: Router, 
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar 
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      }
    );

    // Reset the form on page load to clear any lingering values
    this.loginForm.reset();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe(
        (response) => {
          console.log('Login successful', response);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000, panelClass: ['success-skin']
          });
          localStorage.setItem('access_token', response.access_token);
          this.router.navigate(['/ladder']); // Redirect to the ladder page on successful login
        },
        (error) => {
          this.errorMessage =
            'Login failed: ' +
            (error.error.message || 'Please try again later.');
          console.error('Login failed', this.errorMessage);
          this.snackBar.open('Login failed, invalid credentials!', 'Close', {
            duration: 3000, panelClass: ['fail-skin']
          });
        }
      );
    }
  }
}
