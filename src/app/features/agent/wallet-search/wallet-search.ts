import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-wallet-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, XofPipe],
  template: `
    <div class="wallet-search">
      <h2>Recherche & Opérations Agent</h2>

      <div class="search-bar">
        <input [(ngModel)]="phoneInput" placeholder="+221770000001" />
        <button (click)="search()">🔍 Rechercher</button>
      </div>

      <div class="wallet-card" *ngIf="wallet">
        <h3>Portefeuille trouvé</h3>
        <div class="info">
          <span class="label">Téléphone :</span> {{ wallet.phoneNumber }}<br/>
          <span class="label">Email :</span> {{ wallet.email }}<br/>
          <span class="label">Code :</span> {{ wallet.code }}<br/>
          <span class="label">Solde :</span> {{ wallet.balance | xof }}<br/>
          <span class="label">Devise :</span> {{ wallet.currency }}
        </div>

        <div class="operations">
          <!-- Dépôt -->
          <div class="op-card">
            <h4>💰 Dépôt</h4>
            <form [formGroup]="depositForm" (ngSubmit)="onDeposit()">
              <input type="number" formControlName="amount" placeholder="Montant" />
              <select formControlName="paymentMethod">
                <option value="CREDIT_CARD">Carte bancaire</option>
                <option value="WALLET_TARGET">Wallet</option>
              </select>
              <button type="submit" [disabled]="depositForm.invalid || loadingDeposit">
                {{ loadingDeposit ? '...' : 'Déposer' }}
              </button>
            </form>
            <div class="success" *ngIf="depositSuccess">✅ Dépôt effectué !</div>
          </div>

          <!-- Retrait -->
          <div class="op-card">
            <h4>💸 Retrait</h4>
            <form [formGroup]="withdrawForm" (ngSubmit)="onWithdraw()">
              <input type="number" formControlName="amount" placeholder="Montant" />
              <small>Frais : 1% (max 5 000 XOF)</small>
              <button type="submit" [disabled]="withdrawForm.invalid || loadingWithdraw">
                {{ loadingWithdraw ? '...' : 'Retirer' }}
              </button>
            </form>
            <div class="success" *ngIf="withdrawSuccess">✅ Retrait effectué !</div>
            <div class="error" *ngIf="withdrawError">{{ withdrawError }}</div>
          </div>
        </div>
      </div>

      <div class="error" *ngIf="searchError">{{ searchError }}</div>
    </div>
  `,
  styles: [`
    .wallet-search { max-width: 800px; margin: 0 auto; }
    .search-bar { display: flex; gap: 12px; margin: 16px 0; }
    .search-bar input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .search-bar button { padding: 10px 20px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .wallet-card { background: #f5f5f5; padding: 24px; border-radius: 8px; margin-top: 16px; }
    .info { margin: 12px 0 24px; line-height: 2; }
    .label { font-weight: bold; color: #555; }
    .operations { display: flex; gap: 24px; flex-wrap: wrap; }
    .op-card { flex: 1; min-width: 200px; background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h4 { margin: 0 0 12px; color: #1a237e; }
    form { display: flex; flex-direction: column; gap: 8px; }
    input, select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    button { padding: 8px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #9e9e9e; }
    small { color: #888; font-size: 0.8rem; }
    .success { color: green; font-size: 0.85rem; margin-top: 8px; }
    .error { color: red; font-size: 0.85rem; margin-top: 8px; }
  `]
})
export class WalletSearchComponent {
  phoneInput = '';
  wallet: any = null;
  searchError = '';

  depositForm: FormGroup;
  withdrawForm: FormGroup;

  loadingDeposit = false;
  loadingWithdraw = false;
  depositSuccess = false;
  withdrawSuccess = false;
  withdrawError = '';

  constructor(private fb: FormBuilder, private walletApi: WalletApiService) {
    this.depositForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CREDIT_CARD']
    });

    this.withdrawForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  search() {
    this.searchError = '';
    this.wallet = null;
    this.depositSuccess = false;
    this.withdrawSuccess = false;

    this.walletApi.getWalletByPhone(this.phoneInput).subscribe({
      next: (w) => this.wallet = w,
      error: () => this.searchError = 'Wallet introuvable pour ce numéro.'
    });
  }

  onDeposit() {
    this.depositSuccess = false;
    this.loadingDeposit = true;
    const { amount, paymentMethod } = this.depositForm.value;

    this.walletApi.deposit(this.wallet.id, amount, paymentMethod).subscribe({
      next: (w) => {
        this.wallet = w;
        this.depositSuccess = true;
        this.depositForm.reset({ paymentMethod: 'CREDIT_CARD' });
        this.loadingDeposit = false;
      },
      error: () => this.loadingDeposit = false
    });
  }

  onWithdraw() {
    this.withdrawSuccess = false;
    this.withdrawError = '';
    this.loadingWithdraw = true;
    const { amount } = this.withdrawForm.value;

    this.walletApi.withdraw(this.wallet.phoneNumber, amount).subscribe({
      next: (w) => {
        this.wallet = w;
        this.withdrawSuccess = true;
        this.withdrawForm.reset();
        this.loadingWithdraw = false;
      },
      error: (err) => {
        this.withdrawError = err.error || 'Solde insuffisant.';
        this.loadingWithdraw = false;
      }
    });
  }
}