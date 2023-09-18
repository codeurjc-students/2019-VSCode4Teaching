import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingFilesDetectedComponent } from './existing-files-detected.component';

describe('ExistingFilesDetectedComponent', () => {
    let component: ExistingFilesDetectedComponent;
    let fixture: ComponentFixture<ExistingFilesDetectedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExistingFilesDetectedComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ExistingFilesDetectedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
