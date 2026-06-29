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
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Historique des transactions</h1>
          <p class="page-subtitle">Suivez vos dépôts, retraits, transferts et paiements</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="toolbar">
          <select class="select" [(ngModel)]="selectedType" (change)="applyFilter()">
            <option value="">Tous les types</option>
            <option value="DEPOSIT">Dépôt</option>
            <option value="WITHDRAW">Retrait</option>
            <option value="TRANSFER">Transfert</option>
            <option value="PAYMENT">Paiement</option>
          </select>
          <button class="btn btn-secondary" (click)="loadTransactions()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3.5 9a8.1 8.1 0 0 1 14.6-3.3M20.5 15a8.1 8.1 0 0 1-14.6 3.3"/>
              <path d="M18 2v5h-5M6 22v-5h5"/>
            </svg>
            Actualiser
          </button>
        </div>

        <div class="table-card" *ngIf="filtered.length > 0">
          <div class="table-scroll">
            <table class="data-table">
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
                    <span [class]="'badge ' + badgeClass(t.type)">{{ t.type }}</span>
                  </td>
                  <td><strong>{{ t.amount | xof }}</strong></td>
                  <td>{{ t.senderPhone }}</td>
                  <td>{{ t.receiverPhone }}</td>
                  <td>{{ t.description }}</td>
                  <td>{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-card empty-state" *ngIf="filtered.length === 0 && !loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>
          </svg>
          <span class="empty-state-title">Aucune transaction trouvée</span>
          <span>Les transactions apparaîtront ici une fois effectuées.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar .select { width: auto; min-width: 180px; }
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

  badgeClass(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'badge-success';
      case 'WITHDRAW': return 'badge-danger';
      case 'TRANSFER': return 'badge-info';
      case 'PAYMENT': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }
}