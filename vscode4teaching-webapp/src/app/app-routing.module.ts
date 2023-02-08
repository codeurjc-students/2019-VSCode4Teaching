import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from "./components/public/index/index.component";

const routes: Routes = [
    // public
    { path: "", component: IndexComponent, data: { showAside: false } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
