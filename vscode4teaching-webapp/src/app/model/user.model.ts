import { UserDTO } from "./rest-api/user.dto";
import { Course } from "./course.model";

export class User {
    readonly #id: number;
    readonly #username: string;
    readonly #email: string | undefined;
    readonly #name: string;
    readonly #lastName: string;

    readonly #roles: string[];

    readonly #courses: Course[] | undefined;

    constructor(dto: UserDTO) {
        this.#id = dto.id;
        this.#username = dto.username;
        this.#name = dto.name;
        this.#lastName = dto.lastName;
        this.#email = dto.email ?? undefined;

        this.#roles = dto.roles?.map(roleDefinition => roleDefinition.roleName) ?? [];
        this.#courses = dto.courses?.map(courseDTO => new Course(courseDTO)) ?? undefined;
    }


    get id(): number {
        return this.#id;
    }

    get username(): string {
        return this.#username;
    }

    get email(): string | undefined {
        return this.#email;
    }

    get name(): string {
        return this.#name;
    }

    get lastName(): string {
        return this.#lastName;
    }

    get roles(): string[] {
        return this.#roles;
    }

    get isTeacher(): boolean {
        return this.#roles.includes("ROLE_TEACHER");
    }

    get courses(): Course[] | undefined {
        return this.#courses;
    }

    public toDTO = (): UserDTO => {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            name: this.name,
            lastName: this.lastName,
            roles: this.roles.map(roleName => ({ roleName: roleName })),
            courses: this.courses?.map(course => course.toDTO()) ?? undefined
        };
    }
}
