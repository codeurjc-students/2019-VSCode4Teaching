import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UrlService {

    // Base URL of deployed web (same as API without /api)
    public webBaseURL: string;

    // Base URL of REST API
    public apiBaseURL: string;

    // Base URL of WebSocket
    public wsBaseURL: string;

    constructor(private window: Window) {
        let baseURL = "//" + this.window.location.hostname;
        if (this.window.location.port) {
            baseURL += ":" + this.window.location.port;
        }
        this.webBaseURL = this.window.location.protocol + baseURL;
        this.apiBaseURL = this.webBaseURL + "/api";
        this.wsBaseURL = baseURL;
    }
}
