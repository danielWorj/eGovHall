import { DossierPermisBatir } from "./DossierPermis";
import { TypePlan } from "./TypePlan";

export interface PlanExecution{
    id:number ;
    chemin:string ; 
    dossier : DossierPermisBatir;
    typePlan : TypePlan;
}