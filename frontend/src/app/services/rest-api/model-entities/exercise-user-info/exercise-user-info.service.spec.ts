import { TestBed } from '@angular/core/testing';

import { ExerciseUserInfoService } from './exercise-user-info.service';

describe('ExerciseUserInfoService', () => {
  let service: ExerciseUserInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseUserInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
