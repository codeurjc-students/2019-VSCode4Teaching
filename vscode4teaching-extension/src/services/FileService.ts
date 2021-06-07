import * as vscode from 'vscode';
import { Course, instanceOfCourse } from "../model/serverModel/course/Course";
import { CurrentUser } from '../client/CurrentUser';
import { APIClient } from '../client/APIClient';
import { Exercise } from '../model/serverModel/exercise/Exercise';
import { APIClientSession } from '../client/APIClientSession';
import * as WebSocket from 'ws';
import { ModelUtils } from '../model/serverModel/ModelUtils';

export class FileService {

    private static readonly URI_REGEX: RegExp = /\/v4tdownloads\/((.+)\/(.+)\/(.+)\/(.+\/)*(.+))$$/;
    private static ws: WebSocket | undefined;

    private static exercises: Exercise[] = [];

    public static async initializeExerciseChecking() {
        this.exercises = await this.getUserExercises();
        this.connectWS();
        vscode.workspace.onDidSaveTextDocument((e) => { FileService.updateExercise(e.uri) });
    }

    public static getExerciseInfoFromUri(uri: vscode.Uri) {
        const matches = (this.URI_REGEX.exec(uri.path));
        if (!matches) return null;
        matches.shift();
        return {
            uri: uri.path,
            path: matches[0],
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
        APIClient.updateExerciseUserInfo(filtered[0].id, originalStatus, info?.path || '');

        if (info)
            this.sendNotification(info.courseName);
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

    private static connectWS() {
        var authToken = APIClientSession.jwtToken;
        this.ws = new WebSocket(`ws://localhost:8080/dashboard-refresh?bearer=${authToken}`);
    }

    private static disconnectWS() {
        if (this.ws != null) {
            this.ws.close();
        }
    }

    private static async sendNotification(courseName: String) {
        const courseId = (await APIClient.getCourses()).data.find(c => c.name === courseName)?.id;
        if (!courseId) return;
        const teachers: String[] = (await APIClient.getUsersInCourse(courseId)).data.filter(user => ModelUtils.isTeacher(user)).map(user => user.username);
        teachers.forEach(username => this.ws?.send(JSON.stringify({ teacher: username })));
    }
}