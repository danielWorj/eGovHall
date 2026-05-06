import { Routes } from '@angular/router';
import { authGuard } from './Core/Guards/AuthGuard';

export const routes: Routes = [
    //PLatorme
    
    {
        path: 'site',
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
    //ADMIN
    {
     path: 'admin',
     loadComponent: () => import('./Features/Admin/layout/layout').then(m => m.Layout),
     canActivate: [authGuard],
     children: [
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
          }
     ]
    }, 
    // //Portail Citoyen
    // {
    //  path: 'portail-citoyen',
    //  loadComponent: () => import('./Features/Portail/citoyen/layout/layout').then(m => m.Layout),
    //  //canActivate: [authGuard],
    //  children: [
    //       { 
    //         path: 'home', 
    //         loadComponent: () => import('./Features/Admin/Citoyen/dashboard/dashboard').then(m => m.Dashboard) 
    //       }, 
    //       { 
    //         path: 'naissance', 
    //         loadComponent: () => import('./Features/Admin/Citoyen/acte-naissance/acte-naissance').then(m => m.ActeNaissance) 
    //       },
    //       { 
    //         path: 'mariage', 
    //         loadComponent: () => import('./Features/Admin/Citoyen/acte-mariage/acte-mariage').then(m => m.ActeMariage) 
    //       },
    //       { 
    //         path: 'permis', 
    //         loadComponent: () => import('./Features/Admin/Citoyen/permis-batir/permis-batir').then(m => m.PermisBatir) 
    //       },
    //       { 
    //         path: 'paiements', 
    //         loadComponent: () => import('./Features/Admin/Citoyen/mes-paiements/mes-paiements').then(m => m.MesPaiements) 
    //       }
    //  ]
    // },
    // //Portail Mairie
    // {
    //  path: 'portail-mairie',
    //  loadComponent: () => import('./Features/Admin/Mairie/layout/layout').then(m => m.Layout),
    //  //canActivate: [authGuard],
    //  children: [
    //       { 
    //         path: 'home', 
    //         loadComponent: () => import('./Features/Admin/Mairie/dashboard/dashboard').then(m => m.Dashboard) 
    //       }, 
    //       { 
    //         path: 'naissance', 
    //         loadComponent: () => import('./Features/Admin/Mairie/naissance/naissance').then(m => m.Naissance) 
    //       },
    //       { 
    //         path: 'mariage', 
    //         loadComponent: () => import('./Features/Admin/Mairie/mariage/mariage').then(m => m.Mariage) 
    //       },
    //       { 
    //         path: 'permis', 
    //         loadComponent: () => import('./Features/Admin/Mairie/permis-batir/permis-batir').then(m => m.PermisBatir) 
    //       },
    //       { 
    //         path: 'paiements', 
    //         loadComponent: () => import('./Features/Admin/Mairie/paiements/paiements').then(m => m.Paiements) 
    //       },
    //       { 
    //         path: 'documentation', 
    //         loadComponent: () => import('./Features/Admin/Mairie/documentation/documentation').then(m => m.Documentation) 
    //       },
    //       { 
    //         path: 'paiements', 
    //         loadComponent: () => import('./Features/Admin/Mairie/rdv/rdv').then(m => m.Rdv) 
    //       },
    //       { 
    //         path: 'notifications', 
    //         loadComponent: () => import('./Features/Admin/Mairie/notifications/notifications').then(m => m.Notifications) 
    //       }
    //  ]
    // }, 
    {
        path: 'portail-hopital',
        loadComponent: () => import('./Features/Portail/hopital/hopital').then(m => m.Hopital)
    }
];
