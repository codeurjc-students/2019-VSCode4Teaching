import * as CryptoJS from 'crypto-js';
import * as vscode from 'vscode';
import { Course, instanceOfCourse } from "../model/serverModel/course/Course";
import { CurrentUser } from '../client/CurrentUser';
import { APIClient } from '../client/APIClient';

export class FileService {

    private static readonly TIME_LAPSE = 5000;

    private exercises = [];

    public static initializeExerciseChecking() {
        setInterval(this.checkExercisesStatus, this.TIME_LAPSE);
    }

    private static async checkExercisesStatus() {
        console.log(`Loading exercies to check`);
        let exercises = await getUserExercises();
    }
}


async function getUserExercises() {
    let courses = CurrentUser.getUserInfo().courses;
    if (courses) {
        let exercisesIds = await getExercisesIds(courses);
        console.log(exercisesIds);
    }
    return [];
}

async function getExercisesIds(courses: Course[]) {
    let exercises: number[] = [];
    for (let i = 0; i < (courses.length); i++) {
        let local = await getExercisesIdFromCourse(courses[i]);
        exercises.push(...local);
    }
    return exercises;
}

async function getExercisesIdFromCourse(course: Course): Promise<number[]> {
    if (instanceOfCourse(course)) {
        const exercisesThenable = APIClient.getExercises(course.id);
        try {
            let exercises = (await exercisesThenable).data;
            let localRes: number[] = [];
            exercises.forEach(exercise => {
                localRes.push(exercise.id);
            });
            return localRes;
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }
    return [];
}