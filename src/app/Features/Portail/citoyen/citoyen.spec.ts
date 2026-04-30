import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Citoyen } from './citoyen';

describe('Citoyen', () => {
  let component: Citoyen;
  let fixture: ComponentFixture<Citoyen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Citoyen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Citoyen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
