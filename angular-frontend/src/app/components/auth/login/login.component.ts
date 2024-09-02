import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Assuming you have an AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit(): void {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe(
        (response) => {
          console.log('Login successful', response);
          this.router.navigate(['/ladder']); // Redirect to the ladder page on successful login
        },
        (error) => {
          console.error('Login failed', error);
          this.errorMessage =
            'Login failed: ' +
            (error.error.message || 'Please try again later.');
        }
      );
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }
}
