import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/player/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeclineChallengeDialogComponent } from '../decline-challenge-dialog/decline-challenge-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { GameResultDialogComponent } from '../game-result-dialog/game-result-dialog.component';

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
  scheduledGame: any = null; // Stores scheduled game info
  matchHistory: any[] = []; // Stores user's match history

  showAllIncomingChallenges: boolean = false; // Controls visibility of all incoming challenges
  showAllOutgoingChallenges: boolean = false;

  notifications: number = 0;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.tournamentId = 1;
    this.loadPlayers();
    this.loadCurrentUser();
  }
  // Fetch incoming challenges to determine the number of notifications
  loadNotifications() {
    const currentUserEmail = this.currentUser.email;

    if (currentUserEmail) {
      this.userService.getUserChallenges(currentUserEmail).subscribe(
        (challenges) => {
          this.notifications = challenges.filter(
            (challenge) => challenge.role === 'CHALLENGED'
          ).length;
        },
        (error) => {
          console.error('Error fetching challenges:', error);
        }
      );
    }
  }

  toggleShowAllIncoming() {
    this.showAllIncomingChallenges = !this.showAllIncomingChallenges;
  }

  toggleShowAllOutgoing() {
    this.showAllOutgoingChallenges = !this.showAllOutgoingChallenges;
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
        console.log(user);
        this.currentUser = user;
        this.mapCurrentUserTournamentInfo();
        this.loadPendingChallenges();
        this.loadScheduledGame(); // Load scheduled game
        this.loadNotifications();
        this.loadMatchHistory(); // Load match history for current user
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
          this.incomingChallenges = challenges.filter(
            (c) => c.role === 'CHALLENGED'
          );
          this.outgoingChallenges = challenges.filter(
            (c) => c.role === 'CHALLENGER'
          );
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
        console.error(
          'No matching player found for the current user in the players list.'
        );
      }
    }
  }

  // Cancel a challenge
  cancelChallenge(challenge: any) {
    this.userService
      .cancelChallenge(this.currentUser.email, challenge.full_name)
      .subscribe(
        (response) => {
          this.loadPendingChallenges(); // Refresh the pending challenges list
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

  acceptChallenge(challenge: any) {
    if (!this.currentUser || !challenge) return;

    const challengerEmail = challenge.opponent_email;
    const challengedEmail = this.currentUser.email;

    this.userService
      .acceptChallenge(challengerEmail, challengedEmail)
      .subscribe(
        () => {
          this.loadCurrentUser();
          this.snackBar.open('Challenge accepted!', 'Close', {
            duration: 3000,
          });
        },
        (error) => {
          console.error('Error accepting challenge:', error);
          this.snackBar.open('Error accepting challenge.', 'Close', {
            duration: 3000,
          });
        }
      );
  }

  declineChallenge(challenge: any) {
    if (!this.currentUser || !challenge) return;

    const dialogRef = this.dialog.open(DeclineChallengeDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        const challengerEmail = challenge.opponent_email;
        const challengedEmail = this.currentUser.email;

        this.userService
          .declineChallenge(challengerEmail, challengedEmail, reason)
          .subscribe(
            () => {
              this.loadCurrentUser();
              this.snackBar.open('Challenge declined.', 'Close', {
                duration: 3000,
              });
            },
            (error) => {
              console.error('Error declining challenge:', error);
              this.snackBar.open('Error declining challenge.', 'Close', {
                duration: 3000,
              });
            }
          );
      }
    });
  }

  // Fetch the scheduled game for the current user
  loadScheduledGame() {
    if (this.currentUser) {
      this.userService
        .getScheduledGame(this.currentUser.email)
        .subscribe((result) => {
          if (result.message == 'No scheduled game found.') {
            this.scheduledGame == null;
          } else {
            this.scheduledGame = result;
          }
        });
    }
  }

  cancelScheduledGame() {
    if (this.scheduledGame) {
      // Open the dialog to get the cancellation reason
      const dialogRef = this.dialog.open(DeclineChallengeDialogComponent, {
        width: '400px',
      });

      dialogRef.afterClosed().subscribe((reason) => {
        if (reason) {
          // Call the cancel scheduled game service with the reason
          this.userService
            .cancelScheduledGame(this.scheduledGame.challenge_id, reason)
            .subscribe(
              () => {
                this.scheduledGame = null; // Clear the scheduled game
                this.snackBar.open(
                  'Scheduled game cancelled successfully!',
                  'Close',
                  { duration: 3000 }
                );
              },
              (error) => {
                console.error('Error cancelling scheduled game:', error);
                this.snackBar.open(
                  'Error cancelling scheduled game.',
                  'Close',
                  { duration: 3000 }
                );
              }
            );
        }
      });
    }
  }
  loadMatchHistory() {
    // Ensure currentUserTournamentInfo is available
    if (this.currentUserTournamentInfo) {
      const currentUserId = this.currentUserTournamentInfo.user_id; // Access user_id through tournament info

      this.userService.getUserMatchHistory(this.currentUser.email).subscribe(
        (history) => {
          this.matchHistory = history.map((match) => {
            let opponent = '';
            let result = '';

            // Determine if current user played as white or black using currentUserId
            if (match.white_user_id === currentUserId) {
              opponent = match.black_player; // Opponent is the black player
              result =
                match.result === 'white_win'
                  ? 'Victory'
                  : match.result === 'black_win'
                  ? 'Defeat'
                  : 'Draw';
            } else if (match.black_user_id === currentUserId) {
              opponent = match.white_player; // Opponent is the white player
              result =
                match.result === 'black_win'
                  ? 'Victory'
                  : match.result === 'white_win'
                  ? 'Defeat'
                  : 'Draw';
            }

            return {
              opponent: opponent,
              played_at: match.played_at,
              result: result,
            };
          });

          if (this.matchHistory.length > 0) {
            console.log(
              'Match history retrieved successfully:',
              this.matchHistory
            );
          } else {
            console.log('No match history found for the current user.');
          }
        },
        (error) => {
          console.error('Error fetching match history:', error);
          console.log('suk pzdc');
        }
      );
    } else {
      console.error('No current user tournament info found.');
    }
  }

  enterResults() {
    console.log(this.scheduledGame);
    const dialogRef = this.dialog.open(GameResultDialogComponent, {
      width: '400px',
      data: {
        tournamentId: 1, // Example tournament ID
        player1: this.currentUserTournamentInfo.full_name, // Optional: Name of player 1
        player2: this.scheduledGame.opponent_name,
        challengeId: this.scheduledGame.challenge_id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadScheduledGame();
      }
    });
  }

}
