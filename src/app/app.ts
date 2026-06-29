import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { XofPipe } from './shared/pipes/xof.pipe';
import { BalanceStore } from './core/store/balance.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, XofPipe, NgIf],
  template: `
    <div class="app">
      <nav class="navbar">
        <div class="nav-brand">💳 BadWallet</div>

        <div class="nav-balance">
          <span *ngIf="balanceStore.phone()">
            Solde : <strong>{{ balanceStore.balance() | xof }}</strong>
          </span>
        </div>

        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/transactions" routerLinkActive="active">Historique</a>
          <a routerLink="/transfer" routerLinkActive="active">Transfert</a>
          <a routerLink="/bills" routerLinkActive="active">Factures</a>
          <a routerLink="/admin/wallets" routerLinkActive="active">Agent</a>
        </div>
      </nav>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app { font-family: Arial, sans-serif; }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1a237e;
      color: white;
      padding: 12px 24px;
    }
    .nav-brand { font-size: 1.4rem; font-weight: bold; }
    .nav-balance { font-size: 1rem; }
    .nav-links { display: flex; gap: 16px; }
    .nav-links a { color: white; text-decoration: none; padding: 6px 12px; border-radius: 4px; }
    .nav-links a.active { background: #3949ab; }
    .content { padding: 24px; }
  `]
})
export class App {
  constructor(public balanceStore: BalanceStore) {}
}