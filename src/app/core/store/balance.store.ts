import { Injectable, signal, PLATFORM_ID, Inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WalletApiService } from '../services/wallet-api.service';
import { BillingApiService } from '../services/billing-api.service';

@Injectable({ providedIn: 'root' })
export class BalanceStore {
  readonly balance = signal<number>(0);
  readonly phone = signal<string>('');
  readonly transactions = signal<any[]>([]);
  readonly factures = signal<any[]>([]);
  readonly wallets = signal<any[]>([]);
  readonly walletsMeta = signal<{ totalElements: number; totalPages: number; page: number; size: number }>({ totalElements: 0, totalPages: 1, page: 0, size: 10 });

  constructor(
    private api: WalletApiService,
    private billingApi: BillingApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedPhone = sessionStorage.getItem('wallet_phone');
      if (savedPhone) {
        this.phone.set(savedPhone);
        this.refresh();
        this.loadTransactions();
        this.loadFactures();
        this.loadWallets(this.walletsMeta().page, this.walletsMeta().size);
      }
    }

    // reload wallets whenever phone changes
    effect(() => {
      const p = this.phone();
      if (p) {
        this.loadWallets(this.walletsMeta().page, this.walletsMeta().size);
      } else {
        this.wallets.set([]);
        this.walletsMeta.set({ totalElements: 0, totalPages: 1, page: 0, size: this.walletsMeta().size });
      }
    });
  }

  setPhone(phone: string) {
    this.phone.set(phone);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('wallet_phone', phone);
    }
    this.refresh();
    this.loadTransactions();
    this.loadFactures();
    this.loadWallets(this.walletsMeta().page, this.walletsMeta().size);
  }

  refresh() {
    if (this.phone()) {
      this.api.getBalance(this.phone()).subscribe(b => this.balance.set(b));
    }
  }

  loadTransactions() {
    if (!this.phone()) {
      this.transactions.set([]);
      return;
    }
    this.api.getTransactions(this.phone()).subscribe({
      next: (t) => this.transactions.set(t),
      error: () => this.transactions.set([])
    });
  }

  loadFactures() {
    if (!this.phone()) {
      this.factures.set([]);
      return;
    }
    const phone = this.phone();
    const num = phone.replace('+221770000', '');
    const walletCode = `WLT-${num.padStart(7, '0')}`;
    this.billingApi.getFacturesCurrent(walletCode).subscribe({
      next: (f) => this.factures.set(f),
      error: () => this.factures.set([])
    });
  }

  loadWallets(page = 0, size = 10) {
    if (!this.phone()) {
      this.wallets.set([]);
      this.walletsMeta.set({ totalElements: 0, totalPages: 1, page, size });
      return;
    }
    this.api.getWallets(page, size).subscribe({
      next: (d) => {
        this.wallets.set(d.content ?? []);
        this.walletsMeta.set({ totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1, page, size });
      },
      error: () => {
        this.wallets.set([]);
        this.walletsMeta.set({ totalElements: 0, totalPages: 1, page, size });
      }
    });
  }
}