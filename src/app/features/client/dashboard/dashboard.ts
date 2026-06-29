import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-subtitle">Vue d'ensemble de votre portefeuille BadWallet</p>
        </div>
      </div>

      <div class="card connect-card" *ngIf="!balanceStore.phone()">
        <div class="connect-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
            <circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h3>Connexion à votre wallet</h3>
        <p class="page-subtitle">Entrez votre numéro de téléphone pour accéder à votre solde.</p>
        <div class="connect-form">
          <input class="input" [(ngModel)]="phoneInput" placeholder="+221770000001" (keyup.enter)="connect()" />
          <button class="btn btn-primary" (click)="connect()">Connexion</button>
        </div>
      </div>

      <div class="card-grid" *ngIf="balanceStore.phone()">
        <div class="card balance-card">
          <div class="balance-top">
            <span class="balance-label">Solde actuel</span>
            <button class="icon-btn" (click)="balanceStore.refresh()" aria-label="Actualiser">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.5 9a8.1 8.1 0 0 1 14.6-3.3M20.5 15a8.1 8.1 0 0 1-14.6 3.3"/>
                <path d="M18 2v5h-5M6 22v-5h5"/>
              </svg>
            </button>
          </div>
          <div class="balance-value">{{ balanceStore.balance() | xof }}</div>
          <div class="balance-phone">{{ balanceStore.phone() }}</div>
        </div>

        <div class="card">
          <div class="card-label">Wallet</div>
          <div class="wallet-code">{{ wallet?.code }}</div>
          <div class="info-row"><span>Devise</span><strong>{{ wallet?.currency }}</strong></div>
          <div class="info-row"><span>Email</span><strong>{{ wallet?.email }}</strong></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connect-card { max-width: 420px; margin: 24px auto 0; text-align: center; align-items: center; display: flex; flex-direction: column; gap: 6px; }
    .connect-icon { width: 56px; height: 56px; border-radius: var(--radius-md); background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .connect-icon svg { width: 26px; height: 26px; }
    .connect-form { display: flex; gap: 10px; width: 100%; margin-top: 18px; }
    .connect-form .input { flex: 1; }

    .balance-card { background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: #fff; }
    .balance-top { display: flex; align-items: center; justify-content: space-between; }
    .balance-label { font-size: 0.85rem; opacity: 0.85; }
    .icon-btn { width: 34px; height: 34px; border-radius: var(--radius-sm); border: none; background: rgba(255,255,255,0.16); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .icon-btn svg { width: 16px; height: 16px; }
    .icon-btn:hover { background: rgba(255,255,255,0.28); }
    .balance-value { font-size: 2.1rem; font-weight: 800; margin: 14px 0 4px; letter-spacing: -0.01em; }
    .balance-phone { font-size: 0.85rem; opacity: 0.8; }

    .card-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
    .wallet-code { font-size: 1.3rem; font-weight: 700; margin: 6px 0 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 9px 0; border-top: 1px solid var(--color-border); font-size: 0.9rem; color: var(--color-text-secondary); }
    .info-row strong { color: var(--color-text); font-weight: 600; }
  `]
})
export class DashboardComponent implements OnInit {
  phoneInput = '';
  wallet: any = null;

  constructor(
    public balanceStore: BalanceStore,
    private walletApi: WalletApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (this.balanceStore.phone()) {
      this.loadWallet();
    }
  }

  connect() {
    if (!this.phoneInput) return;
    this.walletApi.getWalletByPhone(this.phoneInput).subscribe({
      next: (w) => {
        this.wallet = w;
        this.balanceStore.setPhone(this.phoneInput);
        this.toast.success('Connexion réussie.');
      }
    });
  }

  loadWallet() {
    this.walletApi.getWalletByPhone(this.balanceStore.phone()).subscribe({
      next: (w) => this.wallet = w
    });
  }
}