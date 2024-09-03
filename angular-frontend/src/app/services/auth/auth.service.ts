import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000';  // Flask backend URL

  constructor(private http: HttpClient) { }

  register(fullname: string, email: string,password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, { fullname, password, email });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }
  
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;  // Check if token is expired
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

}
