import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DossierPermisBatir } from '../../Model/Permis/DossierPermis';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { ServerResponse } from '../../Model/Server/ServerResponse';

@Injectable({
  providedIn: 'root',
})
export class PermisService {
  constructor(private http:HttpClient){

  }

  findAllDossierPermisByMairie(id:number):Observable<DossierPermisBatir[]>{
    return this.http.get<DossierPermisBatir[]>(eHAllSystemEndPoints.Permis.Dossier.allbyMairie+id);
  }

  findAllDossierPermisByDemandeur(id:number):Observable<DossierPermisBatir[]>{
    return this.http.get<DossierPermisBatir[]>(eHAllSystemEndPoints.Permis.Dossier.allbyUser+id);
  }

  creationDossierPermis(formData: FormData): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(
      eHAllSystemEndPoints.Permis.Dossier.create,
      formData
    );
  }

  updateDossierPermis(formData: FormData): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(
      eHAllSystemEndPoints.Permis.Dossier.update,
      formData
    );
  }

  deleteDossierPermis(id:number):Observable<DossierPermisBatir[]>{
    return this.http.get<DossierPermisBatir[]>(eHAllSystemEndPoints.Permis.Dossier.delete+id);
  }
  
}
