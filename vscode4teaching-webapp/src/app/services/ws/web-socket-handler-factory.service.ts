import { Injectable } from "@angular/core";
import { AuthPersistenceMethodInterface } from "../auth/persistence-methods/auth-persistence-method-interface.service";
import { UrlService } from "../url/url.service";
import { WebSocketParams } from "./web-socket-handler-params.interface";
import { WebSocketHandler } from "./web-socket-handler";

@Injectable({
    providedIn: "root"
})
export class WebSocketHandlerFactory {
    constructor(private urlService: UrlService,
                private curUser: AuthPersistenceMethodInterface<string>
    ) {
    }

    public createWebSocketHandler<T>(params: WebSocketParams<T>) {
        return new WebSocketHandler(params, this.urlService, this.curUser);
    }
}
