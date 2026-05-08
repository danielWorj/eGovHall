import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HopitalC } from './hopital';

describe('HopitalC', () => {
  let component: HopitalC;
  let fixture: ComponentFixture<HopitalC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HopitalC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HopitalC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
