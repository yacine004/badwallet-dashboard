import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-wallet-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="wallet-create">
      <h2>Créer un portefeuille</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Numéro de téléphone</label>
          <input formControlName="phoneNumber" placeholder="+221770000001" />
          <span class="error" *ngIf="form.get('phoneNumber')?.touched && form.get('phoneNumber')?.invalid">
            Numéro invalide
          </span>
        </div>

        <div class="field">
          <label>Email</label>
          <input formControlName="email" placeholder="client@gmail.com" />
          <span class="error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
            Email invalide
          </span>
        </div>

        <div class="field">
          <label>Code wallet</label>
          <input formControlName="code" placeholder="WLT-TEST001" />
          <span class="error" *ngIf="form.get('code')?.touched && form.get('code')?.invalid">
            Code requis
          </span>
        </div>

        <div class="field">
          <label>Solde initial (XOF)</label>
          <input type="number" formControlName="initialBalance" placeholder="25000" />
        </div>

        <div class="field">
          <label>Devise</label>
          <select formControlName="currency">
            <option value="XOF">XOF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Création...' : 'Créer le portefeuille' }}
        </button>
      </form>

      <div class="success" *ngIf="success">
        ✅ Portefeuille créé avec succès !
        <pre>{{ created | json }}</pre>
      </div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .wallet-create { max-width: 500px; margin: 0 auto; }
    form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    label { font-weight: bold; color: #333; }
    input, select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button:disabled { background: #9e9e9e; cursor: not-allowed; }
    .error { color: red; font-size: 0.85rem; }
    .error-msg { color: red; margin-top: 12px; }
    .success { color: green; margin-top: 12px; padding: 12px; background: #e8f5e9; border-radius: 4px; }
    pre { font-size: 0.8rem; margin-top: 8px; }
  `]
})
export class WalletCreateComponent {
  form: FormGroup;
  loading = false;
  success = false;
  created: any = null;
  error = '';

  constructor(private fb: FormBuilder, private walletApi: WalletApiService) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required],
      initialBalance: [0],
      currency: ['XOF']
    });
  }

  onSubmit() {
    this.success = false;
    this.error = '';
    this.loading = true;

    this.walletApi.createWallet(this.form.value).subscribe({
      next: (w) => {
        this.created = w;
        this.success = true;
        this.form.reset({ currency: 'XOF', initialBalance: 0 });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error || 'Erreur lors de la création.';
        this.loading = false;
      }
    });
  }
}