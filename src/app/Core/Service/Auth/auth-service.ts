import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from '../../Model/Auth/AuthData';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { Observable } from 'rxjs';
import { BasicAuthData } from '../../Model/Auth/BasicAuthData';

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

  login(request :any):Observable<BasicAuthData>{
    return this.httpClient.post<BasicAuthData>(eHAllSystemEndPoints.Auth.login , request); 
  }

  isHopital(): boolean {
  const role = localStorage.getItem('role');
  const etablissement = localStorage.getItem('etablissement');
  return role === '2' && !!etablissement && etablissement !== 'null' && etablissement !== '0';
}
}
