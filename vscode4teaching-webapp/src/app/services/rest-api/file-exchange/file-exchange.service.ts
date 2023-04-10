import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileExchangeService {

    constructor(private http: HttpClient) {
    }

    public getExerciseFilesByExerciseId = (exerciseId: number): Observable<HttpEvent<Blob>> => {
        return this.http.get("/exercises/" + exerciseId + "/files", {
            observe: "events",
            reportProgress: true,
            responseType: "blob"
        });
    }

}
