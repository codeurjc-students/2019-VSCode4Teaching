import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthTokenService } from "./auth-token.service";

const TOKEN_HEADER_KEY = "Authorization";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private tokenService: AuthTokenService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.tokenService.isLogged) {
            request = request.clone({
                headers: request.headers.set(TOKEN_HEADER_KEY, "Bearer " + this.tokenService.jwtToken),
            });
        }
        return next.handle(request);
    }
}
