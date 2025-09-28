import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { PersistenceService } from "../services/persistence.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const persistenceService = inject(PersistenceService);
  const token = persistenceService.get('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
    });
    return next(cloned);
  }

  return next(req);
};
