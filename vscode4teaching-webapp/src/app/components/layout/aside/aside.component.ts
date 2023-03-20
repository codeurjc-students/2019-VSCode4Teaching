import { Component } from '@angular/core';
import { AsideItem } from "../../../model/aside/aside.model";
import { AsideTeacherCourse, AsideTeacherExercise } from "../../../model/aside/asideTeacher.model";

@Component({
    selector: 'app-layout-aside',
    templateUrl: './aside.component.html',
    styleUrls: ['./aside.component.scss']
})
export class AsideComponent {

    public asideContent: AsideItem[] | undefined;

    constructor() {
        this.asideContent = this.exampleContent;
    }

    public exampleContent: AsideTeacherCourse[] = [
        new AsideTeacherCourse("Spring Boot Course", 2, [
            new AsideTeacherExercise("Exercise 1", 21),
            new AsideTeacherExercise("Exercise 2", 22),
            new AsideTeacherExercise("Exercise 3", 23)
        ]),
        new AsideTeacherCourse("VSCode Course", 3, [
            new AsideTeacherExercise("Exercise 1", 31),
            new AsideTeacherExercise("Exercise 2", 32),
            new AsideTeacherExercise("Exercise 3", 33)
        ])
    ];
}
