import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/player/users.service';

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

  constructor(private userService: UserService) {}  

  ngOnInit() {
    this.tournamentId = 1;
    this.loadPlayers();
    this.loadCurrentUser();
  }

  loadPlayers() {
    this.userService.getUsersTournamentStats(this.tournamentId).subscribe(
      (data) => {
        this.players = data;
      },
      (error) => {
        console.error('Error fetching players:', error);
      }
    );
  }

  loadCurrentUser() {
    this.userService.getCurrentUser().subscribe(
      (user) => {
        this.currentUser = user;
        this.markCurrentUser();
      },
      (error) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

  markCurrentUser() {
    if (this.currentUser && this.players.length) {
      this.players.forEach(player => {
        player.isCurrentUser = player.name === this.currentUser.fullname;
      });
      this.markNextFourPlayers();
    }
  }

  markNextFourPlayers() {
    const currentUserIndex = this.players.findIndex(player => player.isCurrentUser);

    if (currentUserIndex > 0) {
      // Reset any previous markings
      this.players.forEach(player => player.isNextFour = false);

      // Mark the four players above the current user
      for (let i = 1; i <= 4; i++) {
        const playerIndex = currentUserIndex - i;
        if (playerIndex >= 0) {
          this.players[playerIndex].isNextFour = true;
        }
      }
    }
  }

  isNextFour(player: any): boolean {
    return player.isNextFour;
  }
}
