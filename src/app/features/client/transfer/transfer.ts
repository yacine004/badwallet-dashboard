import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="transfer">
      <h2>Transfert d'argent</h2>

      <div class="alert" *ngIf="!balanceStore.phone()">
        Veuillez d'abord vous connecter depuis le Dashboard.
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="balanceStore.phone()">
        <div class="field">
          <label>Numéro destinataire</label>
          <input formControlName="receiverPhone" placeholder="+221770000002" />
          <span class="error" *ngIf="form.get('receiverPhone')?.touched && form.get('receiverPhone')?.invalid">
            Numéro invalide
          </span>
          <span class="error" *ngIf="samePhoneError">
            Le destinataire doit être différent de l'expéditeur
          </span>
        </div>

        <div class="field">
          <label>Montant (XOF)</label>
          <input type="number" formControlName="amount" placeholder="5000" />
          <span class="error" *ngIf="form.get('amount')?.touched && form.get('amount')?.invalid">
            Montant invalide (minimum 1 XOF)
          </span>
        </div>

        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'En cours...' : 'Envoyer' }}
        </button>
      </form>

      <div class="success" *ngIf="success">{{ success }}</div>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .transfer { max-width: 500px; margin: 0 auto; }
    .alert { background: #fff3e0; padding: 12px; border-radius: 4px; color: #e65100; }
    form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    label { font-weight: bold; color: #333; }
    input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button:disabled { background: #9e9e9e; cursor: not-allowed; }
    .error { color: red; font-size: 0.85rem; }
    .success { color: green; margin-top: 12px; padding: 12px; background: #e8f5e9; border-radius: 4px; }
  `]
})
export class TransferComponent {
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  samePhoneError = false;

  constructor(
    private fb: FormBuilder,
    public balanceStore: BalanceStore,
    private walletApi: WalletApiService
  ) {
    this.form = this.fb.group({
      receiverPhone: ['', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    this.success = '';
    this.error = '';
    this.samePhoneError = false;

    const { receiverPhone, amount } = this.form.value;

    if (receiverPhone === this.balanceStore.phone()) {
      this.samePhoneError = true;
      return;
    }

    this.loading = true;
    this.walletApi.transfer(this.balanceStore.phone(), receiverPhone, amount).subscribe({
      next: (res) => {
        this.success = res;
        this.balanceStore.refresh();
        this.form.reset();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error || 'Erreur lors du transfert.';
        this.loading = false;
      }
    });
  }
}