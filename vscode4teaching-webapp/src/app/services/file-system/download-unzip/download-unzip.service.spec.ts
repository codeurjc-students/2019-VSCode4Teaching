import { TestBed } from '@angular/core/testing';

import { DownloadUnzipService } from './download-unzip.service';

describe('DownloadUnzipService', () => {
  let service: DownloadUnzipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadUnzipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
