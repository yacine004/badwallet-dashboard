import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="dashboard">
      <h2>Tableau de bord</h2>

      <div class="phone-input" *ngIf="!balanceStore.phone()">
        <input [(ngModel)]="phoneInput" placeholder="+221770000001" />
        <button (click)="connect()">Connexion</button>
      </div>

      <div class="cards" *ngIf="balanceStore.phone()">
        <div class="card balance-card">
          <div class="label">Solde actuel</div>
          <div class="value">{{ balanceStore.balance() | xof }}</div>
          <div class="phone">{{ balanceStore.phone() }}</div>
          <button (click)="balanceStore.refresh()">🔄 Actualiser</button>
        </div>

        <div class="card info-card">
          <div class="label">Wallet</div>
          <div class="value small">{{ wallet?.code }}</div>
          <div class="detail">{{ wallet?.currency }}</div>
          <div class="detail">{{ wallet?.email }}</div>
        </div>
      </div>

      <div class="error" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 800px; margin: 0 auto; }
    .phone-input { display: flex; gap: 12px; margin: 24px 0; }
    .phone-input input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .phone-input button { padding: 10px 20px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .cards { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 24px; }
    .card { flex: 1; min-width: 200px; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .balance-card { background: #1a237e; color: white; }
    .info-card { background: #f5f5f5; }
    .label { font-size: 0.9rem; opacity: 0.8; }
    .value { font-size: 2rem; font-weight: bold; margin: 8px 0; }
    .value.small { font-size: 1.2rem; }
    .phone { font-size: 0.9rem; opacity: 0.7; }
    .detail { font-size: 0.9rem; color: #555; margin-top: 4px; }
    button { margin-top: 12px; padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .error { color: red; margin-top: 12px; }
  `]
})
export class DashboardComponent implements OnInit {
  phoneInput = '';
  wallet: any = null;
  error = '';

  constructor(
    public balanceStore: BalanceStore,
    private walletApi: WalletApiService
  ) {}

  ngOnInit() {
    if (this.balanceStore.phone()) {
      this.loadWallet();
    }
  }

  connect() {
    if (!this.phoneInput) return;
    this.error = '';
    this.walletApi.getWalletByPhone(this.phoneInput).subscribe({
      next: (w) => {
        this.wallet = w;
        this.balanceStore.setPhone(this.phoneInput);
      },
      error: () => this.error = 'Wallet introuvable pour ce numéro.'
    });
  }

  loadWallet() {
    this.walletApi.getWalletByPhone(this.balanceStore.phone()).subscribe({
      next: (w) => this.wallet = w
    });
  }
}