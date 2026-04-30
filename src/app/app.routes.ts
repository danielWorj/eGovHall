import { Routes } from '@angular/router';

export const routes: Routes = [
    //PLatorme
    {
        path: '',
        loadComponent: () => import('./Features/platform/layout/layout').then(m => m.Layout), 
        children: [
            { 
                path: '', 
                loadComponent: () => import('./Features/platform/acceuil/acceuil').then(m => m.Acceuil) 
            }, 
            { 
                path: 'actes-naissance', 
                loadComponent: () => import('./Features/platform/etat-civil/etat-civil').then(m => m.EtatCivil) 
            },
            { 
                path: 'actes-mariage', 
                loadComponent: () => import('./Features/platform/permis-batir/permis-batir').then(m => m.PermisBatir) 
            },
            { 
                path: 'permis', 
                loadComponent: () => import('./Features/platform/contact/contact').then(m => m.Contact) 
            }
        ]
    }, 
    //ADMIN
    {
     path: 'admin',
     loadComponent: () => import('./Features/Admin/layout/layout').then(m => m.Layout),
     //canActivate: [authGuard],
     children: [
          { 
            path: 'home', 
            loadComponent: () => import('./Features/Admin/home/home').then(m => m.Home) 
          }, 
          { 
            path: 'actes-naissance', 
            loadComponent: () => import('./Features/Admin/acte-naissance/acte-naissance').then(m => m.ActeNaissance) 
          },
          { 
            path: 'actes-mariage', 
            loadComponent: () => import('./Features/Admin/acte-mariage/acte-mariage').then(m => m.ActeMariage) 
          },
          { 
            path: 'permis', 
            loadComponent: () => import('./Features/Admin/permis-batir/permis-batir').then(m => m.PermisBatir) 
          },
          { 
            path: 'paiements', 
            loadComponent: () => import('./Features/Admin/paiements/paiements').then(m => m.Paiements) 
          }
     ]
    }, 
    //Portail 
    {
        path: 'portail-hopital',
        loadComponent: () => import('./Features/Portail/hopital/hopital').then(m => m.Hopital)
    }, 
    {
        path: 'portail-citoyen',
        loadComponent: () => import('./Features/Portail/citoyen/citoyen').then(m => m.Citoyen)
    }
];
