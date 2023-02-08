import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TeacherSignUpFormComponent } from "./components/teacher-sign-up-form/teacher-sign-up-form.component";
import { AuthTokenService } from "./services/auth/auth-token.service";
import { AuthInterceptor } from "./services/auth/auth.interceptor";
import { IndexComponent } from "./components/index/index.component";
import { ErrorNotFoundComponent } from "./components/error-not-found/error-not-found.component";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { LoggerInterceptor } from "./services/logger.interceptor";
import { environment } from "src/environments/environment";

@NgModule({
    declarations: [AppComponent, TeacherSignUpFormComponent, IndexComponent, ErrorNotFoundComponent],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        HttpClientXsrfModule,
        LoggerModule.forRoot({
            level: (environment.production) ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
            serverLogLevel: NgxLoggerLevel.OFF
        })
    ],
    providers: [
        AuthTokenService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoggerInterceptor,
            multi: true
        },
        {
            provide: Window,
            useValue: window
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
