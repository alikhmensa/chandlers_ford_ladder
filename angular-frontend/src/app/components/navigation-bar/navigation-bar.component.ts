import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.css'
})

export class NavigationBarComponent {
  
  constructor(private router: Router, 
    private authService: AuthService) {}

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
