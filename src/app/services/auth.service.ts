import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8081/auth';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username,
      password
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getUsername(): string {
    const token = this.getToken();
    if (!token) return '';

    const decoded: any = jwtDecode(token);
    return decoded.sub;
  }
}