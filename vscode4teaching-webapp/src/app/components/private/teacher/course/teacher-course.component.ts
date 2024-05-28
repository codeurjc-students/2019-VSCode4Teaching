import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../../../../model/course.model";
import { ExerciseUserInfo } from "../../../../model/exercise-user-info.model";
import { Exercise } from "../../../../model/exercise.model";
import { CourseService } from "../../../../services/rest-api/model-entities/course/course.service";
import { ExerciseUserInfoService } from "../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

@Component({
    selector: 'app-teacher-course',
    templateUrl: './teacher-course.component.html',
    styleUrls: ['./teacher-course.component.scss']
})
export class TeacherCourseComponent implements OnInit {
    public courseId: number | undefined;
    public course: Course | undefined;

    public exercises: { exercise: Exercise, notStarted: number, inProgress: number, finished: number }[] | null;

    public error: boolean;

    constructor(private activatedRoute: ActivatedRoute,
                private courseService: CourseService,
                private euiService: ExerciseUserInfoService) {
        this.exercises = [];
        this.error = false;
    }


    async ngOnInit(): Promise<void> {
        try {
            this.courseId = parseInt(this.activatedRoute.snapshot.paramMap.get("courseId") ?? "0");
            this.course = await this.courseService.getCourseById(this.courseId, true);

            const exerciseUserInfos: ExerciseUserInfo[][] = await Promise.all(this.course.exercises?.map(exercise => this.euiService.getAllStudentsExerciseUsersInfoByExercise(exercise)) ?? []);
            exerciseUserInfos.forEach((exerciseEuis: ExerciseUserInfo[]) => {
                // Check if EUI exercise is contained in course exercises
                if (this.exercises !== null && this.course?.exercises?.map(e => e.id).includes(exerciseEuis[0].exercise.id)) {
                    const exercise = exerciseEuis[0].exercise;
                    const notStarted = exerciseEuis.filter(eui => eui.status === "NOT_STARTED").length;
                    const inProgress = exerciseEuis.filter(eui => eui.status === "IN_PROGRESS").length;
                    const finished = exerciseEuis.filter(eui => eui.status === "FINISHED").length;
                    this.exercises.push({ exercise, notStarted, inProgress, finished });
                }
            });
        } catch (e) {
            this.error = true;
        }
    }
}
