import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from "./components/public/index/index.component";
import { AsideComponent } from "./components/layout/aside/aside.component";
import { HeaderComponent } from "./components/layout/header/header.component";

@NgModule({
    declarations: [
        AppComponent,

        // layout
        AsideComponent,
        HeaderComponent,

        // public
        IndexComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
