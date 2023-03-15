import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UrlService {

    // Base URL of REST API
    public baseURL: string;

    constructor(private window: Window) {
        this.baseURL = "//" + this.window.location.hostname;
        if (this.window.location.port) {
            this.baseURL += ":" + "4200";
        }
        this.baseURL += "/api";
    }
}
