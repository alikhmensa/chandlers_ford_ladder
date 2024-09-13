import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/player/users.service';

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

  constructor(private userService: UserService) {}

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
        console.log('Players:', this.players);
        // Try to map current user's tournament info after players are loaded
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
        // Try to map current user's tournament info after current user is loaded
        this.mapCurrentUserTournamentInfo();
      },
      (error) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

  // Maps the current user's tournament stats from the players array
  mapCurrentUserTournamentInfo() {
    if (this.players.length > 0 && this.currentUser) {
      const matchedPlayer = this.players.find(
        (player) => player.email === this.currentUser.email
      );
      if (matchedPlayer) {
        this.currentUserTournamentInfo = matchedPlayer;
        console.log(
          'Current User Tournament Info:',
          this.currentUserTournamentInfo
        );
      } else {
        console.error(
          'No matching player found for the current user in the players list.'
        );
      }
    }
  }
}
