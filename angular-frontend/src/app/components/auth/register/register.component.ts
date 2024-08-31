import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService) { }

  onSubmit(): void {
    this.authService.register(this.username, this.password).subscribe(
      response => {
        console.log('Registration successful', response);
        this.successMessage = 'User registered successfully';
        this.errorMessage = '';
        // Optionally reset form fields
        this.username = '';
        this.password = '';
      },
      error => {
        console.error('Registration failed', error);
        this.errorMessage = 'User already exists';
        this.successMessage = '';
      }
    );
  }
}
