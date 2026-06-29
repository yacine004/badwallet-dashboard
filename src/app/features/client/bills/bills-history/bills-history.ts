import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceStore } from '../../../../core/store/balance.store';
import { XofPipe } from '../../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-bills-history',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    <div class="form-grid">
      <div class="table-card" *ngIf="paidFactures().length > 0">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Service</th>
                <th>Montant</th>
                <th>Mois</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of paidFactures()">
                <td>{{ f.reference }}</td>
                <td>{{ f.unite }}</td>
                <td><strong>{{ f.montant | xof }}</strong></td>
                <td>{{ f.mois | date:'MM/yyyy' }}</td>
                <td><span class="badge badge-success">{{ f.statut }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-card empty-state" *ngIf="paidFactures().length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>
        </svg>
        <span class="empty-state-title">Aucune facture payée pour le moment</span>
      </div>
    </div>
  `
})
export class BillsHistoryComponent {
  constructor(private balanceStore: BalanceStore) {}

  paidFactures = computed(() => this.balanceStore.factures().filter(f => f.statut === 'PAYEE'));
}
