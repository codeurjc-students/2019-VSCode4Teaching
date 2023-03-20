import { AsideAction, AsideItem, AsideSubitem } from "./aside.model";

export class AsideTeacherCourse implements AsideItem {
    name: string;
    id: number;
    collapsed: boolean;
    subitems: AsideTeacherExercise[];
    actions: AsideAction[];
    callback?: (itemId: number, ...info: string[]) => void;

    constructor(name: string, id: number, subitems: AsideTeacherExercise[], callback?: (itemId: number, ...info: string[]) => void) {
        this.name = name;
        this.id = id;
        this.collapsed = false;
        this.subitems = subitems;

        // TODO Actions to be implemented when course screens are ready
        this.actions = [
            { name: "Get sharing link", icon: "fas fa-share-nodes", callback: (courseId) => console.log(`Sharing Link course ${courseId}`) },
            // { name: "Add exercise", icon: "fas fa-plus", callback: (courseId) => console.log(`Add Exercise course ${courseId}`) },
            // { name: "Add multiple exercises", icon: "fas fa-circle-plus", callback: (courseId) => console.log(`AddMultiple Exercises course ${courseId}`) },
            // { name: "Add users to course", icon: "fas fa-user-plus", callback: (courseId) => console.log(`Add Users course ${courseId}`) },
            // { name: "Remove users from course", icon: "fas fa-user-minus", callback: (courseId) => console.log(`Remove Users course ${courseId}`) },
            { name: "Refresh exercises", icon: "fas fa-rotate-right", callback: (courseId) => console.log(`Refresh course ${courseId}`) },
            { name: "Edit course", icon: "fas fa-pen", callback: (courseId) => console.log(`Edit course ${courseId}`) },
            { name: "Delete course", icon: "fas fa-trash", callback: (courseId) => console.log(`Delete course ${courseId}`) }
        ];
        this.callback = callback;
    }
}

export class AsideTeacherExercise implements AsideSubitem {
    name: string;
    id: number;
    actions: AsideAction[];
    callback: (itemId: number, subitemId: number, ...info: string[]) => any;

    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;

        // TODO Actions to be implemented when course screens are ready
        this.actions = [
            { name: "Open dashboard", icon: "fas fa-dashboard", callback: (courseId: number, exerciseId?: number) => console.log(`Dashboard exercise ${exerciseId} course ${courseId}`) },
            { name: "Edit exercise", icon: "fas fa-pen", callback: (courseId: number, exerciseId? :number) => console.log(`Edit exercise ${exerciseId} course ${courseId}`) },
            { name: "Delete exercise", icon: "fas fa-trash", callback: (courseId: number, exerciseId?: number) => console.log(`Delete exercise ${exerciseId} course ${courseId}`) },
        ];
        this.callback = (courseId, exerciseId) => console.log(`Click exercise ${exerciseId} course ${courseId}`);
    }
}
