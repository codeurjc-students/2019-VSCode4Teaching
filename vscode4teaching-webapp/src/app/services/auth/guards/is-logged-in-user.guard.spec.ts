import { TestBed } from '@angular/core/testing';

import { IsLoggedInUserGuard } from './is-logged-in-user.guard';

describe('IsLoggedInUserGuard', () => {
  let guard: IsLoggedInUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsLoggedInUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
