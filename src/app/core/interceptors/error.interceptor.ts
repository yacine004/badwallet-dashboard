import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

function extractMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim()) return error.error;
  if (error.error?.message) return error.error.message;
  if (error.status === 0) return 'Impossible de contacter le serveur.';
  return 'Une erreur est survenue.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toast.error(extractMessage(error));
      return throwError(() => error);
    })
  );
};
