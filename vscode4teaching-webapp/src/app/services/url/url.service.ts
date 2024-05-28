import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UrlService {

    // Base URL of REST API
    public apiBaseURL: string;

    // Base URL of WebSocket
    public wsBaseURL: string;

    constructor(private window: Window) {
        let baseURL = "//" + this.window.location.hostname;
        if (this.window.location.port) {
            baseURL += ":" + "4200";
        }
        this.wsBaseURL = baseURL;
        this.apiBaseURL = baseURL + "/api";
    }
}
