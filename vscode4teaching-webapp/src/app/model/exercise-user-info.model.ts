import { Exercise } from "./exercise.model";
import { User } from "./user.model";

export type ExerciseUserInfoStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export class ExerciseUserInfo {
    private readonly _id: number;
    private readonly _exercise: Exercise;
    private readonly _user: User;
    private _status: ExerciseUserInfoStatus;


    constructor(id: number, exercise: Exercise, user: User, status: ExerciseUserInfoStatus) {
        this._id = id;
        this._exercise = exercise;
        this._user = user;
        this._status = status;
    }

    get id(): number {
        return this._id;
    }

    get exercise(): Exercise {
        return this._exercise;
    }

    get user(): User {
        return this._user;
    }

    get status() {
        return this._status;
    }


    set status(value: ExerciseUserInfoStatus) {
        this._status = value;
    }
}
