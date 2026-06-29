import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BalanceStore } from '../store/balance.store';

export const authGuard: CanActivateFn = () => {
  const balanceStore = inject(BalanceStore);
  const router = inject(Router);

  if (balanceStore.phone()) return true;

  router.navigate(['/dashboard']);
  return false;
};
