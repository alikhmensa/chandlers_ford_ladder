import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/player/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  players: any[] = [];
  tournamentId: any;
  currentUser: any = null;
  currentUserTournamentInfo: any = null; // Stores tournament-specific info like rank, win, lose, etc.
  incomingChallenges: any[] = []; // Stores incoming challenges for the current user
  outgoingChallenges: any[] = []; // Stores outgoing challenges from the current user

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.tournamentId = 1;
    this.loadPlayers();
    this.loadCurrentUser();
  }

  // Fetches all players' data for the tournament
  loadPlayers() {
    this.userService.getUsersTournamentStats(this.tournamentId).subscribe(
      (data) => {
        this.players = data;
        this.mapCurrentUserTournamentInfo();
      },
      (error) => {
        console.error('Error fetching players:', error);
      }
    );
  }

  // Fetches current user's basic info
  loadCurrentUser() {
    this.userService.getCurrentUser().subscribe(
      (user) => {
        this.currentUser = user;
        this.mapCurrentUserTournamentInfo();
        this.loadPendingChallenges();
      },
      (error) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

  // Fetches pending challenges for the current user
  loadPendingChallenges() {
    if (this.currentUser) {
      this.userService.getUserChallenges(this.currentUser.email).subscribe(
        (challenges) => {
          // Split challenges into incoming and outgoing
          this.incomingChallenges = challenges.filter(c => c.role === 'CHALLENGED');
          this.outgoingChallenges = challenges.filter(c => c.role === 'CHALLENGER');
        },
        (error) => {
          console.error('Error fetching pending challenges:', error);
        }
      );
    }
  }

  // Maps the current user's tournament stats from the players array
  mapCurrentUserTournamentInfo() {
    if (this.players.length > 0 && this.currentUser) {
      const matchedPlayer = this.players.find(
        (player) => player.email === this.currentUser.email
      );
      if (matchedPlayer) {
        this.currentUserTournamentInfo = matchedPlayer;
      } else {
        console.error('No matching player found for the current user in the players list.');
      }
    }
  }

  // Cancel a challenge
  cancelChallenge(challenge: any) {
    this.userService.cancelChallenge(this.currentUser.email, challenge.full_name).subscribe(
      (response) => {
        this.loadPendingChallenges(); // Refresh the pending challenges list
        this.snackBar.open('Challenge cancelled successfully!', 'Close', { duration: 3000 });
      },
      (error) => {
        console.error('Error cancelling challenge:', error);
        this.snackBar.open('Error cancelling challenge.', 'Close', { duration: 3000 });
      }
    );
  }

  // Accept a challenge
  acceptChallenge(challenge: any) {
    // Add logic here to accept the challenge
    this.snackBar.open('Challenge accepted!', 'Close', { duration: 3000 });
  }

  // Decline a challenge
  declineChallenge(challenge: any) {
    // Add logic here to decline the challenge
    this.snackBar.open('Challenge declined.', 'Close', { duration: 3000 });
  }
}
