import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/player/users.service';

@Component({
  selector: 'app-game-result-dialog',
  templateUrl: './game-result-dialog.component.html',
  styleUrls: ['./game-result-dialog.component.css'],
})
export class GameResultDialogComponent implements OnInit {
  gameResultForm: FormGroup;
  players: any[] = [];
  filteredPlayers: any[] = []; // List of players filtered by provided names
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<GameResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tournamentId: number, player1?: string, player2?: string, challengeId?: any} // Inject tournament ID and optional player names
  ) {
    this.gameResultForm = this.fb.group({
      whitePlayer: ['', Validators.required],
      blackPlayer: ['', Validators.required],
      gameDate: ['', Validators.required],
      result: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.getUsersTournamentStats(this.data.tournamentId).subscribe((players) => {
      this.players = players;
      this.filterPlayers(); // Filter players based on the provided names
    });

    // Custom validator to check if the same player is selected
    this.gameResultForm.controls['blackPlayer'].valueChanges.subscribe(() => {
      this.validateDifferentPlayers();
    });
    this.gameResultForm.controls['whitePlayer'].valueChanges.subscribe(() => {
      this.validateDifferentPlayers();
    });
  }

  filterPlayers() {
    // If both player names are provided, filter the list accordingly
    console.log(this.data.player1);
    console.log(this.data.player2);
    if (this.data.player1 && this.data.player2) {
      this.filteredPlayers = this.players.filter(player =>
        player.full_name === this.data.player1 || player.full_name === this.data.player2
      );
    } else {
      // If player names are not provided, use the entire list
      this.filteredPlayers = this.players;
    }
  }

  validateDifferentPlayers() {
    const whitePlayer = this.gameResultForm.get('whitePlayer')?.value;
    const blackPlayer = this.gameResultForm.get('blackPlayer')?.value;
    if (whitePlayer && blackPlayer && whitePlayer === blackPlayer) {
      this.gameResultForm.get('blackPlayer')?.setErrors({ samePlayer: true });
      this.gameResultForm.get('whitePlayer')?.setErrors({ samePlayer: true });
    } else {
      this.gameResultForm.get('blackPlayer')?.setErrors(null);
      this.gameResultForm.get('whitePlayer')?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.gameResultForm.valid) {
      const gameResult = {
        whitePlayerEmail: this.gameResultForm.value.whitePlayer,
        blackPlayerEmail: this.gameResultForm.value.blackPlayer,
        result: this.gameResultForm.value.result,
        gameDate: this.gameResultForm.value.gameDate,
        tournamentId: this.data.tournamentId,
        challengeId: this.data.challengeId // Ensure this is passed if available
      };
      console.log(gameResult);
      this.userService.submitGameResult(gameResult).subscribe(
        (response) => {
          console.log('Game result submitted successfully:', response);
          this.dialogRef.close(true); // Close the dialog with a success indication
        },
        (error) => {
          console.error('Failed to submit game result:', error);
        }
      );
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
