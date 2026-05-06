import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Naissance } from './naissance';

describe('Naissance', () => {
  let component: Naissance;
  let fixture: ComponentFixture<Naissance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Naissance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Naissance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
