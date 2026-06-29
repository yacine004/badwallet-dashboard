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
    <div class="wallet-list">
      <h2>Liste des portefeuilles</h2>

      <div class="pagination-info" *ngIf="wallets.length > 0">
        Total : {{ totalElements }} portefeuilles
      </div>

      <table *ngIf="wallets.length > 0">
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
            <td>{{ w.code }}</td>
            <td>{{ w.balance | xof }}</td>
            <td>{{ w.currency }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button (click)="prevPage()" [disabled]="page === 0">◀ Précédent</button>
        <span>Page {{ page + 1 }} / {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="page >= totalPages - 1">Suivant ▶</button>
      </div>

      <div class="empty" *ngIf="wallets.length === 0 && !loading">
        Aucun portefeuille trouvé.
      </div>
    </div>
  `,
  styles: [`
    .wallet-list { max-width: 1000px; margin: 0 auto; }
    .pagination-info { color: #666; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a237e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .pagination { display: flex; gap: 16px; align-items: center; margin-top: 16px; justify-content: center; }
    button { padding: 8px 16px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #9e9e9e; cursor: not-allowed; }
    .empty { text-align: center; padding: 40px; color: #9e9e9e; }
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