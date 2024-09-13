import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://127.0.0.1:5000/users';  // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.baseUrl}/single`, { headers });
    } else {
      throw new Error('No access token found');
    }
  }

  getUsersTournamentStats(tournamentId: any): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.baseUrl}/stats/tournament/${tournamentId}`, { headers });
    } else {
      throw new Error('No access token found');
    }
  }

  createChallenge(challengerEmail: string, challengedEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const body = {
        challenger_email: challengerEmail,
        challenged_email: challengedEmail
      };
      return this.http.post<any>(`${this.baseUrl}/challenge`, body, { headers });
    } else {
      throw new Error('No access token found');
    }
  }

  checkChallengeEligibility(challengerEmail: string, challengedEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const body = {
        challenger_email: challengerEmail,
        challenged_email: challengedEmail
      };
      return this.http.post<any>(`${this.baseUrl}/challenge/eligibility`, body, { headers });
    } else {
      throw new Error('No access token found');
    }
  }
  cancelChallenge(challengerEmail: string, challengedEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const body = {
        challenger_email: challengerEmail,
        challenged_email: challengedEmail
      };
      return this.http.post<any>(`${this.baseUrl}/challenge/cancel`, body, { headers });
    } else {
      throw new Error('No access token found');
    }
  }
  
}

