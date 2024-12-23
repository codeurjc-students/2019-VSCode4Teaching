import { TestBed } from '@angular/core/testing';

import { Guards } from './guards.service';

describe('IsLoggedInUserGuard', () => {
  let guard: Guards;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(Guards);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
