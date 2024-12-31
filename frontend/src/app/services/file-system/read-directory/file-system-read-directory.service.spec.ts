import { TestBed } from '@angular/core/testing';

import { FileSystemReadDirectoryService } from './file-system-read-directory.service';

describe('FileSystemService', () => {
  let service: FileSystemReadDirectoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystemReadDirectoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
