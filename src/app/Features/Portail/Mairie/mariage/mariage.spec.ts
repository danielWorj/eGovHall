import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mariage } from './mariage';

describe('Mariage', () => {
  let component: Mariage;
  let fixture: ComponentFixture<Mariage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mariage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mariage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
