import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-decline-challenge-dialog',
  templateUrl: './decline-challenge-dialog.component.html',
  styleUrls: ['./decline-challenge-dialog.component.css']
})
export class DeclineChallengeDialogComponent {
  reasons: string[] = [
    'Cannot attend the club next week for personal reasons',
    'I have already arranged a game with someone else in a different tournament',
    'I have already arranged a game with someone else in the ladder outside the system',
    'Other (specify)'
  ];
  selectedReason: string = '';
  otherReason: string = '';

  constructor(public dialogRef: MatDialogRef<DeclineChallengeDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    let reason = this.selectedReason;
    if (reason === 'Other (specify)') {
      reason = this.otherReason || 'No reason specified';
    }
    this.dialogRef.close(reason);
  }
}
