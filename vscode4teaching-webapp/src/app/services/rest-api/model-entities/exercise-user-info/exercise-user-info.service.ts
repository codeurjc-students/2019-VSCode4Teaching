import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Exercise } from "../../../../model/exercise.model";
import { lastValueFrom, map } from "rxjs";
import { ExerciseUserInfoDTO } from "../../../../model/rest-api/exercise-user-info.dto";
import { ExerciseUserInfo } from "../../../../model/exercise-user-info.model";

@Injectable({
    providedIn: 'root'
})
export class ExerciseUserInfoService {
    constructor(private http: HttpClient) {
    }

    public getExerciseUsersInfoByExercise = (exercise: Exercise): Promise<ExerciseUserInfo> => {
        return lastValueFrom(this.http.get<ExerciseUserInfoDTO>(`/exercises/${exercise.id}/info`)
            .pipe(map((euiDTO: ExerciseUserInfoDTO) => new ExerciseUserInfo(euiDTO)))
        );
    }

    public getAllStudentsExerciseUsersInfoByExercise = (exercise: Exercise): Promise<ExerciseUserInfo[]> => {
        return lastValueFrom(this.http.get<ExerciseUserInfoDTO[]>(`/exercises/${exercise.id}/info/teacher`)
            .pipe(map((euiDTOList: ExerciseUserInfoDTO[]) => euiDTOList.map((euiDTO: ExerciseUserInfoDTO) => new ExerciseUserInfo(euiDTO))))
        );
    }

    // Only updates status (all other fields can be edited using other endpoints)
    public editExerciseUserInfoByExercise = (exercise: Exercise, modifiedExerciseUserInfo: ExerciseUserInfo): Promise<ExerciseUserInfo> => {
        const { status, modifiedFiles } = modifiedExerciseUserInfo.toDTO();
        return lastValueFrom(this.http.put<ExerciseUserInfoDTO>(`/exercises/${exercise.id}/info`, { status, modifiedFiles })
            .pipe(map((euiDTO: ExerciseUserInfoDTO) => new ExerciseUserInfo(euiDTO)))
        );
    }
}
