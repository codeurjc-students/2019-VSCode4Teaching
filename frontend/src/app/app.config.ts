import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideRouter, RouterModule } from "@angular/router";
import { AuthPersistenceMethodInterface } from "@app-services/auth/persistence-methods/auth-persistence-method-interface.service";
import { AuthSessionstorage } from "@app-services/auth/persistence-methods/auth-sessionstorage.class";
import { HttpRequestInterceptor } from "@app-services/rest-api/interceptor/http-request.interceptor";
import { UrlService } from "@app-services/url/url.service";
import { WebSocketHandler } from "@app-services/ws/web-socket-handler";
import { WebSocketHandlerFactory } from "@app-services/ws/web-socket-handler-factory.service";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        { provide: RouterModule, useValue: RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }) },

        provideHttpClient(withInterceptorsFromDi()),

        { provide: AuthPersistenceMethodInterface, useClass: AuthSessionstorage },

        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
        { provide: Window, useValue: window },

        { provide: WebSocketHandler, useFactory: WebSocketHandlerFactory, deps: [UrlService, AuthPersistenceMethodInterface] },
    ]
}
