import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceStore } from '../../../core/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Portefeuilles</h1>
          <p class="page-subtitle" *ngIf="wallets.length > 0">{{ totalElements }} portefeuille(s) enregistré(s)</p>
        </div>
      </div>

      <div class="table-card" *ngIf="wallets.length > 0">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Code</th>
                <th>Solde</th>
                <th>Devise</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let w of wallets">
                <td>{{ w.id }}</td>
                <td>{{ w.phoneNumber }}</td>
                <td>{{ w.email }}</td>
                <td><span class="badge badge-neutral">{{ w.code }}</span></td>
                <td><strong>{{ w.balance | xof }}</strong></td>
                <td>{{ w.currency }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn btn-secondary btn-sm" (click)="prevPage()" [disabled]="page === 0">◀ Précédent</button>
          <span>Page {{ page + 1 }} / {{ totalPages }}</span>
          <button class="btn btn-secondary btn-sm" (click)="nextPage()" [disabled]="page >= totalPages - 1">Suivant ▶</button>
        </div>
      </div>

      <div class="table-card empty-state" *ngIf="wallets.length === 0 && !loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 14h2"/>
        </svg>
        <span class="empty-state-title">Aucun portefeuille trouvé</span>
      </div>
    </div>
  `,
  styles: [`
    .pagination { border-top: 1px solid var(--color-border); }
  `]
})
export class WalletListComponent implements OnInit {
  wallets: any[] = [];
  totalElements = 0;
  totalPages = 0;
  page = 0;
  size = 10;
  loading = false;

  constructor(public balanceStore: BalanceStore) {
    effect(() => {
      this.wallets = this.balanceStore.wallets();
      const m = this.balanceStore.walletsMeta();
      this.totalElements = m.totalElements;
      this.totalPages = m.totalPages;
      this.loading = false;
    });
  }

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.loading = true;
    this.balanceStore.loadWallets(this.page, this.size);
  }

  nextPage() {
    this.page++;
    this.loadWallets();
  }

  prevPage() {
    this.page--;
    this.loadWallets();
  }
}
