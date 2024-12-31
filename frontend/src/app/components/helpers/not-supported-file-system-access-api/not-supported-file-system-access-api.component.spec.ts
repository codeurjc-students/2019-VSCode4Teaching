import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotSupportedFileSystemAccessApiComponent } from './not-supported-file-system-access-api.component';

describe('NotSupportedFileSystemAccessApiComponent', () => {
  let component: NotSupportedFileSystemAccessApiComponent;
  let fixture: ComponentFixture<NotSupportedFileSystemAccessApiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotSupportedFileSystemAccessApiComponent]
    });
    fixture = TestBed.createComponent(NotSupportedFileSystemAccessApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
