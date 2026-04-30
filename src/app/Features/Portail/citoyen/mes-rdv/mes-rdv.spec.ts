import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesRDV } from './mes-rdv';

describe('MesRDV', () => {
  let component: MesRDV;
  let fixture: ComponentFixture<MesRDV>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesRDV]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesRDV);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
