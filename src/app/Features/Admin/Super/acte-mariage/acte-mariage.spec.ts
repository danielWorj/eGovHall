import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActeMariage } from './acte-mariage';

describe('ActeMariage', () => {
  let component: ActeMariage;
  let fixture: ComponentFixture<ActeMariage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActeMariage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActeMariage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
