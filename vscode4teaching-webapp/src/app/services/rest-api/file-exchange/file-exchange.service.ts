import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FileExchangeService {

    constructor(private http: HttpClient) {
    }

    public getOwnProposalByExerciseId = (exerciseId: number): Observable<HttpEvent<Blob>> => {
        return this.http.get("/exercises/" + exerciseId + "/files", {
            observe: "events",
            reportProgress: true,
            responseType: "blob"
        });
    }

    public getAllProposalsByExerciseId = (exerciseId: number): Observable<HttpEvent<Blob>> => {
        return this.http.get("/exercises/" + exerciseId + "/teachers/files", {
            observe: "events",
            reportProgress: true,
            responseType: "blob"
        });
    }

    public getTemplateByExerciseId = (exerciseId: number): Observable<HttpEvent<Blob>> => {
        return this.http.get("/exercises/" + exerciseId + "/files/template", {
            observe: "events",
            reportProgress: true,
            responseType: "blob"
        });
    }

    public getSolutionByExerciseId = (exerciseId: number): Observable<HttpEvent<Blob>> => {
        return this.http.get("/exercises/" + exerciseId + "/files/solution", {
            observe: "events",
            reportProgress: true,
            responseType: "blob"
        });
    }


    // Creation, edition and deletion of single files
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

    public editExerciseSingleFileByExerciseIdRelativePath = (exerciseId: number, relativePath: string, file: Blob) => {
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
