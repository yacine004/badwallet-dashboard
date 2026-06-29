import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly BASE = '/api/wallets';

  constructor(private http: HttpClient) {}

  // Wallets
  getWallets(page = 0, size = 10): Observable<any> {
    return this.http.get<any>(`${this.BASE}?page=${page}&size=${size}`).pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return {
            content: data,
            totalElements: data.length,
            totalPages: 1,
          };
        }
        return {
          content: data.content ?? data.items ?? [],
          totalElements: data.totalElements ?? data.content?.length ?? data.items?.length ?? 0,
          totalPages: data.totalPages ?? Math.ceil((data.totalElements ?? data.content?.length ?? data.items?.length ?? 0) / size) ?? 1,
        };
      })
    );
  }

  createWallet(data: any): Observable<any> {
    return this.http.post<any>(this.BASE, data);
  }

  getWalletByPhone(phone: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/${encodeURIComponent(phone)}`);
  }

  getBalance(phone: string): Observable<number> {
    return this.http.get<number>(`${this.BASE}/${encodeURIComponent(phone)}/balance`);
  }

  // Transactions
  deposit(id: number, amount: number, paymentMethod: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/${id}/deposit`, { amount, paymentMethod });
  }

  withdraw(phoneNumber: string, amount: number): Observable<any> {
    return this.http.post<any>(`${this.BASE}/withdraw`, { phoneNumber, amount });
  }

  transfer(senderPhone: string, receiverPhone: string, amount: number): Observable<any> {
  return this.http.post(`${this.BASE}/transfer`, 
    { senderPhone, receiverPhone, amount },
    { responseType: 'text' }
  );
}

  pay(phoneNumber: string, serviceName: string, amount: number): Observable<any> {
  return this.http.post(`${this.BASE}/pay`, 
    { phoneNumber, serviceName, amount },
    { responseType: 'text' }
  );
}

payFactures(phoneNumber: string, serviceName: string, factureReferences: string[]): Observable<any> {
  return this.http.post(`${this.BASE}/pay-factures`, 
    { phoneNumber, serviceName, factureReferences },
    { responseType: 'text' }
  );
}
  getTransactions(phone: string): Observable<any[]> {
    return this.http.get<any>(`${this.BASE}/${encodeURIComponent(phone)}/transactions`).pipe(
      map((data) => Array.isArray(data) ? data : data.content ?? data.transactions ?? [])
    );
  }
}