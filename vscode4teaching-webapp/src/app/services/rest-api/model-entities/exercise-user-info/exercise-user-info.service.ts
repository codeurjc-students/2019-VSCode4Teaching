import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Exercise } from "../../../../model/exercise.model";
import { lastValueFrom } from "rxjs";
import { ExerciseUserInfo } from "../../../../model/exercise-user-info.model";

@Injectable({
  providedIn: 'root'
})
export class ExerciseUserInfoService {
    constructor(private http: HttpClient) {
    }

    // TODO MEJORAR DOCUMENTACIÓN
    // NO SE REQUIEREN NOMBRES DE USUARIO PORQUE LOS SACA EL SERVIDOR DEL TOKEN DE AUTENTICACIÓN, YAS! LA SEGURIDAD A TOPE

    public getExerciseUserInfoByExercise = (exercise: Exercise): Promise<ExerciseUserInfo> => {
        return lastValueFrom(this.http.get<ExerciseUserInfo>(`/exercises/${exercise.id}/info`));
    }


    // SOLO ACTUALIZA STATUS (POR IMPLEMENTACIÓN SERVIDOR)
    public editExerciseUserInfoByExercise = (exercise: Exercise, modifiedExerciseUserInfo: ExerciseUserInfo): Promise<ExerciseUserInfo> => {
        return lastValueFrom(this.http.put<ExerciseUserInfo>(`/exercises/${exercise.id}/info`, { ...modifiedExerciseUserInfo }));
    }

}
