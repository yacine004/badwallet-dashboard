import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="transactions">
      <h2>Historique des transactions</h2>

      <div class="alert" *ngIf="!balanceStore.phone()">
        Veuillez d'abord vous connecter depuis le Dashboard.
      </div>

      <div *ngIf="balanceStore.phone()">
        <div class="filters">
          <select [(ngModel)]="selectedType" (change)="applyFilter()">
            <option value="">Tous les types</option>
            <option value="DEPOSIT">Dépôt</option>
            <option value="WITHDRAW">Retrait</option>
            <option value="TRANSFER">Transfert</option>
            <option value="PAYMENT">Paiement</option>
          </select>
          <button (click)="loadTransactions()">🔄 Actualiser</button>
        </div>

        <div class="table-container" *ngIf="filtered.length > 0">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant</th>
                <th>Expéditeur</th>
                <th>Destinataire</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filtered">
                <td>
                  <span [class]="'badge ' + t.type.toLowerCase()">
                    {{ t.type }}
                  </span>
                </td>
                <td>{{ t.amount | xof }}</td>
                <td>{{ t.senderPhone }}</td>
                <td>{{ t.receiverPhone }}</td>
                <td>{{ t.description }}</td>
                <td>{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty" *ngIf="filtered.length === 0 && !loading">
          Aucune transaction trouvée.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transactions { max-width: 1000px; margin: 0 auto; }
    .alert { background: #fff3e0; padding: 12px; border-radius: 4px; color: #e65100; }
    .filters { display: flex; gap: 12px; margin: 16px 0; align-items: center; }
    select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: 8px 16px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a237e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; }
    .badge.deposit { background: #e8f5e9; color: #2e7d32; }
    .badge.withdraw { background: #ffebee; color: #c62828; }
    .badge.transfer { background: #e3f2fd; color: #1565c0; }
    .badge.payment { background: #fff3e0; color: #e65100; }
    .empty { text-align: center; padding: 40px; color: #9e9e9e; }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  filtered: any[] = [];
  selectedType = '';
  loading = false;

  constructor(
    public balanceStore: BalanceStore,
    private walletApi: WalletApiService
  ) {
    effect(() => {
      // subscribe to store transactions signal
      this.transactions = this.balanceStore.transactions();
      if (this.transactions && this.transactions.length > 0) {
        this.applyFilter();
      } else {
        this.filtered = [];
      }
    });
  }

  ngOnInit() {}

  loadTransactions() {
    this.loading = true;
    this.walletApi.getTransactions(this.balanceStore.phone()).subscribe({
      next: (t) => {
        this.transactions = t;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    if (!this.selectedType) {
      this.filtered = this.transactions;
    } else {
      this.filtered = this.transactions.filter(t => t.type === this.selectedType);
    }
  }
}