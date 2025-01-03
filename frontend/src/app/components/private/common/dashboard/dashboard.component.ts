import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Course } from "@app-model/course.model";
import { ExerciseUserInfoStatus } from "@app-model/exercise-user-info.model";
import { User } from "@app-model/user.model";
import { CurrentUserService } from "@app-services/auth/current-user/current-user.service";
import { CourseService } from "@app-services/rest-api/model-entities/course/course.service";
import { supported as fileSystemAccessApiSupported } from "browser-fs-access";

@Component({
    selector: 'app-dashboard',
    imports: [
        FormsModule,
        RouterLink
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    userCourses!: Course[];
    curUser!: User;

    coursesLoaded: boolean;

    fsaApiSupported: boolean;

    public joinSharingCode!: string;
    public joinStatus: ExerciseUserInfoStatus | "ERROR";

    constructor(private courseService: CourseService,
                private curUserService: CurrentUserService) {
        this.coursesLoaded = false;
        this.fsaApiSupported = fileSystemAccessApiSupported;
        this.joinStatus = "NOT_STARTED";
    }

    public async ngOnInit(): Promise<void> {
        const currentUser = await this.curUserService.currentUser;
        if (currentUser !== undefined) this.curUser = currentUser;

        this.userCourses = await this.courseService.getCoursesByUser(this.curUser);
        this.coursesLoaded = true;
    }

    public async joinCourse(): Promise<void> {
        if (this.joinSharingCode !== undefined) {
            this.joinStatus = "IN_PROGRESS";
            try {
                await this.courseService.joinCourseBySharingCode(this.joinSharingCode);

                this.joinStatus = "FINISHED";
                this.joinSharingCode = "";
                setTimeout(() => this.joinStatus = "NOT_STARTED", 3000);

                await this.ngOnInit();
            } catch (e) {
                this.joinStatus = "ERROR";
                this.joinSharingCode = "";
            }
        }
    }
}
