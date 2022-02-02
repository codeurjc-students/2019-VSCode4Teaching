import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TeacherSignUpFormComponent } from "./components/teacher-sign-up-form/teacher-sign-up-form.component";
import { ErrorNotFoundComponent } from "./components/error-not-found/error-not-found.component";
import { IndexComponent } from "./components/index/index.component";

const routes: Routes = [
    { path: "", component: IndexComponent },
    { path: "teacher/sign-up/:tempPassword", component: TeacherSignUpFormComponent },
    { path: "**", component: ErrorNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
