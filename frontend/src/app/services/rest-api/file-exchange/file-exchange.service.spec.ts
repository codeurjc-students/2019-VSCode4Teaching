import { TestBed } from '@angular/core/testing';

import { FileExchangeService } from './file-exchange.service';

describe('FileExchangeService', () => {
  let service: FileExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
