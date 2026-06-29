import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Factures</h1>
          <p class="page-subtitle">Consultez et réglez vos factures ISM / WOYAFAL</p>
        </div>
      </div>

      <nav class="tabs">
        <a routerLink="current" routerLinkActive="active" class="tab">Factures courantes</a>
        <a routerLink="history" routerLinkActive="active" class="tab">Historique</a>
      </nav>

      <router-outlet />
    </div>
  `,
  styles: [`
    .tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--color-border); }
    .tab { padding: 10px 16px; font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tab:hover { color: var(--color-primary); }
    .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
  `]
})
export class BillsComponent {}
