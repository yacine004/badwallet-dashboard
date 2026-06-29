import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-wallet-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, XofPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Recherche &amp; Opérations</h1>
          <p class="page-subtitle">Espace agent — dépôt et retrait sur un portefeuille client</p>
        </div>
      </div>

      <div class="card search-card">
        <div class="search-bar">
          <input class="input" [(ngModel)]="phoneInput" placeholder="+221770000001" (keyup.enter)="search()" />
          <button class="btn btn-primary" (click)="search()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            Rechercher
          </button>
        </div>
      </div>

      <div *ngIf="wallet" class="form-grid">
        <div class="card">
          <div class="card-label">Portefeuille trouvé</div>
          <div class="info-row"><span>Téléphone</span><strong>{{ wallet.phoneNumber }}</strong></div>
          <div class="info-row"><span>Email</span><strong>{{ wallet.email }}</strong></div>
          <div class="info-row"><span>Code</span><strong>{{ wallet.code }}</strong></div>
          <div class="info-row"><span>Solde</span><strong>{{ wallet.balance | xof }}</strong></div>
          <div class="info-row"><span>Devise</span><strong>{{ wallet.currency }}</strong></div>
        </div>

        <div class="card-grid">
          <div class="card op-card">
            <h4 class="op-title">
              <span class="op-icon op-icon-deposit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </span>
              Dépôt
            </h4>
            <form class="form-grid" [formGroup]="depositForm" (ngSubmit)="onDeposit()">
              <input class="input" type="number" formControlName="amount" placeholder="Montant" />
              <select class="select" formControlName="paymentMethod">
                <option value="CREDIT_CARD">Carte bancaire</option>
                <option value="WALLET_TARGET">Wallet</option>
              </select>
              <button class="btn btn-primary" type="submit" [disabled]="depositForm.invalid || loadingDeposit">
                <span class="spinner" *ngIf="loadingDeposit"></span>
                {{ loadingDeposit ? 'Dépôt en cours…' : 'Déposer' }}
              </button>
            </form>
          </div>

          <div class="card op-card">
            <h4 class="op-title">
              <span class="op-icon op-icon-withdraw">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </span>
              Retrait
            </h4>
            <form class="form-grid" [formGroup]="withdrawForm" (ngSubmit)="onWithdraw()">
              <input class="input" type="number" formControlName="amount" placeholder="Montant" />
              <span class="field-hint">Frais : 1% (max 5 000 XOF)</span>
              <button class="btn btn-primary" type="submit" [disabled]="withdrawForm.invalid || loadingWithdraw">
                <span class="spinner" *ngIf="loadingWithdraw"></span>
                {{ loadingWithdraw ? 'Retrait en cours…' : 'Retirer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-bar { display: flex; gap: 12px; }
    .search-bar .input { flex: 1; }
    .info-row { display: flex; justify-content: space-between; padding: 9px 0; border-top: 1px solid var(--color-border); font-size: 0.9rem; color: var(--color-text-secondary); }
    .info-row:first-of-type { border-top: none; margin-top: 10px; }
    .info-row strong { color: var(--color-text); font-weight: 600; }
    .op-title { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; font-size: 1.05rem; }
    .op-icon { width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .op-icon svg { width: 16px; height: 16px; }
    .op-icon-deposit { background: var(--color-success-bg); color: var(--color-success-text); }
    .op-icon-withdraw { background: var(--color-danger-bg); color: var(--color-danger-text); }
  `]
})
export class WalletSearchComponent {
  phoneInput = '';
  wallet: any = null;

  depositForm: FormGroup;
  withdrawForm: FormGroup;

  loadingDeposit = false;
  loadingWithdraw = false;

  constructor(
    private fb: FormBuilder,
    private walletApi: WalletApiService,
    private toast: ToastService
  ) {
    this.depositForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CREDIT_CARD']
    });

    this.withdrawForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  search() {
    this.wallet = null;

    this.walletApi.getWalletByPhone(this.phoneInput).subscribe({
      next: (w) => this.wallet = w
    });
  }

  onDeposit() {
    this.loadingDeposit = true;
    const { amount, paymentMethod } = this.depositForm.value;

    this.walletApi.deposit(this.wallet.id, amount, paymentMethod).subscribe({
      next: (w) => {
        this.wallet = w;
        this.toast.success('Dépôt effectué avec succès.');
        this.depositForm.reset({ paymentMethod: 'CREDIT_CARD' });
        this.loadingDeposit = false;
      },
      error: () => { this.loadingDeposit = false; }
    });
  }

  onWithdraw() {
    this.loadingWithdraw = true;
    const { amount } = this.withdrawForm.value;

    this.walletApi.withdraw(this.wallet.phoneNumber, amount).subscribe({
      next: (w) => {
        this.wallet = w;
        this.toast.success('Retrait effectué avec succès.');
        this.withdrawForm.reset();
        this.loadingWithdraw = false;
      },
      error: () => { this.loadingWithdraw = false; }
    });
  }
}