import { Course } from "./course.model";

export class Exercise {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _course: Course;
    private readonly _includesTeacherSolution: boolean;
    private readonly _solutionIsPublic: boolean;
    private readonly _allowEditionAfterSolutionDownloaded: boolean;


    constructor(id: number, name: string, course: Course, includesTeacherSolution: boolean, solutionIsPublic: boolean, allowEditionAfterSolutionDownloaded: boolean) {
        this._id = id;
        this._name = name;
        this._course = course;
        this._includesTeacherSolution = includesTeacherSolution;
        this._solutionIsPublic = solutionIsPublic;
        this._allowEditionAfterSolutionDownloaded = allowEditionAfterSolutionDownloaded;
    }


    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get course(): Course {
        return this._course;
    }

    get includesTeacherSolution(): boolean {
        return this._includesTeacherSolution;
    }

    get solutionIsPublic(): boolean {
        return this._solutionIsPublic;
    }

    get allowEditionAfterSolutionDownloaded(): boolean {
        return this._allowEditionAfterSolutionDownloaded;
    }
}
