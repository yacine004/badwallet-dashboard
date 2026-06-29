import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService } from '../../../core/services/billing-api.service';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../core/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="bills">
      <h2>Factures</h2>

      <div class="alert" *ngIf="!balanceStore.phone()">
        Veuillez d'abord vous connecter depuis le Dashboard.
      </div>

      <div *ngIf="balanceStore.phone()">
        <div class="filters">
          <select [(ngModel)]="selectedUnite" (change)="loadFactures()">
            <option value="">Tous les services</option>
            <option value="ISM">ISM</option>
            <option value="WOYAFAL">WOYAFAL</option>
          </select>
          <button (click)="loadFactures()">🔄 Actualiser</button>
        </div>

        <div class="table-container" *ngIf="factures.length > 0">
          <table>
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
                <td>{{ f.montant | xof }}</td>
                <td>{{ f.mois | date:'MM/yyyy' }}</td>
                <td>
                  <span [class]="f.statut === 'PAYEE' ? 'badge paid' : 'badge unpaid'">
                    {{ f.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions" *ngIf="selected.length > 0">
            <span>{{ selected.length }} facture(s) sélectionnée(s)</span>
            <button (click)="paySelected()" [disabled]="loading">
              {{ loading ? 'Paiement...' : 'Payer la sélection' }}
            </button>
          </div>
        </div>

        <div class="empty" *ngIf="factures.length === 0 && !loading">
          Aucune facture trouvée.
        </div>
      </div>

      <div class="success" *ngIf="success">{{ success }}</div>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .bills { max-width: 900px; margin: 0 auto; }
    .alert { background: #fff3e0; padding: 12px; border-radius: 4px; color: #e65100; }
    .filters { display: flex; gap: 12px; margin: 16px 0; align-items: center; }
    select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: 8px 16px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a237e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; }
    .paid { background: #e8f5e9; color: #2e7d32; }
    .unpaid { background: #ffebee; color: #c62828; }
    .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 4px; }
    .empty { text-align: center; padding: 40px; color: #9e9e9e; }
    .success { color: green; margin-top: 12px; padding: 12px; background: #e8f5e9; border-radius: 4px; }
    .error { color: red; margin-top: 12px; }
  `]
})
export class BillsComponent implements OnInit {
  factures: any[] = [];
  selected: any[] = [];
  selectedUnite = '';
  loading = false;
  success = '';
  error = '';

  constructor(
    public balanceStore: BalanceStore,
    private billingApi: BillingApiService,
    private walletApi: WalletApiService
  ) {
    effect(() => {
      // bind to store factures signal
      this.factures = this.balanceStore.factures();
      if (!this.balanceStore.phone()) {
        this.selected = [];
      }
    });
  }

  ngOnInit() {}

  loadFactures() {
    if (!this.balanceStore.phone()) return;
    this.loading = true;
    const walletCode = this.getWalletCode();
    this.billingApi.getFacturesCurrent(walletCode, this.selectedUnite).subscribe({
      next: (f) => { this.factures = f; this.loading = false; },
      error: () => { this.error = 'Erreur chargement factures.'; this.loading = false; }
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
    this.success = '';
    this.error = '';
    this.loading = true;
    const references = this.selected.map(f => f.reference);
    const serviceName = this.selected[0]?.unite || 'ISM';

    this.walletApi.payFactures(this.balanceStore.phone(), serviceName, references).subscribe({
      next: (res) => {
        this.success = res;
        this.selected = [];
        this.balanceStore.refresh();
        this.loadFactures();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error || 'Erreur paiement.';
        this.loading = false;
      }
    });
  }
}