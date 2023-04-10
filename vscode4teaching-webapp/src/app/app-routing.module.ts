import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from "./components/public/index/index.component";
import { LoginComponent } from "./components/public/login/login.component";
import { DashboardComponent } from "./components/private/common/dashboard/dashboard.component";
import { IsLoggedInUserGuard } from "./services/auth/guards/is-logged-in-user.guard";
import { ExerciseComponent } from "./components/private/student/exercise/exercise.component";

const routes: Routes = [
    // private/common
    { path: "dashboard", component: DashboardComponent, data: { } , canActivate: [IsLoggedInUserGuard] },

    // private/student
    { path: "exercise/:exerciseId", component: ExerciseComponent, data: { }, canActivate: [IsLoggedInUserGuard] },

    // public
    { path: "login", component: LoginComponent, data: { showAside: false, showHeader: false } },
    { path: "", component: IndexComponent, data: { showAside: false } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
