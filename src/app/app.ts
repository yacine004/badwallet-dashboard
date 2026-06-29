import { Component, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { XofPipe } from './shared/pipes/xof.pipe';
import { BalanceStore } from './core/store/balance.store';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, XofPipe, NgIf, NgFor],
  template: `
    <div class="app-shell" [class.sidebar-open]="sidebarOpen()">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
              <circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span class="brand-name">BadWallet</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title">Client</span>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 11.5 12 4l8 7.5"/>
                <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>
              </svg>
              Dashboard
            </a>
            <a routerLink="/transactions" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="8"/>
                <path d="M12 8v4l3 2"/>
              </svg>
              Historique
            </a>
            <a routerLink="/transfer" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h11l-3-3"/>
                <path d="M17 17H6l3 3"/>
              </svg>
              Transfert
            </a>
            <a routerLink="/bills" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3Z"/>
                <path d="M9 8h6M9 12h6M9 16h3"/>
              </svg>
              Factures
            </a>
          </div>

          <div class="nav-section">
            <span class="nav-section-title">Agent</span>

            <a routerLink="/admin/wallets" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="13" rx="2"/>
                <path d="M3 10h18"/>
                <path d="M7 14h2"/>
              </svg>
              Portefeuilles
            </a>
            <a routerLink="/admin/create" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              Créer un wallet
            </a>
            <a routerLink="/admin/search" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
              Recherche &amp; Opérations
            </a>
          </div>
        </nav>
      </aside>

      <div class="sidebar-backdrop" (click)="closeSidebar()"></div>

      <div class="main-area">
        <header class="topbar">
          <button class="menu-toggle" (click)="toggleSidebar()" aria-label="Ouvrir le menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
          </button>

          <div class="topbar-spacer"></div>

          <div class="balance-chip" *ngIf="balanceStore.phone()">
            <span class="balance-chip-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
                <circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <div>
              <div class="balance-chip-label">{{ balanceStore.phone() }}</div>
              <div class="balance-chip-value">{{ balanceStore.balance() | xof }}</div>
            </div>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>

      <div class="toast-stack">
        <div *ngFor="let t of toast.toasts()" [class]="'toast toast-' + t.type">
          <span>{{ t.message }}</span>
          <button class="toast-close" (click)="toast.dismiss(t.id)" aria-label="Fermer">&times;</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100dvh;
      background: var(--color-bg);
    }

    .sidebar {
      width: var(--sidebar-width);
      flex-shrink: 0;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 22px 16px;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 30;
      transition: transform 0.2s ease;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 24px;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-mark svg { width: 19px; height: 19px; }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--color-text);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 22px;
      overflow-y: auto;
    }

    .nav-section { display: flex; flex-direction: column; gap: 2px; }

    .nav-section-title {
      padding: 0 10px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 0.92rem;
      font-weight: 500;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .nav-link svg { width: 18px; height: 18px; flex-shrink: 0; }

    .nav-link:hover { background: var(--color-primary-light); color: var(--color-primary); }

    .nav-link.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 700;
    }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 17, 32, 0.45);
      z-index: 20;
    }

    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      height: var(--topbar-height);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 0 28px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
    }

    .menu-toggle svg { width: 18px; height: 18px; }

    .topbar-spacer { flex: 1; }

    .balance-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
    }

    .balance-chip-icon {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .balance-chip-icon svg { width: 16px; height: 16px; }

    .balance-chip-label { font-size: 0.74rem; color: var(--color-text-secondary); }
    .balance-chip-value { font-size: 0.95rem; font-weight: 700; color: var(--color-primary-dark); }

    .content {
      flex: 1;
      padding: 28px;
    }

    @media (max-width: 960px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: var(--shadow-lg);
      }
      .app-shell.sidebar-open .sidebar { transform: translateX(0); }
      .app-shell.sidebar-open .sidebar-backdrop { display: block; }

      .main-area { margin-left: 0; }
      .menu-toggle { display: flex; }
      .content { padding: 20px; }
      .topbar { padding: 0 16px; }
    }

    @media (max-width: 560px) {
      .balance-chip-label { display: none; }
    }

    .toast-stack {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: 0.88rem;
      font-weight: 500;
      color: #fff;
      animation: toast-in 0.2s ease;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(16px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .toast-success { background: var(--color-success); }
    .toast-error { background: var(--color-danger); }
    .toast-warning { background: var(--color-warning); }
    .toast-info { background: var(--color-info); }

    .toast-close {
      margin-left: auto;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
  `]
})
export class App {
  readonly sidebarOpen = signal(false);

  constructor(public balanceStore: BalanceStore, public toast: ToastService) {}

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}