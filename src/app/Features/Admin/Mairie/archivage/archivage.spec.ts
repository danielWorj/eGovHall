import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Archivage } from './archivage';

describe('Archivage', () => {
  let component: Archivage;
  let fixture: ComponentFixture<Archivage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Archivage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Archivage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
