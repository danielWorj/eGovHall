import { Enfant } from "../Enfant/Enfant";
import { Etablissement } from "../Etablissement/Etablissement";
import { Parent } from "../Utilisateur/Parent";

export interface Declaration {
    id: number;
    date: string;
    structure: Etablissement;
    enfant: Enfant;
    mere: Parent;
}