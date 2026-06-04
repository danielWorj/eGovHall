import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sexe } from '../../Model/Enfant/Sexe';
import { Observable } from 'rxjs';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { Utilisateur } from '../../Model/Utilisateur/Utilisateur';
import { ServerResponse } from '../../Model/Server/ServerResponse';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  constructor(private http: HttpClient) {}

  //User 
  getAllInformationUtilisateur(id:number):Observable<Utilisateur>{
    return this.http.get<Utilisateur>(eHAllSystemEndPoints.Utilisateur.byId +id);
  }

  //Sexe
  getAllSexe():Observable<Sexe[]> {
    return this.http.get<Sexe[]>(eHAllSystemEndPoints.Utilisateur.Sexe.all);
  }



  
  // CRUD 
  getAllAgent():Observable<Utilisateur[]>{
    return this.http.get<Utilisateur[]>(eHAllSystemEndPoints.Utilisateur.Agent.all);
  }

  getAllAgentByStructure(id:number):Observable<Utilisateur[]>{
    return this.http.get<Utilisateur[]>(eHAllSystemEndPoints.Utilisateur.Agent.allbystructure+id);
  }

  createAgent(request:any):Observable<ServerResponse>{
    return this.http.post<ServerResponse>(eHAllSystemEndPoints.Utilisateur.Agent.create, request);
  }

  registerAgent(request: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    password: string;
    roleUser: number;
    structure: number;
    statutUser?: number;
  }): Observable<any> {
    return this.http.post<any>(eHAllSystemEndPoints.Auth.register, request);
  }
  
  updateAgent(request:any):Observable<ServerResponse>{
    return this.http.post<ServerResponse>(eHAllSystemEndPoints.Utilisateur.Agent.update, request);
  }

  deleteAgent(id:number):Observable<ServerResponse>{
    return this.http.get<ServerResponse>(eHAllSystemEndPoints.Utilisateur.Agent.delete+id);
  }

}