import { Component, OnInit } from '@angular/core';
import { CourseService } from "../../../../services/rest-api/course/course.service";
import { CurrentUserService } from "../../../../services/auth/current-user/current-user.service";
import { Course } from "../../../../model/course.model";
import { ExerciseService } from "../../../../services/rest-api/exercise/exercise.service";
import { User } from "../../../../model/user.model";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    courses!: Course[];
    curUser!: User;

    loadingCourseState: 'LOADING_COURSES' | 'LOADING_EXERCISES' | 'LOADED';

    constructor (private courseService: CourseService, private exerciseService: ExerciseService, private curUserService: CurrentUserService) {
        this.loadingCourseState = 'LOADING_COURSES';
    }

    async ngOnInit(): Promise<void> {
        const currentUser = await this.curUserService.currentUser;
        if (currentUser !== undefined) this.curUser = currentUser;

        this.courses = await this.courseService.getCoursesByUser(this.curUser);
        this.loadingCourseState = 'LOADING_EXERCISES';
        for (const course of this.courses) {
            course.exercises = await this.exerciseService.getExercisesByCourseId(course.id);
        }
        this.loadingCourseState = 'LOADED';
    }
}
