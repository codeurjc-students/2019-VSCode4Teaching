import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrolledUsersManagementComponent } from './enrolled-users-management.component';

describe('StudentManagementComponent', () => {
  let component: EnrolledUsersManagementComponent;
  let fixture: ComponentFixture<EnrolledUsersManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnrolledUsersManagementComponent]
    });
    fixture = TestBed.createComponent(EnrolledUsersManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
