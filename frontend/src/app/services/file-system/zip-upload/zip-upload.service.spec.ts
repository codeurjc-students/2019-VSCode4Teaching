import { TestBed } from '@angular/core/testing';

import { ZipUploadService } from './zip-upload.service';

describe('ZipUploadService', () => {
  let service: ZipUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZipUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
