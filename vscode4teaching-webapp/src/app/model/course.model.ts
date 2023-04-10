import { User } from "./user.model";
import { Exercise } from "./exercise.model";

export class Course {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _creator: User;
    private _exercises: Exercise[];

    constructor(id: number, name: string, creator: User, exercises: Exercise[]) {
        this._id = id;
        this._name = name;
        this._creator = creator;
        this._exercises = exercises;
    }


    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get creator(): User {
        return this._creator;
    }

    get exercises(): Exercise[] {
        return this._exercises;
    }

    set exercises(value: Exercise[]) {
        this._exercises = value;
    }
}
