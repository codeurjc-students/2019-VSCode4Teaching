import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { DialogComponent } from "@app-components/helpers/dialog/dialog.component";
import { Course } from "@app-model/course.model";
import { User } from "@app-model/user.model";
import { CurrentUserService } from "@app-services/auth/current-user/current-user.service";
import { CourseService } from "@app-services/rest-api/model-entities/course/course.service";
import { UserService } from "@app-services/rest-api/model-entities/user/user.service";
import { NgOptionComponent, NgSelectComponent } from "@ng-select/ng-select";
import { Modal } from "bootstrap";

@Component({
    selector: 'app-teacher-course-details-enrolled-users-management',
    imports: [
        DialogComponent,

        FormsModule,
        NgOptionComponent,
        NgSelectComponent,
    ],
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

    // Dialog helper to show confirmation messages
    @ViewChild("dialog") private dialog!: DialogComponent;

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
    }


    public openStudentManagementModal(): void {
        if (this.course) {
            this.creator = this.course.creator;
            this.refreshEnrollmentData();
            this.enrolledUsersManagementModal.show();
        }
    }

    public showRemoveUserConfirmation(pickedUser: User): void {
        this.userToRemove = pickedUser;
        this.dialog.open({
            title: "Remove user",
            message: `Are you sure you want to remove <strong>${this.userToRemove.name} ${this.userToRemove.lastName}</strong> (${this.userToRemove.username}) from this course?`,
            buttons: [
                {
                    class: "btn btn-sm btn-outline-secondary",
                    icon: "fa-chevron-left",
                    text: "Cancel",
                    callback: () => this.dialog.close()
                },
                {
                    class: "btn btn-sm btn-outline-v4t",
                    icon: "fa-times",
                    text: "Delete",
                    callback: async () => await this.removeUser()
                }
            ],
            parentModal: this.enrolledUsersManagementModal
        });
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
            this.dialog.close();
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
