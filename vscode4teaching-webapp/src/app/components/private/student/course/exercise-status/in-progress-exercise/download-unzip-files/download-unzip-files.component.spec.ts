import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadUnzipFilesComponent } from './download-unzip-files.component';

describe('DownloadUnzipFilesComponent', () => {
  let component: DownloadUnzipFilesComponent;
  let fixture: ComponentFixture<DownloadUnzipFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadUnzipFilesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadUnzipFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
