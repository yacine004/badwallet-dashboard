import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/client/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/client/transactions/transactions')
      .then(m => m.TransactionsComponent)
  },
  {
    path: 'transfer',
    loadComponent: () => import('./features/client/transfer/transfer')
      .then(m => m.TransferComponent)
  },
  {
    path: 'bills',
    loadComponent: () => import('./features/client/bills/bills')
      .then(m => m.BillsComponent)
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
