import { TestBed } from '@angular/core/testing';

import { PermisService } from './permis-service';

describe('PermisService', () => {
  let service: PermisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
