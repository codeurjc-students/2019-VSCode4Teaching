import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class LoggerInterceptor implements HttpInterceptor {

  constructor(private logger: NGXLogger) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.logger.debug(`Request sent to '${request.url}' with request object:`, request);
    return next.handle(request);
  }
}
