import { TestBed } from '@angular/core/testing';

import { AsideService } from './aside.service';

describe('AsideService', () => {
  let service: AsideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
