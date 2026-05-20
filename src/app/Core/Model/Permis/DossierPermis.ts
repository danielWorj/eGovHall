import { Mairie } from "../Etablissement/Mairie";
import { Utilisateur } from "../Utilisateur/Utilisateur";
import { PlanExecution } from "./PlanExecution";
import { StatutDossier } from "./StatutDossier";

export interface DossierPermisBatir{
    id : number ; 
    numeroDossier : string ; 
    date : string; 
    dateInstruction : string ; 
    dateModification : string; 

    demandeur : Utilisateur; 
    cni : string; 
    raison : string;

    mairie : Mairie

    demandeTimbre:string;
    certificatUrbanisme :string; 
    certificatPropriete:string; 
    devis:string; 
    planTerrain:string; 
    planMasse:string; 
    statut:StatutDossier; 
}


export interface ConstructDossierPermis{
    dossier : DossierPermisBatir, 
    plans : PlanExecution[], 
    statut : StatutDossier 
}