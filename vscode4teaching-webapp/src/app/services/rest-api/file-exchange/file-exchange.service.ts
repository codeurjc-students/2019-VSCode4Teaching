import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from "@angular/common/http";
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

    public createExerciseSingleFileByExerciseIdRelativePath = (exerciseId: number, relativePath: string, file: Blob) => {
        const formData: FormData = new FormData();
        formData.append("relativePath", relativePath);
        formData.append("file", file);
        return this.http.post(`/exercises/${exerciseId}/file`, formData, {
            observe: "events",
            reportProgress: true,
            responseType: "json"
        });
    }

    public modifyExerciseSingleFileByExerciseIdRelativePath = (exerciseId: number, relativePath: string, file: Blob) => {
        const formData: FormData = new FormData();
        formData.append("relativePath", relativePath);
        formData.append("file", file);
        return this.http.patch(`/exercises/${exerciseId}/file`, formData, {
            observe: "events",
            reportProgress: true,
            responseType: "json"
        });
    }

    public deleteExerciseSingleFileByExerciseIdRelativePath = (exerciseId: number, relativePath: string) => {
        return this.http.delete(`/exercises/${exerciseId}/file`, {
            body: { relativePath },
            observe: "events",
            reportProgress: true,
            responseType: "json"
        });
    }
}
