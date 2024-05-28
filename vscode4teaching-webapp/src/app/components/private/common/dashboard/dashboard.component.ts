import { Component, OnInit } from '@angular/core';
import { CourseService } from "../../../../services/rest-api/model-entities/course/course.service";
import { CurrentUserService } from "../../../../services/auth/current-user/current-user.service";
import { Course } from "../../../../model/course.model";
import { User } from "../../../../model/user.model";
import { Router } from "@angular/router";
import { AsideService } from "../../../../services/aside/aside.service";

@Component({
   selector: 'app-dashboard',
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    userCourses!: Course[];
    curUser!: User;

    coursesLoaded: boolean;

    constructor(private asideService: AsideService,
                private courseService: CourseService,
                private curUserService: CurrentUserService) {
        this.coursesLoaded = false;
    }

    async ngOnInit(): Promise<void> {
        const currentUser = await this.curUserService.currentUser;
        if (currentUser !== undefined) this.curUser = currentUser;

        // TODO PENDIENTE REFACTORIZAR
        // this.asideService.lanzarBusquedaInfoAside();

        this.userCourses = await this.courseService.getCoursesByUser(this.curUser);
        this.coursesLoaded = true;
    }
}
