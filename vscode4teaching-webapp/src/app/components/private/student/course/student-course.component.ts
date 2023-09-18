import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Course } from "../../../../model/course.model";
import { ExerciseUserInfo } from "../../../../model/exercise-user-info.model";
import { CourseService } from "../../../../services/rest-api/model-entities/course/course.service";
import { ExerciseUserInfoService } from "../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

@Component({
  selector: 'app-course',
  templateUrl: './student-course.component.html',
  styleUrls: ['./student-course.component.scss']
})
export class StudentCourseComponent implements OnInit {
    public courseId: number | undefined;
    public course: Course | undefined;

    public euiListsByStatus: { notStarted: ExerciseUserInfo[], inProgress: ExerciseUserInfo[], finished: ExerciseUserInfo[] };

    public courseDirectory: FileSystemDirectoryHandle | undefined;

    public error: boolean;


    constructor(private activatedRoute: ActivatedRoute,
                private courseService: CourseService,
                private euiService: ExerciseUserInfoService) {
        this.courseId = undefined;
        this.course = undefined;

        this.euiListsByStatus = { notStarted: [], inProgress: [], finished: [] };

        this.courseDirectory = undefined;

        this.error = false;
    }


    async ngOnInit(): Promise<void> {
        try {
            this.courseId = parseInt(this.activatedRoute.snapshot.paramMap.get("courseId") ?? "0");
            this.course = await this.courseService.getCourseById(this.courseId, true);

            const exerciseUserInfos = await Promise.all(this.course.exercises.map(exercise => this.euiService.getExerciseUserInfoByExercise(exercise)));
            exerciseUserInfos.forEach(e => {
                switch (e.status) {
                    case "NOT_STARTED":
                        this.euiListsByStatus.notStarted.push(e);
                        break;
                    case "IN_PROGRESS":
                        this.euiListsByStatus.inProgress.push(e);
                        break;
                    case "FINISHED":
                        this.euiListsByStatus.finished.push(e);
                        break;
                }
            });
        } catch (e) {
            this.error = true;
        }
    }

    /**
     * Displays a native operating system window that allows the user to choose a directory and prompts the user to grant read and edit permissions to the browser.
     * On success (the user selects a directory and grants permissions appropriately), the method returns a FileSystemDirectoryHandle that points to the directory and is stored in courseDirectory.
     * Otherwise, the directory value will remain as assigned (whether previously known or not).
     */
    public async pickCourseLocalDirectory(): Promise<void> {
        try {
            this.courseDirectory = await showDirectoryPicker({ mode: 'readwrite' });
        } catch (e) { }
    }

    /**
     * When any exercise communicates a status change to the server, it is necessary to modify the UI to introduce its graphical representation in the appropriate section.
     * To do this, the exercise is searched for in the status-segregated lists and repositioned.
     *
     * @param eui Exercise User Info
     */
    public exerciseStatusChanged(eui: ExerciseUserInfo) {
        const posNotStarted = this.euiListsByStatus.notStarted.findIndex(nseui => nseui.id === eui.id);
        const posInProgress = this.euiListsByStatus.inProgress.findIndex(ipeui => ipeui.id === eui.id);
        const posFinished = this.euiListsByStatus.finished.findIndex(feui => feui.id === eui.id);

        if (posNotStarted > -1) this.euiListsByStatus.notStarted.splice(posNotStarted, 1);
        if (posInProgress > -1) this.euiListsByStatus.inProgress.splice(posInProgress, 1);
        if (posFinished > -1) this.euiListsByStatus.finished.splice(posFinished, 1);

        if (eui.status === "NOT_STARTED") this.euiListsByStatus.notStarted.push(eui);
        if (eui.status === "IN_PROGRESS") this.euiListsByStatus.inProgress.push(eui);
        if (eui.status === "FINISHED") this.euiListsByStatus.finished.push(eui);
    }
}
