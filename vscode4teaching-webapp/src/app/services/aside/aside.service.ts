import { EventEmitter, Injectable } from '@angular/core';
import { CourseService } from "../rest-api/model-entities/course/course.service";
import { ExerciseService } from "../rest-api/model-entities/exercise/exercise.service";
import { CurrentUserService } from "../auth/current-user/current-user.service";
import { ExerciseUserInfoService } from "../rest-api/model-entities/exercise-user-info/exercise-user-info.service";
import { AsideItem, AsideSubitem } from "../../model/aside/aside.model";
import { AsideStudentCourse, AsideStudentExercise } from "../../model/aside/asideStudent.model";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AsideService {

    asideEventEmitter: EventEmitter<AsideItem[]>;

    exerciseUserInfos!: AsideItem[];

    constructor(private courseService: CourseService,
                private exerciseService: ExerciseService,
                private exerciseUserInfoService: ExerciseUserInfoService,
                private curUserService: CurrentUserService,
                private router: Router) {

        this.asideEventEmitter = new EventEmitter<AsideItem[]>();
    }

    /*
     * TODO Hay que replantear la forma en que se utiliza el aside
     *  El problema es que no podemos hacer cosas como un router.navigate con esta forma de hacer las cosas
     *  A lo mejor hay que ser más concreto de alguna forma o especificar el rol a nivel del componente completo porque si no podemos tener problemas
     *  * De todos modos, pregunta, el router.navigate sí que lo debería inyectar bien porque este componente existe siempre (lifecycle)
     *  * * Entonces, ¿por qué falla el router.navigate?
     */


    lanzarBusquedaInfoAside = () => {
        const todoListo: Promise<void> = new Promise(async (resolve, reject): Promise<void> => {
            const currentUser = await this.curUserService.currentUser;
            const asideItems: AsideItem[] = [];
            if (currentUser !== undefined) {
                const courses = await this.courseService.getCoursesByUser(currentUser);
                for (const course of courses) {
                    const asideSubitems: AsideSubitem[] = [];
                    asideItems.push(new AsideStudentCourse(course.name, course.id, asideSubitems, (itemId) => { console.log(itemId) }));

                    for (let exercise of await this.exerciseService.getExercisesByCourseId(course.id)){
                        // const exerciseUserInfo: ExerciseUserInfo = this.exerciseUserInfoService.getExerciseUserInfoByExercise(course);
                        asideSubitems.push(new AsideStudentExercise(exercise.name, exercise.id, "asd", () => {
                            this.router.navigateByUrl(`/exercise/${exercise.id}`, { onSameUrlNavigation: "reload" });
                        }));
                    }
                }
                this.exerciseUserInfos = asideItems;
                resolve();
            } else {
                reject();
            }
        });

        todoListo.then(() => {
            this.asideEventEmitter.emit(this.exerciseUserInfos);
        });
    }
}
