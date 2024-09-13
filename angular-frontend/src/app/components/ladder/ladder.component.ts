import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/player/users.service';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ladder',
  templateUrl: './ladder.component.html',
  styleUrls: ['./ladder.component.css'],
})
export class LadderComponent implements OnInit {
  players: any[] = [];
  tournamentId: any;
  currentUser: any = null;
  displayedColumns: string[] = [
    'rank',
    'name',
    'points',
    'gp',
    'win',
    'lose',
    'draw',
    'winPercentage',
    'actions',
  ];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.tournamentId = 1;
    this.loadData();
  }

  loadData() {
    forkJoin({
      players: this.userService.getUsersTournamentStats(this.tournamentId),
      currentUser: this.userService.getCurrentUser()
    }).subscribe(
      ({ players, currentUser }) => {
        this.players = players;
        this.currentUser = currentUser;
        this.markCurrentUser();
      },
      (error) => {
        console.error('Error loading data:', error);
      }
    );
  }

  markCurrentUser() {
    if (this.currentUser && this.players.length) {
      this.players.forEach((player) => {
        player.isCurrentUser = player.full_name === this.currentUser.fullname;
      });
      this.markNextFourPlayers();
    }
  }

  isNextFour(player: any): boolean {
    return player.isNextFour;
  }

  markNextFourPlayers() {
    const currentUserIndex = this.players.findIndex(
      (player) => player.isCurrentUser
    );
  
    if (currentUserIndex > 0) {
      this.players.forEach((player) => {
        player.isNextFour = false;
        player.hasPendingChallenge = false; // Reset the pending challenge flag
      });
  
      const nextFourPlayers = [];
      for (let i = 1; i <= 4; i++) {
        const playerIndex = currentUserIndex - i;
        if (playerIndex >= 0) {
          this.players[playerIndex].isNextFour = true;
          nextFourPlayers.push(this.players[playerIndex]);
        }
      }
  
      // Check eligibility only for the next four players
      this.checkChallengeEligibility(nextFourPlayers);
    }
  }

  checkChallengeEligibility(playersToCheck: any[]) {
    if (!this.currentUser) {
      return;
    }
  
    console.log(playersToCheck, this.currentUser);
    playersToCheck.forEach(player => {
      this.userService.checkChallengeEligibility(this.currentUser.email, player.email).subscribe(
        (response) => {
          player.isEligible = response.is_eligible;
          player.eligibilityReason = response.reason;
          player.hasPendingChallenge = !response.is_eligible && response.reason === 'There is already a pending challenge.';
        },
        (error) => {
          console.error('Error checking eligibility:', error);
        }
      );
    });
  }

  challenge(player: any) {
    if (!this.currentUser || !player) {
      console.error('Current user or target player not found.');
      return;
    }

    this.userService.createChallenge(this.currentUser.email, player.email).subscribe(
      (response) => {
        player.hasPendingChallenge = true;  // Mark this player as having a pending challenge
        this.snackBar.open('Challenge created successfully!', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error creating challenge:', error);
        this.snackBar.open('Error creating challenge.', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  cancelChallenge(player: any) {
    if (!this.currentUser || !player) {
      console.error('Current user or target player not found.');
      return;
    }
  
    this.userService.cancelChallenge(this.currentUser.email, player.email).subscribe(
      (response) => {
        console.log('Challenge cancelled successfully:', response);
        player.hasPendingChallenge = false; // Update the player's status
        this.snackBar.open('Challenge cancelled successfully!', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error cancelling challenge:', error);
        this.snackBar.open('Error cancelling challenge.', 'Close', {
          duration: 3000,
        });
      }
    );
  }
  
}
