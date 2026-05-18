
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const roleGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {

    try {

      const decodedToken: any = jwtDecode(token);
      const roles = decodedToken.role || [];
      const isProfesor = roles.some((r: any) => r.authority === 'ROLE_Profesor');

      if (isProfesor) {
        return true;
      }
      
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  }

  router.navigate(['/login']);
  return false;
};
