import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerResponse } from '../../Model/Server/ServerResponse';
import { Observable } from 'rxjs';
import { eHAllSystemEndPoints } from '../../Constant/EndPoints';
import { Declaration } from '../../Model/Acte/Declaration';

@Injectable({
  providedIn: 'root',
})
export class ActeService {
  constructor(private http: HttpClient) {}
  

  // Methode pour la declaration d'un acte de naissance

  getAllDeclarationByEtablissement(idEtablissement: number): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${eHAllSystemEndPoints.Acte.Declaration.allByStructure}/${idEtablissement}`);
  }
  declarationActeNaissance(formData: FormData):Observable<ServerResponse> {
    return this.http.post<ServerResponse>(eHAllSystemEndPoints.Acte.Declaration.declare, formData);
  }
  
}
