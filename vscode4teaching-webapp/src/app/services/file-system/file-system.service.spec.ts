import { TestBed } from '@angular/core/testing';

import { FileSystemService } from './file-system.service';

describe('FileSystemReaderService', () => {
  let service: FileSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
