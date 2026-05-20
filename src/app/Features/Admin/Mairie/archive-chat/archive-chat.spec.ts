import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveChat } from './archive-chat';

describe('ArchiveChat', () => {
  let component: ArchiveChat;
  let fixture: ComponentFixture<ArchiveChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
