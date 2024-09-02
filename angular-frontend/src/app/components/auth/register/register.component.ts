import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router'; // Import the Router service
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar

export class ConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent?.dirty);
    const invalidParent = !!(
      control &&
      control.parent &&
      control.parent.invalid &&
      control.parent.dirty &&
      control.parent.hasError('passwordsNotMatching')
    );

    return invalidCtrl || invalidParent;
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  confirmPasswordMatcher = new ConfirmPasswordErrorStateMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router, // Inject the Router service
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        fullname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordsMatching }
    );

    // Reset the form on page load to clear any lingering values
    this.registerForm.reset();
  }

  passwordsMatching(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsNotMatching: true };
    }
    return null;
  }

  getFieldError(field: string): string | null {
    const control = this.registerForm.get(field);
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (control.errors?.['email']) {
        return 'Invalid email format';
      } else if (
        this.registerForm.hasError('passwordsNotMatching') &&
        field === 'confirmPassword'
      ) {
        return 'Passwords do not match';
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { fullname, email, password } = this.registerForm.value;

      this.authService.register(fullname, email, password).subscribe(
        (response) => {
          console.log('Registration successful', response);
          this.successMessage = 'User registered successfully';
          this.errorMessage = '';
          this.registerForm.reset();

          // Show snackbar before redirecting
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000, // Duration in milliseconds
          });

          // Redirect to the login page after snackbar is shown
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 10); // This delay matches the snackbar duration
        },
        (error) => {
          console.error('Registration failed', error);
          this.errorMessage =
            'Registration failed: ' +
            (error.error.message || 'Please try again later.');
          this.successMessage = '';
        }
      );
    } else {
      this.errorMessage = 'Please fix the errors above';
      this.successMessage = '';
    }
  }
}
