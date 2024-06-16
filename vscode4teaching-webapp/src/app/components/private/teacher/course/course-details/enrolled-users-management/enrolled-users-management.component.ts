import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Modal } from "bootstrap";
import { Course } from "../../../../../../model/course.model";
import { User } from "../../../../../../model/user.model";
import { CurrentUserService } from "../../../../../../services/auth/current-user/current-user.service";
import { CourseService } from "../../../../../../services/rest-api/model-entities/course/course.service";
import { UserService } from "../../../../../../services/rest-api/model-entities/user/user.service";

@Component({
    selector: 'app-teacher-course-details-enrolled-users-management',
    templateUrl: './enrolled-users-management.component.html',
    styleUrls: ['./enrolled-users-management.component.scss']
})
export class EnrolledUsersManagementComponent implements OnInit, AfterViewInit {
    // Course (coming from parent component)
    @Input("course") course?: Course;

    // Event thrown when enrolled users are updated
    @Output("enrolledUsersUpdated") enrolledUsersUpdated = new EventEmitter<void>();

    // Lists of enrolled students and teachers
    public enrolledStudents?: User[];
    public enrolledTeachers?: User[];
    public creator?: User;

    // Current user's username (to check the current user to prevent removing himself from the course)
    public curUserUsername?: string;

    // Available users to enroll (both students and teachers), generated from the difference between all users and enrolled users (refreshEnrollmentData)
    public availableUsers?: User[];
    // Selected user to enroll (coming from the ng-select element in the template)
    public selectedUser?: User;
    // Selected user to remove (coming from pressing the remove button in the template)
    public userToRemove?: User;

    // Elements to manage the main modal
    private enrolledUsersManagementModal!: Modal;
    @ViewChild("enrolledUsersModal") private enrolledUsersManagementModalElementRef!: ElementRef;
    // Elements to manage the remove user confirmation modal
    protected confirmRemoveUserModal!: Modal;
    @ViewChild("confirmUserToRemove") private confirmRemoveUserModalElementRef!: ElementRef;

    constructor(private courseService: CourseService,
                private userService: UserService,
                public curUserService: CurrentUserService
    ) {
    }

    public async ngOnInit(): Promise<void> {
        this.curUserUsername = (await this.curUserService.currentUser)?.username;
    }

    public ngAfterViewInit(): void {
        this.enrolledUsersManagementModal = new Modal(this.enrolledUsersManagementModalElementRef.nativeElement);
        this.confirmRemoveUserModal = new Modal(this.confirmRemoveUserModalElementRef.nativeElement, { backdrop: "static", keyboard: false });
    }


    public openStudentManagementModal(): void {
        if (this.course) {
            this.creator = this.course.creator;
            this.refreshEnrollmentData();
            this.enrolledUsersManagementModal.show();
        }
    }

    public showRemoveUserConfirmation(pickedUser: User): void {
        this.enrolledUsersManagementModal.hide();
        this.userToRemove = pickedUser;
        this.confirmRemoveUserModal.show();
    }

    public hideRemoveUserConfirmation(): void {
        this.confirmRemoveUserModal.hide();
        this.userToRemove = undefined;
        this.enrolledUsersManagementModal.show();
    }


    public async enrollSelectedUser(): Promise<void> {
        if (this.course && this.selectedUser) {
            await this.courseService.addUserToCourse(this.course, this.selectedUser);
            this.enrolledUsersUpdated.emit();
            this.refreshEnrollmentData();
            this.selectedUser = undefined;
        }
    }

    public async removeUser(): Promise<void> {
        if (this.course && this.userToRemove) {
            await this.courseService.removeUserFromCourse(this.course, this.userToRemove);
            this.enrolledUsersUpdated.emit();
            this.refreshEnrollmentData();
            this.userToRemove = undefined;
            this.hideRemoveUserConfirmation();
        }
    }


    private refreshEnrollmentData(): void {
        if (this.course) {
            this.courseService.getEnrolledUsersByCourse(this.course).then(async (users: User[]) => {
                // Students are distinguished from teachers by the isTeacher property
                this.enrolledStudents = users.filter(user => !user.isTeacher).sort((a, b) => a.username.localeCompare(b.username));
                this.enrolledTeachers = users.filter(user => user.isTeacher).sort((a, b) => a.username.localeCompare(b.username));

                // Available users are the difference between all users and enrolled users
                this.availableUsers = (await this.userService.getAllUsers()).filter(user => !users.some(enrolledUser => enrolledUser.id === user.id));
            });
        }
    }
}
