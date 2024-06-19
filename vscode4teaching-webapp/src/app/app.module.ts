import { NgOptimizedImage } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from "@ng-select/ng-select";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DelaySinceComponent } from "./components/helpers/delay-since/delay-since.component";
import { NotSupportedFileSystemAccessApiComponent } from './components/helpers/not-supported-file-system-access-api/not-supported-file-system-access-api.component';
import { ProgressBarComponent } from './components/helpers/progress-bar/progress-bar.component';
import { AsideComponent } from "./components/layout/aside/aside.component";
import { HeaderComponent } from "./components/layout/header/header.component";
import { DashboardComponent } from './components/private/common/dashboard/dashboard.component';
import { ExerciseStatusComponent } from './components/private/student/course/exercise-status/exercise-status.component';
import { FinishedExerciseComponent } from './components/private/student/course/exercise-status/finished-exercise/finished-exercise.component';
import { AutoSyncServerComponent } from './components/private/student/course/exercise-status/in-progress-exercise/auto-sync-server/auto-sync-server.component';
import { DownloadUnzipFilesComponent } from './components/private/student/course/exercise-status/in-progress-exercise/download-unzip-files/download-unzip-files.component';
import { ExistingFilesDetectedComponent } from './components/private/student/course/exercise-status/in-progress-exercise/existing-files-detected/existing-files-detected.component';
import { InProgressExerciseComponent } from './components/private/student/course/exercise-status/in-progress-exercise/in-progress-exercise.component';
import { NotStartedExerciseComponent } from "./components/private/student/course/exercise-status/not-started-exercise/not-started-exercise.component";
import { StudentCourseComponent } from './components/private/student/course/student-course.component';
import { SharingCodeComponent } from './components/private/teacher/course/course-details/sharing-code/sharing-code.component';
import { EnrolledUsersManagementComponent } from "./components/private/teacher/course/course-details/enrolled-users-management/enrolled-users-management.component";
import { TeacherCourseComponent } from "./components/private/teacher/course/teacher-course.component";
import { GeneralStatisticsComponent } from './components/private/teacher/course/teacher-exercise/general-statistics/general-statistics.component';
import { IndividualStudentProgressComponent } from './components/private/teacher/course/teacher-exercise/students-progress/individual-student-progress/individual-student-progress.component';
import { StudentsProgressComponent } from './components/private/teacher/course/teacher-exercise/students-progress/students-progress.component';
import { TeacherExerciseComponent } from './components/private/teacher/course/teacher-exercise/teacher-exercise.component';
import { IndexComponent } from "./components/public/index/index.component";
import { LoginComponent } from './components/public/login/login.component';
import { AuthPersistenceMethodInterface } from "./services/auth/persistence-methods/auth-persistence-method-interface.service";
import { AuthSessionstorage } from "./services/auth/persistence-methods/auth-sessionstorage.class";
import { HttpRequestInterceptor } from "./services/rest-api/interceptor/http-request.interceptor";
import { UrlService } from "./services/url/url.service";
import { WebSocketHandler } from "./services/ws/web-socket-handler";
import { WebSocketHandlerFactory } from "./services/ws/web-socket-handler-factory.service";
import { AddExercisesComponent } from './components/private/teacher/course/add-exercises/add-exercises.component';
import { ExerciseDirectoryComponent } from './components/private/teacher/course/add-exercises/exercise-directory/exercise-directory.component';

@NgModule({
    declarations: [
        AppComponent,

        // layout
        AsideComponent,

        // helpers
        ProgressBarComponent,
        NotSupportedFileSystemAccessApiComponent,
        DelaySinceComponent,

        // public
        HeaderComponent,
        IndexComponent,

        // private/common
        LoginComponent,

        // private/student/course
        DashboardComponent,
        StudentCourseComponent,
        ExerciseStatusComponent,
        NotStartedExerciseComponent,
        InProgressExerciseComponent,
        FinishedExerciseComponent,
        DownloadUnzipFilesComponent,
        ExistingFilesDetectedComponent,
        AutoSyncServerComponent,

        // private/teacher/course
        TeacherCourseComponent,
        EnrolledUsersManagementComponent,
        SharingCodeComponent,
        TeacherExerciseComponent,
        GeneralStatisticsComponent,
        StudentsProgressComponent,
        IndividualStudentProgressComponent,
        AddExercisesComponent,
        ExerciseDirectoryComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        NgSelectModule,
        NgOptimizedImage
    ],
    providers: [
        { provide: AuthPersistenceMethodInterface, useClass: AuthSessionstorage },

        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
        { provide: Window, useValue: window },

        { provide: WebSocketHandler, useFactory: WebSocketHandlerFactory, deps: [UrlService, AuthPersistenceMethodInterface] },
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
