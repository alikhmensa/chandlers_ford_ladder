import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LadderComponent } from './components/ladder/ladder.component';
import { AccountComponent } from './components/account/account.component';
import { AuthGuard } from './guards/auth.guard';  // Import the AuthGuard

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ladder', component: LadderComponent, canActivate: [AuthGuard] }, // Protected route with AuthGuard
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] }, // Protected route with AuthGuard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Import RouterModule and configure with routes
  exports: [RouterModule],  // Export RouterModule so it is available throughout the app
})
export class AppRoutingModule {}
