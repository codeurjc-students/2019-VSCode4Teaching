import * as vscode from "vscode";
import * as WebSocket from "ws";
import { APIClient } from "../client/APIClient";
import { APIClientSession } from "../client/APIClientSession";
import { CurrentUser } from "../client/CurrentUser";
import { Course, instanceOfCourse } from "../model/serverModel/course/Course";
import { Exercise } from "../model/serverModel/exercise/Exercise";
import { ModelUtils } from "../model/serverModel/ModelUtils";

export class FileService {

    public static async initializeExerciseChecking() {
        this.exercises = await this.getUserExercises();
        this.connectWS();
        vscode.workspace.onDidSaveTextDocument((e) => { FileService.updateExercise(e.uri); });
    }

    public static getExerciseInfoFromUri(uri: vscode.Uri) {
        const matches = (this.URI_REGEX.exec(uri.path));
        if (!matches) { return null; }
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
        const filtered = this.exercises.filter((e) =>
            (e as any).course?.name === info?.courseName && e.name === info?.exerciseName,
        );
        // TODO puede que haya repetidos
        const response = await APIClient.getExerciseUserInfo(filtered[0].id);
        console.debug(response);
        const originalStatus = response.data.status;
        const responseEui = APIClient.updateExerciseUserInfo(filtered[0].id, originalStatus, info?.path || "");
        console.debug(responseEui);
        if (info) {
            this.sendNotification(info.courseName);
        }
    }

    private static readonly URI_REGEX: RegExp = /\/v4tdownloads(\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+))$/;
    private static ws: WebSocket | undefined;
    private static exercises: Exercise[] = [];

    private static async getUserExercises() {
        const courses = CurrentUser.getUserInfo().courses;
        if (courses) {
            const exercisesIds = await this.getExercises(courses);
            return exercisesIds;
        }
        return [];
    }

    private static async getExercises(courses: Course[]) {
        const exercises: Exercise[] = [];
        for (let i = 0; i < (courses.length); i++) {
            const local = await this.getExercisesFromCourse(courses[i]);
            exercises.push(...local);
        }
        return exercises;
    }

    private static async getExercisesFromCourse(course: Course): Promise<Exercise[]> {
        if (instanceOfCourse(course)) {
            const exercisesThenable = APIClient.getExercises(course.id);
            try {
                const exercisesData = await exercisesThenable;
                const exercises = exercisesData.data;
                console.debug(exercises);
                return exercises;
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
        return [];
    }

    private static connectWS() {
        const authToken = APIClientSession.jwtToken;
        const wsURL = APIClientSession.baseUrl?.replace("http", "ws");
        this.ws = new WebSocket(`${wsURL}/dashboard-refresh?bearer=${authToken}`);
    }

    private static disconnectWS() {
        if (this.ws != null) {
            this.ws.close();
        }
    }

    private static async sendNotification(courseName: string) {
        const responseCourses = await APIClient.getCourses();
        console.debug(responseCourses);
        const courseId = responseCourses.data.find((c) => c.name === courseName)?.id;
        if (!courseId) { return; }
        const responseUsers = await APIClient.getUsersInCourse(courseId);
        console.debug(responseUsers);
        const teachers: string[] = responseUsers.data.filter((user) => ModelUtils.isTeacher(user)).map((user) => user.username);
        teachers.forEach((username) => this.ws?.send(JSON.stringify({ teacher: username })));
    }
}
