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
    private router: Router // Inject the Router service
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
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
      const { username, email, password } = this.registerForm.value;

      this.authService.register(username, email, password).subscribe(
        (response) => {
          console.log('Registration successful', response);
          this.successMessage = 'User registered successfully';
          this.errorMessage = '';
          this.registerForm.reset();

          // Redirect to the login page
          this.router.navigate(['/login']);
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
