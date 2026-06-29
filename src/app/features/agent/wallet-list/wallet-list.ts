import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletApiService } from '../../../core/services/wallet-api.service';
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

  constructor(private walletApi: WalletApiService, public balanceStore: BalanceStore) {
    // reload wallets whenever a user phone is set (user logged in)
    // also keeps existing ngOnInit behavior for first render
    effect(() => {
      if (this.balanceStore.phone()) {
        // reset to first page on user change
        this.page = 0;
        this.loading = true;
        this.balanceStore.loadWallets(this.page, this.size);
      } else {
        // when no user, still load public wallets
        this.loading = true;
        this.balanceStore.loadWallets(this.page, this.size);
      }
    });
  }

  ngOnInit() {
    // initialize from store if available
    this.wallets = this.balanceStore.wallets();
    const meta = this.balanceStore.walletsMeta();
    this.totalElements = meta.totalElements;
    this.totalPages = meta.totalPages;
    // ensure a load for first render
    this.balanceStore.loadWallets(this.page, this.size);
    // react to store updates and clear loading when new data arrives
    effect(() => {
      this.wallets = this.balanceStore.wallets();
      const m = this.balanceStore.walletsMeta();
      this.totalElements = m.totalElements;
      this.totalPages = m.totalPages;
      this.loading = false;
    });
  }

  loadWallets() {
    // keep method for manual refresh but delegate to store
    this.loading = true;
    this.balanceStore.loadWallets(this.page, this.size);
    // loading flag cleared by subscription side-effects; approximate delay
    setTimeout(() => this.loading = false, 800);
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
