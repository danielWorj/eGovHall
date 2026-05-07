export interface Etablissement {
    id: number;
    nom: string;
    telephone: string;
    localisation : string;
    email : string ; 
    actif : boolean;
    creation : string;
    code : string;
    type:Etablissement ; 
}
