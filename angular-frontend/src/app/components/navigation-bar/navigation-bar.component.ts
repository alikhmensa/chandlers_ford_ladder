import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/player/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {
  notifications: number = 0;
  currentUser: any;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  // Fetch incoming challenges to determine the number of notifications
  loadNotifications() {
    const currentUserEmail = this.currentUser.email;
    
    if (currentUserEmail) {
      this.userService.getUserChallenges(currentUserEmail).subscribe(
        (challenges) => {
          this.notifications = challenges.filter(challenge => challenge.role === 'CHALLENGED').length;
        },
        (error) => {
          console.error('Error fetching challenges:', error);
        }
      );
    }
  }

  // Fetches current user's basic info
  loadCurrentUser() {
    this.userService.getCurrentUser().subscribe(
      (user) => {
        this.currentUser = user;
        this.loadNotifications();
      },
      (error) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
