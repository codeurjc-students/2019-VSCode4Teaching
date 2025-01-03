import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Course } from "@app-model/course.model";
import { ExerciseUserInfo } from "@app-model/exercise-user-info.model";
import { Exercise } from "@app-model/exercise.model";
import { CourseService } from "@app-services/rest-api/model-entities/course/course.service";
import { ExerciseUserInfoService } from "@app-services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";
import { ExerciseService } from "@app-services/rest-api/model-entities/exercise/exercise.service";
import { WebSocketHandler } from "@app-services/ws/web-socket-handler";
import { WebSocketHandlerFactory } from "@app-services/ws/web-socket-handler-factory.service";
import { GeneralStatisticsComponent } from "./general-statistics/general-statistics.component";
import { StudentsProgressComponent } from "./students-progress/students-progress.component";

type RefreshWSMessage = { handle: "refresh" };

@Component({
    selector: 'app-teacher-exercise',
    imports: [
        GeneralStatisticsComponent,
        StudentsProgressComponent,

        FormsModule,
        RouterLink
    ],
    templateUrl: './teacher-exercise.component.html'
})
export class TeacherExerciseComponent implements OnInit, OnDestroy {
    public courseId: number | undefined;
    public exerciseId: number | undefined;

    public course: Course | undefined;
    public exercise: Exercise | undefined;
    public studentEUIs: ExerciseUserInfo[] | undefined;

    public webSocketConnection!: WebSocketHandler<any>;

    @ViewChild("chart") chart!: ElementRef<HTMLCanvasElement>;

    constructor(private courseService: CourseService,
                private exerciseService: ExerciseService,
                private euiService: ExerciseUserInfoService,
                private wsHandlerFactory: WebSocketHandlerFactory,
                private activatedRoute: ActivatedRoute
    ) {
    }

    async ngOnInit(): Promise<void> {
        this.courseId = parseInt(this.activatedRoute.snapshot.paramMap.get("courseId") ?? "0");
        this.exerciseId = parseInt(this.activatedRoute.snapshot.paramMap.get("exerciseId") ?? "0");

        this.course = await this.courseService.getCourseById(this.courseId, true);
        this.exercise = await this.exerciseService.getExerciseById(this.exerciseId);
        this.studentEUIs = await this.euiService.getAllStudentsExerciseUsersInfoByExercise(this.course.exercises?.find(e => e.id === this.exerciseId) as Exercise);

        this.webSocketConnection = this.wsHandlerFactory.createWebSocketHandler<RefreshWSMessage>({
            request: { url: `/dashboard-refresh`, withCredentials: true },
            onConnection: () => {
            },
            onMessage: async () => {
                this.studentEUIs = await this.euiService.getAllStudentsExerciseUsersInfoByExercise(this.course?.exercises?.find(e => e.id === this.exerciseId) as Exercise);
            },
            onError: (err) => {
                // TODO To be implemented
            }
        });
    }

    public async saveExerciseChanges() {
        if (this.exercise) await this.exerciseService.editExercise(this.exercise);
    }

    ngOnDestroy() {
        this.webSocketConnection.finishWebSocket();
    }
}
