import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from "./components/public/index/index.component";
import { LoginComponent } from "./components/public/login/login.component";
import { DashboardComponent } from "./components/private/common/dashboard/dashboard.component";
import { IsLoggedInUserGuard } from "./services/auth/guards/is-logged-in-user.guard";
import { StudentCourseComponent } from "./components/private/student/course/student-course.component";

const routes: Routes = [
    // private/common
    { path: "dashboard", component: DashboardComponent, data: { } , canActivate: [IsLoggedInUserGuard] },

    // private/student
    { path: "course/:courseId", component: StudentCourseComponent, data: { showAside: false }, canActivate: [IsLoggedInUserGuard] },

    // public
    { path: "login", component: LoginComponent, data: { showAside: false, showHeader: false } },
    { path: "", component: IndexComponent, data: { showAside: false } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        onSameUrlNavigation: 'reload'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
