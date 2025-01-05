import { NgOptimizedImage } from "@angular/common";
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DialogComponent } from "@app-components/helpers/dialog/dialog.component";
import { Course } from "@app-model/course.model";
import { Exercise } from "@app-model/exercise.model";
import { CourseService } from "@app-services/rest-api/model-entities/course/course.service";
import { ExerciseUserInfoService } from "@app-services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";
import { ExerciseService } from "@app-services/rest-api/model-entities/exercise/exercise.service";
import { AddExercisesComponent } from "./add-exercises/add-exercises.component";
import { EnrolledUsersManagementComponent } from "./course-details/enrolled-users-management/enrolled-users-management.component";
import { SharingCodeComponent } from "./course-details/sharing-code/sharing-code.component";

type ExerciseInfoSummary = { exercise: Exercise, notStarted: number, inProgress: number, finished: number };

@Component({
    selector: 'app-teacher-course',
    templateUrl: './teacher-course.component.html',
    imports: [
        AddExercisesComponent,
        EnrolledUsersManagementComponent,
        SharingCodeComponent,

        NgOptimizedImage,
        RouterLink,
        DialogComponent
    ],
    styleUrls: ['./teacher-course.component.scss']
})
export class TeacherCourseComponent implements OnInit {
    public courseId: number | undefined;

    public course: Course | undefined;
    public exercises: ExerciseInfoSummary[] | null;

    public error: boolean;
    @ViewChild("dialog") private dialog!: DialogComponent;

    constructor(private activatedRoute: ActivatedRoute,
                private courseService: CourseService,
                private euiService: ExerciseUserInfoService,
                private exerciseService: ExerciseService) {
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
            newExercises.sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));
        } else {
            this.error = true;
        }
        this.exercises = newExercises;
    }

    public removeExercise(exercise: Exercise): void {
        this.dialog.open({
            title: "Remove exercise",
            message: `Are you sure you want to remove the exercise "${exercise.name}" from the course? <strong>This action cannot be undone.</strong>`,
            buttons: [
                { class: "btn btn-sm btn-outline-secondary", icon: "fa-chevron-left", text: "Cancel", callback: () => this.dialog.close() },
                { class: "btn btn-sm btn-outline-danger", icon: "fa-times", text: "Remove", callback: async () => {
                    await this.exerciseService.deleteExercise(exercise);
                    await this.refreshCourseInformation();
                    this.dialog.close();
                }}
            ]
        });
    }
}
