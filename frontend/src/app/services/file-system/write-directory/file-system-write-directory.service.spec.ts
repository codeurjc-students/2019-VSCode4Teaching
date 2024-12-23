import { TestBed } from '@angular/core/testing';

import { FileSystemWriteDirectoryService } from './file-system-write-directory.service';

describe('FileSystemWriteDirectoryService', () => {
  let service: FileSystemWriteDirectoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystemWriteDirectoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
