import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component'; // Corrected path
import { RegisterComponent } from './components/auth/register/register.component'; // Corrected path
//import { LadderComponent } from './components/auth/ladder/ladder.component';  // Corrected path

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  //{ path: 'ladder', component: LadderComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Import RouterModule and configure with routes
  exports: [RouterModule], // Export RouterModule so it is available throughout the app
})
export class AppRoutingModule {}
