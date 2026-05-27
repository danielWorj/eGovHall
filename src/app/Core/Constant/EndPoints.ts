//const baseUrl = 'http://localhost:8080/eHall/api';

const baseUrl = "https://egovhallback.onrender.com/eHall/api";  //End points final 




const authBaseUrl          = `${baseUrl}/auth`;
const etablissementBaseUrl = `${baseUrl}/domaine`;
const acteBaseUrl          = `${baseUrl}/declaration`;
const userBaseUrl          = `${baseUrl}/user`;
const permisBaseUrl        = `${baseUrl}/permis`;

// ── URL de base du service d'archivage RAG (Flask sur port 5000) ──────────────
const archiveBaseUrl = 'http://localhost:5000/api';

export const eHAllSystemEndPoints = {

    Auth: {
        login: `${authBaseUrl}/login`
    },

    structure: {
        Mairie: {
            all:    `${etablissementBaseUrl}/mairie/all`,
            byid:   `${etablissementBaseUrl}/mairie/byId/`,
            create: `${etablissementBaseUrl}/mairie/create`,
            update: `${etablissementBaseUrl}/mairie/update`,
            delete: `${etablissementBaseUrl}/mairie/delete/`,
        },
        Hopital: {
            all:    `${etablissementBaseUrl}/hopital/all`,
            byid:   `${etablissementBaseUrl}/hopital/byId/`,
            create: `${etablissementBaseUrl}/hopital/create`,
            update: `${etablissementBaseUrl}/hopital/update`,
            delete: `${etablissementBaseUrl}/hopital/delete/`,
        }
    },

    Acte: {
        Declaration: {
            all:        `${acteBaseUrl}/all`,
            allHopital: `${acteBaseUrl}/all/byhopital/`,
            allMairie:  `${acteBaseUrl}/all/bymairie/`,
            declare:    `${acteBaseUrl}/create`,
            update:     `${acteBaseUrl}/update`,
        },
        ActeNaissance: {
            allMairie: `${acteBaseUrl}/acte/all/bymairie/`,
            declare:   `${acteBaseUrl}/acte/create`,
            update:    `${acteBaseUrl}/acte/update`,
            delete:    `${acteBaseUrl}/acte/delete`,
            download:  `${acteBaseUrl}/acte/download/`
        }
    },

    Permis: {
        Dossier: {
            all:          `${permisBaseUrl}/dossier/all`,
            allbyMairie:  `${permisBaseUrl}/dossier/allbymairie/`,
            allbyUser:    `${permisBaseUrl}/dossier/allbyuser/`,
            byId:         `${permisBaseUrl}/dossier/byId/`,
            create:       `${permisBaseUrl}/dossier/create`,
            update:       `${permisBaseUrl}/dossier/update`,
            delete:       `${permisBaseUrl}/dossier/delete/`,
        }, 
        TypePlan :{
            all:          `${permisBaseUrl}/typeplan/all`,
        }, 
        PlanExecution:{
            allbydossier : `${permisBaseUrl}/planExecution/bydossier/`
        }
    },

    Utilisateur: {
        Sexe: {
            all: `${userBaseUrl}/sexe/all`
        }
    },

    // ── Archivage RAG ─────────────────────────────────────────────────────────
    Archive: {
        upload:    `${archiveBaseUrl}/upload`,    // POST  — uploader un document
        ask:       `${archiveBaseUrl}/ask`,       // POST  — poser une question RAG
        documents: `${archiveBaseUrl}/documents`, // GET   — liste des documents
        status:    `${archiveBaseUrl}/status`,    // GET   — santé du système
    },

}