import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCreate } from './wallet-create';

describe('WalletCreate', () => {
  let component: WalletCreate;
  let fixture: ComponentFixture<WalletCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
