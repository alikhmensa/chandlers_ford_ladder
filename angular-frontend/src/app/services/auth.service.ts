import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000';  // Flask backend URL

  constructor(private http: HttpClient) { }

  register(fullname: string, email: string,password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { fullname, password, email });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }
}
