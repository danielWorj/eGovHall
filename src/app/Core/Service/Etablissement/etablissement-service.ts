import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Etablissement } from '../../Model/Etablissement/Etablissement';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { ServerResponse } from '../../Model/Server/ServerResponse';

@Injectable({
  providedIn: 'root',
})
export class EtablissementService {
  constructor(private http : HttpClient) {}

  //CRUD Etablissement
  getAllEtablissement():Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(eHAllSystemEndPoints.Etablissement.all);
  }

  getEtablissementByid(id:number): Observable<Etablissement> {
    return this.http.get<Etablissement>(eHAllSystemEndPoints.Etablissement.byId + id);
  }

  createEtablissement(request:any): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(eHAllSystemEndPoints.Etablissement.create, request);
  }

  updateEtablissement(request:any): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(eHAllSystemEndPoints.Etablissement.update, request);
  }

  deleteEtablissement(id:number): Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(eHAllSystemEndPoints.Etablissement.delete + id);
  }
  
}
