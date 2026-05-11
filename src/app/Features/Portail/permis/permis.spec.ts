import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Permis } from './permis';

describe('Permis', () => {
  let component: Permis;
  let fixture: ComponentFixture<Permis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Permis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Permis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
