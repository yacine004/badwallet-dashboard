import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/client/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/client/transactions/transactions')
      .then(m => m.TransactionsComponent)
  },
  {
    path: 'transfer',
    canActivate: [authGuard],
    loadComponent: () => import('./features/client/transfer/transfer')
      .then(m => m.TransferComponent)
  },
  {
    path: 'bills',
    canActivate: [authGuard],
    loadComponent: () => import('./features/client/bills/bills')
      .then(m => m.BillsComponent),
    children: [
      { path: '', redirectTo: 'current', pathMatch: 'full' },
      {
        path: 'current',
        loadComponent: () => import('./features/client/bills/bills-current/bills-current')
          .then(m => m.BillsCurrentComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/client/bills/bills-history/bills-history')
          .then(m => m.BillsHistoryComponent)
      }
    ]
  },
  {
    path: 'admin/wallets',
    loadComponent: () => import('./features/agent/wallet-list/wallet-list')
      .then(m => m.WalletListComponent)
  },
  {
    path: 'admin/create',
    loadComponent: () => import('./features/agent/wallet-create/wallet-create')
      .then(m => m.WalletCreateComponent)
  },
  {
    path: 'admin/search',
    loadComponent: () => import('./features/agent/wallet-search/wallet-search')
      .then(m => m.WalletSearchComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
