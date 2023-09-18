import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSyncServerComponent } from './auto-sync-server.component';

describe('AutoSyncServerComponent', () => {
  let component: AutoSyncServerComponent;
  let fixture: ComponentFixture<AutoSyncServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoSyncServerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoSyncServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
