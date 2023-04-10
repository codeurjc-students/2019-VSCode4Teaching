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

@NgModule({
    declarations: [
        AppComponent,

        // layout
        AsideComponent,
        HeaderComponent,

        // public
        IndexComponent,
        LoginComponent,

        // private/common
        DashboardComponent
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
