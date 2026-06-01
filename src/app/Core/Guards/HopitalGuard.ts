import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hopitalGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const id = localStorage.getItem('id');
  const role = localStorage.getItem('role');
  const etablissement = localStorage.getItem('etablissement');

  const etablissementId = parseInt(etablissement ?? '');

  // ✅ Doit avoir : id, role=2, etablissement valide
  if (
    id &&
    role === '2' &&
    etablissement &&
    etablissement !== 'null' &&
    !isNaN(etablissementId) &&
    etablissementId > 0
  ) {
    return true;
  }

  // Sinon → retour login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};