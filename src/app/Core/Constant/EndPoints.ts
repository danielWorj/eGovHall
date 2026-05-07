const baseUrl = 'http://localhost:8080/eHall/api';

const authBaseUrl = `${baseUrl}/auth`;
const etablissementBaseUrl = `${baseUrl}/domaine`;
const acteBaseUrl = `${baseUrl}/declaration`;
const userBaseUrl = `${baseUrl}/user`;

export const eHAllSystemEndPoints ={
    Auth : {
        login : `${authBaseUrl}/login`
    }, 
    Etablissement : {
        all : `${etablissementBaseUrl}/all`, 
        byId : `${etablissementBaseUrl}/byId/`, 
        create : `${etablissementBaseUrl}/create`, 
        update : `${etablissementBaseUrl}/update`, 
        delete : `${etablissementBaseUrl}/delete/`, 
    }, 
    Acte : {
        Declaration : {
            all : `${acteBaseUrl}/all`,
            allByStructure : `${acteBaseUrl}/all/bystructure/`,
            declare : `${acteBaseUrl}/create`
        }
    }, 
    Utilisateur:{
        Sexe : {
            all : `${userBaseUrl}/sexe/all`
        }
    }

}