import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from "../../url/url.service";
import { AuthPersistenceMethodInterface } from "../../auth/persistence-methods/auth-persistence-method-interface.service";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

    constructor(private authPersistence: AuthPersistenceMethodInterface<string>, private commonURLService: UrlService) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const newRequest = request.clone({
            url: this.commonURLService.apiBaseURL + request.url,
            ...((this.authPersistence.existsUserAuthenticated()) ? {setHeaders: {[this.authPersistence.USER_INFO_ITEM_NAME]: "Bearer " + this.authPersistence.getAuthenticatedUser()}} : {}),
            withCredentials: true
        });

        return next.handle(newRequest);
    }
}
