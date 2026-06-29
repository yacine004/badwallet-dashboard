import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-wallet-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Créer un portefeuille</h1>
          <p class="page-subtitle">Espace agent — enregistrement d'un nouveau wallet client</p>
        </div>
      </div>

      <div class="card create-card">
        <form class="form-grid" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label class="field-label">Numéro de téléphone</label>
            <input class="input" formControlName="phoneNumber" placeholder="+221770000001" />
            <span class="field-error" *ngIf="form.get('phoneNumber')?.touched && form.get('phoneNumber')?.invalid">
              Numéro invalide
            </span>
          </div>

          <div class="field">
            <label class="field-label">Email</label>
            <input class="input" formControlName="email" placeholder="client@gmail.com" />
            <span class="field-error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
              Email invalide
            </span>
          </div>

          <div class="field">
            <label class="field-label">Code wallet</label>
            <input class="input" formControlName="code" placeholder="WLT-TEST001" />
            <span class="field-error" *ngIf="form.get('code')?.touched && form.get('code')?.invalid">
              Code requis
            </span>
          </div>

          <div class="row-2">
            <div class="field">
              <label class="field-label">Solde initial (XOF)</label>
              <input class="input" type="number" formControlName="initialBalance" placeholder="25000" />
            </div>

            <div class="field">
              <label class="field-label">Devise</label>
              <select class="select" formControlName="currency">
                <option value="XOF">XOF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Création...' : 'Créer le portefeuille' }}
          </button>
        </form>

        <div class="alert alert-success created-alert" *ngIf="success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <div>
            Portefeuille créé avec succès !
            <pre>{{ created | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-card { max-width: 520px; margin: 0 auto; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .created-alert { align-items: flex-start; }
    .created-alert pre { font-size: 0.75rem; margin: 8px 0 0; white-space: pre-wrap; }
    .create-card .alert { margin-top: 18px; }
  `]
})
export class WalletCreateComponent {
  form: FormGroup;
  loading = false;
  success = false;
  created: any = null;

  constructor(
    private fb: FormBuilder,
    private walletApi: WalletApiService,
    private toast: ToastService
  ) {
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
    this.loading = true;

    this.walletApi.createWallet(this.form.value).subscribe({
      next: (w) => {
        this.created = w;
        this.success = true;
        this.toast.success('Portefeuille créé avec succès.');
        this.form.reset({ currency: 'XOF', initialBalance: 0 });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}