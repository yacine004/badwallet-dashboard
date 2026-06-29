import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSearch } from './wallet-search';

describe('WalletSearch', () => {
  let component: WalletSearch;
  let fixture: ComponentFixture<WalletSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
