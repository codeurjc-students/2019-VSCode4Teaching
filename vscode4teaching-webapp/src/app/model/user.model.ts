import { HttpClient } from "@angular/common/http";
import { Inject } from "@angular/core";

export class User {
    private readonly _id: number;
    private readonly _username: string;
    private readonly _name: string;
    private readonly _lastName: string;

    private readonly _roles: string[];

    private readonly _courses: any[];

    @Inject(HttpClient)
    private http!: HttpClient;

    constructor(id: number, username: string, name: string, lastName: string) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._lastName = lastName;

        this._roles = [];
        this._courses = [];
    }


    get id(): number {
        return this._id;
    }

    get username(): string {
        return this._username;
    }

    get name(): string {
        return this._name;
    }

    get lastName(): string {
        return this._lastName;
    }

    get roles(): string[] {
        return this._roles;
    }

    get courses(): any[] {
        return this._courses;
    }
}
