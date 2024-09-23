import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module'; // Correct import
import { MatRadioModule } from '@angular/material/radio'; // For radio buttons

import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LadderComponent } from './components/ladder/ladder.component';
import { AccountComponent } from './components/account/account.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { RulesComponent } from './components/rules/rules.component';
import { DeclineChallengeDialogComponent } from './components/decline-challenge-dialog/decline-challenge-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LadderComponent,
    AccountComponent,
    NavigationBarComponent,
    RulesComponent,
    DeclineChallengeDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    RouterModule, // Ensure RouterModule is included here
    AppRoutingModule,
    MatToolbarModule,
    ReactiveFormsModule, // Ensure AppRoutingModule is included here
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
