import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../../../../model/course.model";
import { Exercise } from "../../../../model/exercise.model";
import { CourseService } from "../../../../services/rest-api/model-entities/course/course.service";
import { ExerciseUserInfoService } from "../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

type ExerciseInfoSummary = { exercise: Exercise, notStarted: number, inProgress: number, finished: number };

@Component({
    selector: 'app-teacher-course',
    templateUrl: './teacher-course.component.html',
    styleUrls: ['./teacher-course.component.scss']
})
export class TeacherCourseComponent implements OnInit {
    public courseId: number | undefined;
    public course: Course | undefined;

    public exercises: ExerciseInfoSummary[] | null;

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
            await this.refreshCourseInformation();
        } catch (e) {
            this.error = true;
        }
    }

    public async refreshCourseInformation(): Promise<void> {
        const newExercises: ExerciseInfoSummary[] = [];
        if (this.courseId) {
            this.course = await this.courseService.getCourseById(this.courseId, true);
            await Promise.all(
                this.course.exercises?.map(exercise => this.euiService.getAllStudentsExerciseUsersInfoByExercise(exercise).then(euis => {
                        const notStarted = euis.filter(eui => eui.status === "NOT_STARTED").length;
                        const inProgress = euis.filter(eui => eui.status === "IN_PROGRESS").length;
                        const finished = euis.filter(eui => eui.status === "FINISHED").length;
                        newExercises.push({ exercise, notStarted, inProgress, finished });
                    })
                ) ?? []
            );
            newExercises.sort((a, b) => a.exercise.id - b.exercise.id);
        } else {
            this.error = true;
        }
        this.exercises = newExercises;
    }
}
