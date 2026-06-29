import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Transfert d'argent</h1>
          <p class="page-subtitle">Envoyez de l'argent vers un autre wallet BadWallet</p>
        </div>
      </div>

      <div class="card transfer-card">
        <form class="form-grid" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label class="field-label">Numéro destinataire</label>
            <input class="input" formControlName="receiverPhone" placeholder="+221770000002" />
            <span class="field-error" *ngIf="form.get('receiverPhone')?.touched && form.get('receiverPhone')?.invalid">
              Numéro invalide
            </span>
            <span class="field-error" *ngIf="samePhoneError">
              Le destinataire doit être différent de l'expéditeur
            </span>
          </div>

          <div class="field">
            <label class="field-label">Montant (XOF)</label>
            <input class="input" type="number" formControlName="amount" placeholder="5000" />
            <span class="field-error" *ngIf="form.get('amount')?.touched && form.get('amount')?.invalid">
              Montant invalide (minimum 1 XOF)
            </span>
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Envoi en cours…' : 'Envoyer' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .transfer-card { max-width: 460px; margin: 0 auto; }
  `]
})
export class TransferComponent {
  form: FormGroup;
  loading = false;
  samePhoneError = false;

  constructor(
    private fb: FormBuilder,
    public balanceStore: BalanceStore,
    private walletApi: WalletApiService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      receiverPhone: ['', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    this.samePhoneError = false;

    const { receiverPhone, amount } = this.form.value;

    if (receiverPhone === this.balanceStore.phone()) {
      this.samePhoneError = true;
      return;
    }

    this.loading = true;
    this.walletApi.transfer(this.balanceStore.phone(), receiverPhone, amount).subscribe({
      next: (res) => {
        this.toast.success(res || 'Transfert effectué avec succès.');
        this.balanceStore.refresh();
        this.form.reset();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}