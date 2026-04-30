import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisBatir } from './permis-batir';

describe('PermisBatir', () => {
  let component: PermisBatir;
  let fixture: ComponentFixture<PermisBatir>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisBatir]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisBatir);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
