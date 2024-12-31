import { TestBed } from '@angular/core/testing';

import { AuthSessionStorageService } from './auth-sessionstorage.class';

describe('AuthSessionStorageService', () => {
  let service: AuthSessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
