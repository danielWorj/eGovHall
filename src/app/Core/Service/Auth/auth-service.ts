import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from '../../Model/Auth/AuthData';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   constructor(private httpClient : HttpClient){

  }

  isAuthenticated(): boolean {
    const id = localStorage.getItem('id');
    return !!id; // Returns true if id exists, false otherwise
  }

  login(request :any):Observable<AuthData>{
    return this.httpClient.post<AuthData>(eHAllSystemEndPoints.Auth.login , request); 
  }
}
