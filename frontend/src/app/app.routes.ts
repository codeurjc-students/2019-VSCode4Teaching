import { Routes } from '@angular/router';
import { SignupComponent } from "@app-components/public/signup/signup.component";
import { DashboardComponent } from "./components/private/common/dashboard/dashboard.component";
import { StudentCourseComponent } from "./components/private/student/course/student-course.component";
import { TeacherCourseComponent } from "./components/private/teacher/course/teacher-course.component";
import { TeacherExerciseComponent } from "./components/private/teacher/course/teacher-exercise/teacher-exercise.component";
import { IndexComponent } from "./components/public/index/index.component";
import { LoginComponent } from "./components/public/login/login.component";
import { isLoggedIn, isTeacher } from "./services/auth/guards/guards.service";

export const routes: Routes = [
    // private/common
    { path: "dashboard", component: DashboardComponent, data: { showAside: false }, canActivate: [isLoggedIn] },

    // private/student
    {
        path: "student", canActivate: [isLoggedIn], canActivateChild: [],
        children: [
            { path: "course/:courseId", component: StudentCourseComponent, data: { showAside: false } }
        ]
    },

    // private/teacher
    {
        path: "teacher", canActivate: [isLoggedIn], canActivateChild: [isTeacher],
        children: [
            { path: "courses/:courseId", component: TeacherCourseComponent, data: { showAside: false } },
            { path: "courses/:courseId/exercises/:exerciseId", component: TeacherExerciseComponent, data: { showAside: false } }
        ]
    },

    // public
    { path: "login", component: LoginComponent, data: { showAside: false, showHeader: false } },
    { path: "sign-up", component: SignupComponent, data: { showAside: false, showHeader: true } },
    { path: "", component: IndexComponent, data: { showAside: false } }
];
