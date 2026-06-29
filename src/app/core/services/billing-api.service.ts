import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly BASE = '/api/external/factures';

  constructor(private http: HttpClient) {}

  getFacturesCurrent(walletCode: string, unite?: string): Observable<any[]> {
    let url = `${this.BASE}/${walletCode}/current`;
    if (unite) url += `?unite=${unite}`;
    return this.http.get<any>(url).pipe(
      map((data) => Array.isArray(data) ? data : data.content ?? data.factures ?? [])
    );
  }

  getFacturesByPeriode(walletCode: string, debut: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/${walletCode}/periode?debut=${debut}&fin=${fin}`);
  }
}