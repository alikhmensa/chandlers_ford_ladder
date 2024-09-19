import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclineChallengeDialogComponent } from './decline-challenge-dialog.component';

describe('DeclineChallengeDialogComponent', () => {
  let component: DeclineChallengeDialogComponent;
  let fixture: ComponentFixture<DeclineChallengeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclineChallengeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclineChallengeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
