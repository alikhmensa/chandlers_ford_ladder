import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameResultDialogComponent } from './game-result-dialog.component';

describe('GameResultDialogComponent', () => {
  let component: GameResultDialogComponent;
  let fixture: ComponentFixture<GameResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameResultDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
