import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { AuthData } from '../../Model/Auth/AuthData';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private httpClient: HttpClient) {}

  login(request: { email: string; password: string }): Observable<AuthData> {
    return this.httpClient
      .post<AuthData>(eHAllSystemEndPoints.Auth.jwt, request)
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', `${res.id}`);

        if (res.role != null) {
          localStorage.setItem('role', `${res.role}`);
        } else {
          localStorage.removeItem('role');
        }

        if (res.etablissement != null) {
          localStorage.setItem('etablissement', `${res.etablissement}`);
        } else {
          localStorage.removeItem('etablissement');
        }
      }));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('etablissement');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isHopital(): boolean {
    const role = localStorage.getItem('role');
    const etablissement = localStorage.getItem('etablissement');
    return role === '2' && !!etablissement && etablissement !== 'null' && etablissement !== '0';
  }
}