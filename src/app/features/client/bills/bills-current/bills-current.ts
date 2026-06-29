import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService } from '../../../../core/services/billing-api.service';
import { WalletApiService } from '../../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../../core/store/balance.store';
import { ToastService } from '../../../../core/services/toast.service';
import { XofPipe } from '../../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-bills-current',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="form-grid">
      <div class="toolbar">
        <select class="select" [(ngModel)]="selectedUnite" (change)="loadFactures()">
          <option value="">Tous les services</option>
          <option value="ISM">ISM</option>
          <option value="WOYAFAL">WOYAFAL</option>
        </select>
        <button class="btn btn-secondary" (click)="loadFactures()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.5 9a8.1 8.1 0 0 1 14.6-3.3M20.5 15a8.1 8.1 0 0 1-14.6 3.3"/>
            <path d="M18 2v5h-5M6 22v-5h5"/>
          </svg>
          Actualiser
        </button>
      </div>

      <div class="table-card" *ngIf="factures.length > 0">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" (change)="toggleAll($event)" /></th>
                <th>Référence</th>
                <th>Service</th>
                <th>Montant</th>
                <th>Mois</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of factures">
                <td>
                  <input type="checkbox"
                    [checked]="isSelected(f)"
                    (change)="toggleSelection(f)"
                    [disabled]="f.statut === 'PAYEE'" />
                </td>
                <td>{{ f.reference }}</td>
                <td>{{ f.unite }}</td>
                <td><strong>{{ f.montant | xof }}</strong></td>
                <td>{{ f.mois | date:'MM/yyyy' }}</td>
                <td>
                  <span [class]="f.statut === 'PAYEE' ? 'badge badge-success' : 'badge badge-danger'">
                    {{ f.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bulk-actions" *ngIf="selected.length > 0">
          <span>{{ selected.length }} facture(s) sélectionnée(s)</span>
          <button class="btn btn-primary btn-sm" (click)="paySelected()" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Paiement...' : 'Payer la sélection' }}
          </button>
        </div>
      </div>

      <div class="table-card empty-state" *ngIf="factures.length === 0 && !loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>
        </svg>
        <span class="empty-state-title">Aucune facture trouvée</span>
      </div>
    </div>
  `,
  styles: [`
    .toolbar .select { width: auto; min-width: 180px; }
    .bulk-actions { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-top: 1px solid var(--color-border); background: #fafbfd; font-size: 0.9rem; color: var(--color-text-secondary); }
  `]
})
export class BillsCurrentComponent implements OnInit {
  factures: any[] = [];
  selected: any[] = [];
  selectedUnite = '';
  loading = false;

  constructor(
    public balanceStore: BalanceStore,
    private billingApi: BillingApiService,
    private walletApi: WalletApiService,
    private toast: ToastService
  ) {
    effect(() => {
      this.factures = this.balanceStore.factures();
    });
  }

  ngOnInit() {}

  loadFactures() {
    if (!this.balanceStore.phone()) return;
    this.loading = true;
    const walletCode = this.getWalletCode();
    this.billingApi.getFacturesCurrent(walletCode, this.selectedUnite).subscribe({
      next: (f) => { this.factures = f; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getWalletCode(): string {
    const phone = this.balanceStore.phone();
    const num = phone.replace('+221770000', '');
    return `WLT-${num.padStart(7, '0')}`;
  }

  isSelected(f: any): boolean {
    return this.selected.some(s => s.reference === f.reference);
  }

  toggleSelection(f: any) {
    if (this.isSelected(f)) {
      this.selected = this.selected.filter(s => s.reference !== f.reference);
    } else {
      this.selected.push(f);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selected = this.factures.filter(f => f.statut === 'IMPAYEE');
    } else {
      this.selected = [];
    }
  }

  paySelected() {
    this.loading = true;
    const references = this.selected.map(f => f.reference);
    const serviceName = this.selected[0]?.unite || 'ISM';

    this.walletApi.payFactures(this.balanceStore.phone(), serviceName, references).subscribe({
      next: (res) => {
        this.toast.success(res || 'Paiement effectué avec succès.');
        this.selected = [];
        this.balanceStore.refresh();
        this.loadFactures();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
