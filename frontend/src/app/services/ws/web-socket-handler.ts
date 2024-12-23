import { HttpParams } from "@angular/common/http";
import { Subscription } from "rxjs";
import { WebSocketSubject } from "rxjs/internal/observable/dom/WebSocketSubject";
import { AuthPersistenceMethodInterface } from "../auth/persistence-methods/auth-persistence-method-interface.service";
import { UrlService } from "../url/url.service";
import { WebSocketParams } from "./web-socket-handler-params.interface";

export class WebSocketHandler<T> {
    #rxWebSocket: WebSocketSubject<T> | undefined;
    #rxWebSocketSubscription: Subscription | undefined;

    constructor(params: WebSocketParams<T>,
                private urlService: UrlService,
                private curUser: AuthPersistenceMethodInterface<string>
    ) {
        this.openWebSocket(params);
    }

    public finishWebSocket() {
        this.#rxWebSocketSubscription?.unsubscribe();
        this.#rxWebSocket?.complete();
    }

    private openWebSocket(params: WebSocketParams<T>) {
        let urlParams = new HttpParams();
        if (params.request.withCredentials) {
            urlParams = urlParams.set("encrypted-bearer", this.curUser.getAuthenticatedUser());
        }

        const currentConnectionURL = `ws:${this.urlService.wsBaseURL}${params.request.url}?${urlParams.toString()}`;
        this.#rxWebSocket = new WebSocketSubject({
            url: currentConnectionURL,
            openObserver: {
                next: params.onConnection,
                ...(params.onError !== undefined) ? { error: params.onError } : {}
            }
        });
        this.#rxWebSocketSubscription = this.#rxWebSocket.subscribe({
            next: params.onMessage,
            ...(params.onError !== undefined) ? { error: params.onError } : {}
        })
    }
}
