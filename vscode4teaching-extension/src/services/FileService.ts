import * as CryptoJS from 'crypto-js';
import * as vscode from 'vscode';
import { Course, instanceOfCourse } from "../model/serverModel/course/Course";
import { CurrentUser } from '../client/CurrentUser';
import { APIClient } from '../client/APIClient';
import { Exercise } from '../model/serverModel/exercise/Exercise';

export class FileService {

    private static readonly TIME_LAPSE = 5000;
    private static readonly URI_REGEX: RegExp = /\/v4tdownloads\/(.+)\/(.+)\/(.+)\/(.+\/)*(.+)$$/;

    private static exercises: Exercise[] = [];

    public static async initializeExerciseChecking() {
        this.exercises = await this.getUserExercises();
        
        vscode.workspace.onDidSaveTextDocument((e) => FileService.updateExercise(e.uri))
    }

    public static getExerciseInfoFromUri(uri: vscode.Uri) {
        const matches = this.URI_REGEX.exec(uri.path);
        if (!matches) return null;
        return {
            uri: uri.path,
            username: matches[1],
            courseName: matches[2],
            exerciseName: matches[3],
            fileName: matches[matches.length - 1],
        };
    }

    public static async updateExercise(uri: vscode.Uri) {
        const info = this.getExerciseInfoFromUri(uri);
        const filtered = this.exercises.filter(e =>
            (e as any).course?.name === info?.courseName && e.name === info?.exerciseName
        );
        //TODO puede que haya repetidos
        const originalStatus = (await APIClient.getExerciseUserInfo(filtered[0].id)).data.status;
        console.log(originalStatus, filtered[0].id);
        APIClient.updateExerciseUserInfo(filtered[0].id, originalStatus);

    }

    private static async getUserExercises() {
        let courses = CurrentUser.getUserInfo().courses;
        if (courses) {
            let exercisesIds = await this.getExercises(courses);
            return exercisesIds;
        }
        return [];
    }

    private static async getExercises(courses: Course[]) {
        let exercises: Exercise[] = [];
        for (let i = 0; i < (courses.length); i++) {
            let local = await this.getExercisesFromCourse(courses[i]);
            exercises.push(...local);
        }
        return exercises;
    }

    private static async getExercisesFromCourse(course: Course): Promise<Exercise[]> {
        if (instanceOfCourse(course)) {
            const exercisesThenable = APIClient.getExercises(course.id);
            try {
                let exercises = (await exercisesThenable).data;
                return exercises;
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
        return [];
    }

}
