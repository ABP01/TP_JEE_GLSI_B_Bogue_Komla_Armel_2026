import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expiré ou invalide
                authService.logout();
                router.navigate(['/login']);
            } else if (error.status === 403) {
                // Accès interdit
                console.error('Accès interdit:', error.message);
            } else if (error.status === 0) {
                // Erreur réseau - backend probablement non accessible
                console.error('Erreur réseau: Le backend n\'est pas accessible');
            }

            return throwError(() => error);
        })
    );
};
