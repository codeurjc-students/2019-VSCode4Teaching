import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from "./components/public/index/index.component";
import { AsideComponent } from "./components/layout/aside/aside.component";
import { HeaderComponent } from "./components/layout/header/header.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { LoginComponent } from './components/public/login/login.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpRequestInterceptor } from "./services/rest-api/interceptor/http-request.interceptor";
import { DashboardComponent } from './components/private/common/dashboard/dashboard.component';
import { AuthPersistenceMethodInterface } from "./services/auth/persistence-methods/auth-persistence-method-interface.service";
import { AuthSessionstorage } from "./services/auth/persistence-methods/auth-sessionstorage.class";
import { StudentCourseComponent } from './components/private/student/course/student-course.component';
import { NotStartedExerciseComponent } from "./components/private/student/course/exercise-status/not-started-exercise/not-started-exercise.component";
import { ExerciseStatusComponent } from './components/private/student/course/exercise-status/exercise-status.component';
import { InProgressExerciseComponent } from './components/private/student/course/exercise-status/in-progress-exercise/in-progress-exercise.component';
import { ProgressBarComponent } from './components/helpers/progress-bar/progress-bar.component';
import { DownloadUnzipFilesComponent } from './components/private/student/course/exercise-status/in-progress-exercise/download-unzip-files/download-unzip-files.component';
import { AutoSyncServerComponent } from './components/private/student/course/exercise-status/in-progress-exercise/auto-sync-server/auto-sync-server.component';
import { ExistingFilesDetectedComponent } from './components/private/student/course/exercise-status/in-progress-exercise/existing-files-detected/existing-files-detected.component';
import { FinishedExerciseComponent } from './components/private/student/course/exercise-status/finished-exercise/finished-exercise.component';

@NgModule({
    declarations: [
        AppComponent,

        // layout
        AsideComponent,

        // helpers
        ProgressBarComponent,

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
        AutoSyncServerComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        { provide: AuthPersistenceMethodInterface, useClass: AuthSessionstorage },

        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
        { provide: Window, useValue: window }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
