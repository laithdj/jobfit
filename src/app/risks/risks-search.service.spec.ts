import { TestBed } from '@angular/core/testing';

import { RisksSearchService } from './risks-search.service';

describe('RisksSearchService', () => {
  let service: RisksSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RisksSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
