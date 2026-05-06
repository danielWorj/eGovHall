import { Routes } from '@angular/router';
import { authGuard } from './Core/Guards/AuthGuard';

export const routes: Routes = [
    //PLatorme
    
    {
        path: '',
        loadComponent: () => import('./Features/platform/layout/layout').then(m => m.Layout), 
        children: [
           
            { 
                path: 'landing-page', 
                loadComponent: () => import('./Features/platform/acceuil/acceuil').then(m => m.Acceuil) 
            }, 
            { 
                path: 'etat-civil', 
                loadComponent: () => import('./Features/platform/etat-civil/etat-civil').then(m => m.EtatCivil) 
            },
            { 
                path: 'permis', 
                loadComponent: () => import('./Features/platform/permis-batir/permis-batir').then(m => m.PermisBatir) 
            },
            { 
                path: 'contact', 
                loadComponent: () => import('./Features/platform/contact/contact').then(m => m.Contact) 
            }
        ]
    }, 
    { 
        path: 'login', 
        loadComponent: () => import('./Features/Admin/Auth/auth/auth').then(m => m.Auth) 
    }, 
    //ADMIN
    {
     path: 'admin',
     loadComponent: () => import('./Features/Admin/layout/layout').then(m => m.Layout),
     canActivate: [authGuard],
     children: [

      //SUPER ADMIN
          { 
            path: 'home', 
            loadComponent: () => import('./Features/Admin/Super/home/home').then(m => m.Home) 
          }, 
          { 
            path: 'actes-naissance', 
            loadComponent: () => import('./Features/Admin/Super/acte-naissance/acte-naissance').then(m => m.ActeNaissance) 
          },
          { 
            path: 'actes-mariage', 
            loadComponent: () => import('./Features/Admin/Super/acte-mariage/acte-mariage').then(m => m.ActeMariage) 
          },
          { 
            path: 'permis', 
            loadComponent: () => import('./Features/Admin/Super/permis-batir/permis-batir').then(m => m.PermisBatir) 
          },
          { 
            path: 'paiements', 
            loadComponent: () => import('./Features/Admin/Super/paiements/paiements').then(m => m.Paiements) 
          },
          { 
            path: 'utilisateurs', 
            loadComponent: () => import('./Features/Admin/Super/paiements/paiements').then(m => m.Paiements) 
          }, 
       // MAIRIE
          { 
            path: 'mairie-home', 
            loadComponent: () => import('./Features/Admin/Mairie/dashboard/dashboard').then(m => m.Dashboard) 
          }, 
          { 
            path: 'mairie-naissance', 
            loadComponent: () => import('./Features/Admin/Mairie/naissance/naissance').then(m => m.Naissance) 
          },
          { 
            path: 'mairie-mariage', 
            loadComponent: () => import('./Features/Admin/Mairie/mariage/mariage').then(m => m.Mariage) 
          },
          { 
            path: 'mairie-permis', 
            loadComponent: () => import('./Features/Admin/Mairie/permis-batir/permis-batir').then(m => m.PermisBatir) 
          },
          { 
            path: 'mairie-paiements', 
            loadComponent: () => import('./Features/Admin/Mairie/paiements/paiements').then(m => m.Paiements) 
          },
          { 
            path: 'mairie-documentation', 
            loadComponent: () => import('./Features/Admin/Mairie/documentation/documentation').then(m => m.Documentation) 
          },
          { 
            path: 'mairie-rdv', 
            loadComponent: () => import('./Features/Admin/Mairie/rdv/rdv').then(m => m.Rdv) 
          },
          { 
            path: 'mairie-notifications', 
            loadComponent: () => import('./Features/Admin/Mairie/notifications/notifications').then(m => m.Notifications) 
          },
      //CITOYEN
          { 
            path: 'citoyen-home', 
            loadComponent: () => import('./Features/Admin/Citoyen/dashboard/dashboard').then(m => m.Dashboard) 
          }, 
          { 
            path: 'citoyen-naissance', 
            loadComponent: () => import('./Features/Admin/Citoyen/acte-naissance/acte-naissance').then(m => m.ActeNaissance) 
          },
          { 
            path: 'citoyen-mariage', 
            loadComponent: () => import('./Features/Admin/Citoyen/acte-mariage/acte-mariage').then(m => m.ActeMariage) 
          },
          { 
            path: 'citoyen-permis', 
            loadComponent: () => import('./Features/Admin/Citoyen/permis-batir/permis-batir').then(m => m.PermisBatir) 
          },
          { 
            path: 'citoyen-paiements', 
            loadComponent: () => import('./Features/Admin/Citoyen/mes-paiements/mes-paiements').then(m => m.MesPaiements) 
          }

     ]
    }, 
   
    {
        path: 'portail-hopital',
        loadComponent: () => import('./Features/Portail/hopital/hopital').then(m => m.Hopital)
    }
];
