(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _student_student_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./student/student.component */ "./src/app/student/student.component.ts");
/* harmony import */ var _teacher_teacher_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./teacher/teacher.component */ "./src/app/teacher/teacher.component.ts");
/* harmony import */ var _home_main_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./home/main.component */ "./src/app/home/main.component.ts");






var routes = [{ path: "concept/:id", component: _student_student_component__WEBPACK_IMPORTED_MODULE_3__["StudentComponent"] },
    { path: "teacher/:id", component: _teacher_teacher_component__WEBPACK_IMPORTED_MODULE_4__["TeacherComponent"] },
    { path: "", component: _home_main_component__WEBPACK_IMPORTED_MODULE_5__["ChapterComponent"] }];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<header></header>\r\n<router-outlet></router-outlet>\r\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


/**
 * Entry point of frontend
 */
var AppComponent = /** @class */ (function () {
    function AppComponent() {
    }
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html")
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm5/table.es5.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm5/icon.es5.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/tabs */ "./node_modules/@angular/material/esm5/tabs.es5.js");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm5/list.es5.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm5/divider.es5.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/paginator */ "./node_modules/@angular/material/esm5/paginator.es5.js");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/radio */ "./node_modules/@angular/material/esm5/radio.es5.js");
/* harmony import */ var _covalent_core_layout__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @covalent/core/layout */ "./node_modules/@covalent/core/fesm5/covalent-core-layout.js");
/* harmony import */ var _covalent_core_steps__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @covalent/core/steps */ "./node_modules/@covalent/core/fesm5/covalent-core-steps.js");
/* harmony import */ var _covalent_core_expansion_panel__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @covalent/core/expansion-panel */ "./node_modules/@covalent/core/fesm5/covalent-core-expansion-panel.js");
/* harmony import */ var _covalent_core__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @covalent/core */ "./node_modules/@covalent/core/fesm5/covalent-core.js");
/* harmony import */ var _covalent_core_file__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @covalent/core/file */ "./node_modules/@covalent/core/fesm5/covalent-core-file.js");
/* harmony import */ var _covalent_echarts_base__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @covalent/echarts/base */ "./node_modules/@covalent/echarts/fesm5/covalent-echarts-base.js");
/* harmony import */ var _covalent_echarts_bar__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @covalent/echarts/bar */ "./node_modules/@covalent/echarts/fesm5/covalent-echarts-bar.js");
/* harmony import */ var _covalent_echarts_tooltip__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @covalent/echarts/tooltip */ "./node_modules/@covalent/echarts/fesm5/covalent-echarts-tooltip.js");
/* harmony import */ var _home_main_component__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./home/main.component */ "./src/app/home/main.component.ts");
/* harmony import */ var _header_header_component__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./header/header.component */ "./src/app/header/header.component.ts");
/* harmony import */ var _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./diagram/diagram.component */ "./src/app/diagram/diagram.component.ts");
/* harmony import */ var _student_student_component__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./student/student.component */ "./src/app/student/student.component.ts");
/* harmony import */ var _teacher_teacher_component__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./teacher/teacher.component */ "./src/app/teacher/teacher.component.ts");
/* harmony import */ var _teacher_urlchange_component__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./teacher/urlchange.component */ "./src/app/teacher/urlchange.component.ts");
/* harmony import */ var _teacher_newanswer_component__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./teacher/newanswer.component */ "./src/app/teacher/newanswer.component.ts");
/* harmony import */ var _teacher_newjust_component__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./teacher/newjust.component */ "./src/app/teacher/newjust.component.ts");
/* harmony import */ var _home_newConcept_component__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./home/newConcept.component */ "./src/app/home/newConcept.component.ts");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./login/login.service */ "./src/app/login/login.service.ts");
/* harmony import */ var _home_chapter_service__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./home/chapter.service */ "./src/app/home/chapter.service.ts");
/* harmony import */ var _diagram_diagram_service__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./diagram/diagram.service */ "./src/app/diagram/diagram.service.ts");
/* harmony import */ var _student_question_service__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./student/question.service */ "./src/app/student/question.service.ts");
/* harmony import */ var _teacher_answer_service__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./teacher/answer.service */ "./src/app/teacher/answer.service.ts");
/* harmony import */ var _teacher_justification_service__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./teacher/justification.service */ "./src/app/teacher/justification.service.ts");
/* harmony import */ var _teacher_teacher_service__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./teacher/teacher.service */ "./src/app/teacher/teacher.service.ts");
/* harmony import */ var _login_auth_interceptor__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./login/auth.interceptor */ "./src/app/login/auth.interceptor.ts");
/* harmony import */ var _login_error_interceptor__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./login/error.interceptor */ "./src/app/login/error.interceptor.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _header_header_service__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./header/header.service */ "./src/app/header/header.service.ts");
/* harmony import */ var _images_image_service__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./images/image.service */ "./src/app/images/image.service.ts");
/* harmony import */ var _teacher_imageposter_component__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./teacher/imageposter.component */ "./src/app/teacher/imageposter.component.ts");
/* harmony import */ var _student_yesNoDialog_component__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./student/yesNoDialog.component */ "./src/app/student/yesNoDialog.component.ts");



















































var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_7__["AppComponent"],
                _header_header_component__WEBPACK_IMPORTED_MODULE_29__["HeaderComponent"],
                _home_main_component__WEBPACK_IMPORTED_MODULE_28__["ChapterComponent"],
                _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_30__["DiagramComponent"],
                _student_student_component__WEBPACK_IMPORTED_MODULE_31__["StudentComponent"],
                _teacher_teacher_component__WEBPACK_IMPORTED_MODULE_32__["TeacherComponent"],
                _teacher_urlchange_component__WEBPACK_IMPORTED_MODULE_33__["UrlChangerComponent"],
                _teacher_imageposter_component__WEBPACK_IMPORTED_MODULE_49__["ImagePosterComponent"],
                _teacher_newanswer_component__WEBPACK_IMPORTED_MODULE_34__["NewAnswerComponent"],
                _student_yesNoDialog_component__WEBPACK_IMPORTED_MODULE_50__["YesNoDialogComponent"],
                _teacher_newjust_component__WEBPACK_IMPORTED_MODULE_35__["NewJustComponent"],
                _home_newConcept_component__WEBPACK_IMPORTED_MODULE_36__["newConcept"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_6__["AppRoutingModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__["BrowserAnimationsModule"],
                _covalent_core_layout__WEBPACK_IMPORTED_MODULE_20__["CovalentLayoutModule"],
                _covalent_core_steps__WEBPACK_IMPORTED_MODULE_21__["CovalentStepsModule"],
                _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__["MatIconModule"],
                _angular_material_button__WEBPACK_IMPORTED_MODULE_10__["MatButtonModule"],
                _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
                _angular_material_tabs__WEBPACK_IMPORTED_MODULE_11__["MatTabsModule"],
                _angular_material_list__WEBPACK_IMPORTED_MODULE_12__["MatListModule"],
                _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardModule"],
                _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__["MatFormFieldModule"],
                _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDividerModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClientModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormsModule"],
                _angular_material_table__WEBPACK_IMPORTED_MODULE_5__["MatTableModule"],
                _angular_material_dialog__WEBPACK_IMPORTED_MODULE_17__["MatDialogModule"],
                _covalent_echarts_base__WEBPACK_IMPORTED_MODULE_25__["CovalentBaseEchartsModule"],
                _covalent_echarts_bar__WEBPACK_IMPORTED_MODULE_26__["CovalentBarEchartsModule"],
                _covalent_echarts_tooltip__WEBPACK_IMPORTED_MODULE_27__["CovalentTooltipEchartsModule"],
                _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
                _covalent_core_expansion_panel__WEBPACK_IMPORTED_MODULE_22__["CovalentExpansionPanelModule"],
                _covalent_core__WEBPACK_IMPORTED_MODULE_23__["CovalentDialogsModule"],
                _covalent_core_file__WEBPACK_IMPORTED_MODULE_24__["CovalentFileModule"],
                _angular_material_radio__WEBPACK_IMPORTED_MODULE_19__["MatRadioModule"]
            ],
            providers: [_home_chapter_service__WEBPACK_IMPORTED_MODULE_38__["ChapterService"], _student_question_service__WEBPACK_IMPORTED_MODULE_40__["QuestionsService"], _teacher_teacher_service__WEBPACK_IMPORTED_MODULE_43__["TeacherService"], _teacher_answer_service__WEBPACK_IMPORTED_MODULE_41__["AnswerService"], _teacher_justification_service__WEBPACK_IMPORTED_MODULE_42__["JustificationService"], _diagram_diagram_service__WEBPACK_IMPORTED_MODULE_39__["DiagramService"], _login_login_service__WEBPACK_IMPORTED_MODULE_37__["LoginService"], _header_header_service__WEBPACK_IMPORTED_MODULE_47__["HeaderService"], _images_image_service__WEBPACK_IMPORTED_MODULE_48__["ImageService"],
                { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HTTP_INTERCEPTORS"], useClass: _login_auth_interceptor__WEBPACK_IMPORTED_MODULE_44__["BasicAuthInterceptor"], multi: true },
                { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HTTP_INTERCEPTORS"], useClass: _login_error_interceptor__WEBPACK_IMPORTED_MODULE_45__["ErrorInterceptor"], multi: true },
                { provide: _angular_common__WEBPACK_IMPORTED_MODULE_46__["LocationStrategy"], useClass: _angular_common__WEBPACK_IMPORTED_MODULE_46__["HashLocationStrategy"] }],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_7__["AppComponent"], _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_30__["DiagramComponent"], _student_yesNoDialog_component__WEBPACK_IMPORTED_MODULE_50__["YesNoDialogComponent"], _teacher_newjust_component__WEBPACK_IMPORTED_MODULE_35__["NewJustComponent"]],
            entryComponents: [_teacher_newanswer_component__WEBPACK_IMPORTED_MODULE_34__["NewAnswerComponent"], _home_newConcept_component__WEBPACK_IMPORTED_MODULE_36__["newConcept"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/diagram/diagram.component.html":
/*!************************************************!*\
  !*** ./src/app/diagram/diagram.component.html ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h2 mat-dialog-title>Diagrama</h2>\r\n<td-chart [style.height.px]=\"450\" [config]=\"config\">\r\n</td-chart>\r\n<button mat-button mat-dialog-close (click)=\"close()\">Cerrar</button>\r\n"

/***/ }),

/***/ "./src/app/diagram/diagram.component.ts":
/*!**********************************************!*\
  !*** ./src/app/diagram/diagram.component.ts ***!
  \**********************************************/
/*! exports provided: DiagramComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiagramComponent", function() { return DiagramComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _diagram_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./diagram.service */ "./src/app/diagram/diagram.service.ts");




var DiagramComponent = /** @class */ (function () {
    function DiagramComponent(dialogRef, diagramService) {
        var _this = this;
        this.dialogRef = dialogRef;
        this.diagramService = diagramService;
        this.diagramService
            .getDiagram()
            .subscribe(function (data) { return _this.addDataToDiagram(data); }, function (error) { return console.log(error); });
    }
    DiagramComponent.prototype.addDataToDiagram = function (data) {
        var chapterNames = [];
        var unmarked = [];
        var correct = [];
        var incorrect = [];
        for (var i = 0; i < data.content.length; i++) {
            chapterNames.push(data.content[i].chapterName);
            unmarked.push(data.content[i].unmarked);
            correct.push(data.content[i].correct);
            incorrect.push(data.content[i].incorrect);
        }
        this.config = {
            toolbox: {},
            color: ["#27A1EE", "#F05050", "#43C472"],
            tooltip: {},
            legend: {
                data: [
                    "Respuestas sin corregir",
                    "Respuestas incorrectas",
                    "Respuestas correctas"
                ]
            },
            xAxis: {
                data: chapterNames
            },
            yAxis: {},
            series: [
                {
                    name: "Respuestas sin corregir",
                    type: "bar",
                    stack: "Tema",
                    data: unmarked
                },
                {
                    name: "Respuestas incorrectas",
                    type: "bar",
                    stack: "Tema",
                    data: incorrect
                },
                {
                    name: "Respuestas correctas",
                    type: "bar",
                    stack: "Tema",
                    data: correct
                }
            ]
        };
        console.log(this.config);
    };
    DiagramComponent.prototype.close = function () {
        this.dialogRef.close();
    };
    DiagramComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "diagram",
            template: __webpack_require__(/*! ./diagram.component.html */ "./src/app/diagram/diagram.component.html")
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"],
            _diagram_service__WEBPACK_IMPORTED_MODULE_3__["DiagramService"]])
    ], DiagramComponent);
    return DiagramComponent;
}());



/***/ }),

/***/ "./src/app/diagram/diagram.service.ts":
/*!********************************************!*\
  !*** ./src/app/diagram/diagram.service.ts ***!
  \********************************************/
/*! exports provided: DiagramService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiagramService", function() { return DiagramService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");





var DiagramService = /** @class */ (function () {
    function DiagramService(http, loginService) {
        this.http = http;
        this.loginService = loginService;
        this.apiUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].baseUrl;
    }
    //Backend is responsible for issuing the correct diagram by user
    DiagramService.prototype.getDiagram = function () {
        return this.http.get(this.apiUrl + "/diagraminfo", { withCredentials: true });
    };
    DiagramService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"], _login_login_service__WEBPACK_IMPORTED_MODULE_4__["LoginService"]])
    ], DiagramService);
    return DiagramService;
}());



/***/ }),

/***/ "./src/app/header/header.component.css":
/*!*********************************************!*\
  !*** ./src/app/header/header.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "mat-icon {\r\n    float: right\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvaGVhZGVyL2hlYWRlci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0k7QUFDSiIsImZpbGUiOiJzcmMvYXBwL2hlYWRlci9oZWFkZXIuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIm1hdC1pY29uIHtcclxuICAgIGZsb2F0OiByaWdodFxyXG59Il19 */"

/***/ }),

/***/ "./src/app/header/header.component.html":
/*!**********************************************!*\
  !*** ./src/app/header/header.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<nav mat-tab-nav-bar backgroundColor=\"primary\">\r\n  <a\r\n    mat-tab-link\r\n    *ngFor=\"let tab of this.headerService.getTabs() | keyvalue\"\r\n    [routerLink]=\"tab.key\"\r\n    routerLinkActive\r\n    #rla=\"routerLinkActive\"\r\n    [active]=\"rla.isActive\"\r\n  >\r\n    {{ tab.value.name }}\r\n    <mat-icon *ngIf=\"tab.value.closable\" (click)=\"closeTab(tab.key, $event)\">close</mat-icon>\r\n  </a>\r\n  <a mat-tab-link *ngIf=\"!this.loginService.isLogged\" (click)='openLoginDialog()'>Login</a>\r\n  <a mat-tab-link *ngIf=\"this.loginService.isLogged\" (click)='logOut()'>Logout</a>\r\n</nav>\r\n<!-- Login -->\r\n<ng-template #loginDialog let-dialogRef=\"dialogRef\">\r\n  <div layout=\"column\" layout-fill>\r\n    <h2 mat-dialog-title>\r\n      Login\r\n    </h2>\r\n    <mat-dialog-content flex>\r\n      <form #loginForm=\"ngForm\">\r\n        <div layout=\"row\">\r\n          <mat-form-field flex>\r\n            <input\r\n              matInput\r\n              #userElement\r\n              #userControl=\"ngModel\"\r\n              placeholder=\"Usuario\"\r\n              type=\"text\"\r\n              maxlength=\"30\"\r\n              name=\"username\"\r\n              [(ngModel)]=\"username\"\r\n              required\r\n            />\r\n            <span matPrefix>\r\n              <mat-icon>person</mat-icon>\r\n            </span>\r\n            <mat-hint align=\"start\">\r\n              <span\r\n                [hidden]=\"!userControl.errors?.required || userControl.pristine\"\r\n                class=\"tc-red-600\"\r\n                >Required</span\r\n              >\r\n            </mat-hint>\r\n            <mat-hint align=\"end\">{{ userElement.value.length }} / 30</mat-hint>\r\n          </mat-form-field>\r\n        </div>\r\n        <div layout=\"row\">\r\n          <mat-form-field flex>\r\n            <input\r\n              matInput\r\n              #passElement\r\n              #passControl=\"ngModel\"\r\n              placeholder=\"Contraseña\"\r\n              type=\"password\"\r\n              name=\"password\"\r\n              [(ngModel)]=\"password\"\r\n              required\r\n            />\r\n            <span matPrefix>\r\n              <mat-icon>lock</mat-icon>\r\n            </span>\r\n            <mat-hint align=\"start\">\r\n              <span\r\n                [hidden]=\"!passControl.errors?.required || passControl.pristine\"\r\n                class=\"tc-red-600\"\r\n                >Required</span\r\n              >\r\n            </mat-hint>\r\n          </mat-form-field>\r\n        </div>\r\n        <div layout=\"row\">\r\n          <span *ngIf=\"loginError\">Usuario o contraseña incorrecto</span>\r\n        </div>\r\n      </form>\r\n    </mat-dialog-content>\r\n    <mat-divider></mat-divider>\r\n    <mat-dialog-actions align=\"end\">\r\n      <button\r\n        type=\"button\"\r\n        mat-button\r\n        class=\"text-upper\"\r\n        (click)=\"dialogRef.close()\"\r\n      >\r\n        Cerrar\r\n      </button>\r\n      \r\n      <button\r\n        type=\"button\"\r\n        mat-button\r\n        color=\"primary\"\r\n        class=\"text-upper\"\r\n        (click)=\"signup($event, userElement.value, passElement.value)\"\r\n      >\r\n        Registrarse\r\n      </button>\r\n      <button\r\n        type=\"button\"\r\n        mat-button\r\n        color=\"primary\"\r\n        class=\"text-upper\"\r\n        (click)=\"logIn($event, userElement.value, passElement.value)\"\r\n      >\r\n        Login\r\n      </button>\r\n    </mat-dialog-actions>\r\n  </div>\r\n</ng-template>\r\n"

/***/ }),

/***/ "./src/app/header/header.component.ts":
/*!********************************************!*\
  !*** ./src/app/header/header.component.ts ***!
  \********************************************/
/*! exports provided: HeaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderComponent", function() { return HeaderComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _header_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./header.service */ "./src/app/header/header.service.ts");






/**
 * Component for the header
 */
var HeaderComponent = /** @class */ (function () {
    function HeaderComponent(router, headerService, loginService, dialog) {
        this.router = router;
        this.headerService = headerService;
        this.loginService = loginService;
        this.dialog = dialog;
        this.loginError = false;
    }
    //Tab methods
    HeaderComponent.prototype.addTab = function (name, route) {
        this.headerService.addTab(name, route);
    };
    //Param is router url
    HeaderComponent.prototype.closeTab = function (url, event) {
        console.log(event);
        event.preventDefault();
        // If the tab to remove is the current open tab go to home route
        if (url === this.router.url)
            this.router.navigate(["/"]);
        this.headerService.closeTab(url);
    };
    //Login/Logout methods
    HeaderComponent.prototype.openLoginDialog = function () {
        this.dialogRef = this.dialog.open(this.loginDialog, {
            width: "50%",
            height: "50%"
        });
    };
    HeaderComponent.prototype.logIn = function (event, user, pass) {
        var _this = this;
        event.preventDefault();
        this.loginService.logIn(user, pass).subscribe(function (u) {
            console.log(u);
            _this.loginError = false;
            _this.dialogRef.close();
        }, function (error) { return (_this.loginError = true); });
    };
    HeaderComponent.prototype.logOut = function () {
        var _this = this;
        this.loginService.logOut().subscribe(function (response) {
            _this.router.navigate(["/"]);
        }, function (error) { return console.log("Error when trying to log out: " + error); });
    };
    HeaderComponent.prototype.signup = function (event, user, pass) {
        var _this = this;
        event.preventDefault();
        this.loginService.signup(user, pass).subscribe(function (u) {
            _this.logIn(event, user, pass);
        }, function (error) { return console.error(error); });
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])("loginDialog"),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["TemplateRef"])
    ], HeaderComponent.prototype, "loginDialog", void 0);
    HeaderComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "header",
            template: __webpack_require__(/*! ./header.component.html */ "./src/app/header/header.component.html"),
            styles: [__webpack_require__(/*! ./header.component.css */ "./src/app/header/header.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _header_service__WEBPACK_IMPORTED_MODULE_5__["HeaderService"],
            _login_login_service__WEBPACK_IMPORTED_MODULE_3__["LoginService"],
            _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatDialog"]])
    ], HeaderComponent);
    return HeaderComponent;
}());



/***/ }),

/***/ "./src/app/header/header.service.ts":
/*!******************************************!*\
  !*** ./src/app/header/header.service.ts ***!
  \******************************************/
/*! exports provided: HeaderService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderService", function() { return HeaderService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var HeaderService = /** @class */ (function () {
    function HeaderService() {
        this.resetTabs();
    }
    HeaderService.prototype.addTab = function (name, route) {
        this.tabs.set(route, { name: name, route: route, closable: true });
    };
    //Param is route url
    HeaderService.prototype.closeTab = function (url) {
        this.tabs.delete(url);
    };
    HeaderService.prototype.getTabs = function () {
        return this.tabs;
    };
    HeaderService.prototype.resetTabs = function () {
        this.tabs = new Map();
        this.tabs.set("/", { name: "Inicio", route: "/", closable: false });
    };
    HeaderService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], HeaderService);
    return HeaderService;
}());



/***/ }),

/***/ "./src/app/home/chapter.service.ts":
/*!*****************************************!*\
  !*** ./src/app/home/chapter.service.ts ***!
  \*****************************************/
/*! exports provided: ChapterService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChapterService", function() { return ChapterService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");




var ChapterService = /** @class */ (function () {
    function ChapterService(http) {
        this.http = http;
        this.apiUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].baseUrl;
    }
    ChapterService.prototype.getChapters = function (page) {
        return this.http.get(this.apiUrl + "/chapters?sort=id" + "&page=" + page, {
            withCredentials: true
        });
    };
    ChapterService.prototype.getConceptPerChapter = function (chapterId, page) {
        return this.http.get(this.apiUrl + "/chapters/" + chapterId + "/concepts" + "?page=" + page, { withCredentials: true });
    };
    ChapterService.prototype.addConcept = function (id, concept) {
        return this.http.post(this.apiUrl + "/chapters/" + id + "/concepts", concept, { withCredentials: true });
    };
    ChapterService.prototype.deleteConcept = function (chapterId, conceptId) {
        return this.http.delete(this.apiUrl + "/chapters/" + chapterId + "/concepts/" + conceptId, { withCredentials: true });
    };
    ChapterService.prototype.deleteChapter = function (chapterId) {
        return this.http.delete(this.apiUrl + "/chapters/" + chapterId, { withCredentials: true });
    };
    ChapterService.prototype.createChapter = function (chapterName) {
        var headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            'Content-Type': 'application/json',
        });
        var body = {
            chapterName: chapterName
        };
        return this.http.post(this.apiUrl + "/chapters", body, { headers: headers, withCredentials: true });
    };
    ChapterService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
    ], ChapterService);
    return ChapterService;
}());



/***/ }),

/***/ "./src/app/home/dialogConcept.component.html":
/*!***************************************************!*\
  !*** ./src/app/home/dialogConcept.component.html ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Nueva respuesta</h1>\r\n<div mat-dialog-content>\r\n    <p class=\"padding\">Nombre:</p>\r\n    <mat-form-field>\r\n            <input matInput [(ngModel)]=\"conceptName\" name=\"conceptName\">\r\n    </mat-form-field>\r\n    <p class=\"padding\">URL:</p>\r\n    <mat-form-field>\r\n            <input matInput [(ngModel)]=\"URL\" name=\"URL\">\r\n    </mat-form-field>\r\n</div>\r\n<div mat-dialog-actions>\r\n    <button mat-button (click)=\"newConcept()\" cdkFocusInitial>Aceptar</button>\r\n    <button mat-button (click)=\"onNoClick()\">Cancelar</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/home/main.component.css":
/*!*****************************************!*\
  !*** ./src/app/home/main.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ul {\r\n    list-style-type: none;\r\n}\r\nli {\r\n    margin-bottom: 20px;\r\n}\r\n.imageList {\r\n    vertical-align: middle;\r\n    width: 100px;\r\n    height: 100px;\r\n    margin-right: 20px;\r\n}\r\nbutton[color=\"primary\"] {\r\n    margin: 10px\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvaG9tZS9tYWluLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxxQkFBcUI7QUFDekI7QUFDQTtJQUNJLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksc0JBQXNCO0lBQ3RCLFlBQVk7SUFDWixhQUFhO0lBQ2Isa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSTtBQUNKIiwiZmlsZSI6InNyYy9hcHAvaG9tZS9tYWluLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJ1bCB7XHJcbiAgICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XHJcbn1cclxubGkge1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcclxufVxyXG4uaW1hZ2VMaXN0IHtcclxuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XHJcbiAgICB3aWR0aDogMTAwcHg7XHJcbiAgICBoZWlnaHQ6IDEwMHB4O1xyXG4gICAgbWFyZ2luLXJpZ2h0OiAyMHB4O1xyXG59XHJcbmJ1dHRvbltjb2xvcj1cInByaW1hcnlcIl0ge1xyXG4gICAgbWFyZ2luOiAxMHB4XHJcbn0iXX0= */"

/***/ }),

/***/ "./src/app/home/main.component.html":
/*!******************************************!*\
  !*** ./src/app/home/main.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-card>\r\n  <span *ngIf=\"chapterConcepts.size === 0\">No hay temas disponibles.</span>\r\n  <td-expansion-panel *ngFor=\"let chap of chapterConcepts | keyvalue\" label=\"{{chap.key.chapterName}}\">\r\n    <div *ngIf=\"this.loginService.isTeacher\" align=\"center\">\r\n      <button mat-raised-button color=\"primary\" class=\"align-center\" (click)=\"deleteChapter(chap.key)\">\r\n        Borrar tema\r\n      </button>\r\n    </div>\r\n    <hr>\r\n    <div *ngIf=\"chapterConcepts?.size == 0\" class=\"md-padding\">\r\n      <li>\r\n        No hay temas disponibles\r\n      </li>\r\n    </div>\r\n    <div *ngIf=\"chapterConcepts?.size > 0\" class=\"md-padding\">\r\n      <p>{{chap.keyvalue}}</p>\r\n      <div *ngIf=\"chap?.value?.length === 0\">\r\n        <ul>\r\n          <li>\r\n            No hay conceptos disponibles para {{chap.key.chapterName}}\r\n          </li>\r\n        </ul>\r\n      </div>\r\n      <div *ngIf=\"chap?.value?.length > 0\">\r\n        <ul *ngFor=\"let concept of chap.value\">\r\n          <li>\r\n            <img class=\"imageList\" [src]=\"concept.image\">\r\n            <button *ngIf=\"!this.loginService.isTeacher\" mat-raised-button [disabled]=!this.loginService.isLogged\r\n              routerLink=\"/concept/{{concept.id}}\"\r\n              (click)=\"this.headerService.addTab(concept.conceptName, '/concept/' + concept.id)\">{{concept.conceptName}}</button>\r\n            <button *ngIf=\"this.loginService.isTeacher\" mat-raised-button routerLink=\"/teacher/{{concept.id}}\"\r\n              (click)=\"this.headerService.addTab(concept.conceptName, '/teacher/' + concept.id)\">{{concept.conceptName}}</button>\r\n            <button *ngIf=\"this.loginService.isTeacher\" mat-raised-button color=\"primary\"\r\n              (click)=\"deleteConcept(chap.key.id,concept.id)\">\r\n              <mat-icon>delete</mat-icon>\r\n            </button>\r\n            <hr>\r\n          </li>\r\n        </ul>\r\n        <!--<hr>-->\r\n        <div align=\"center\">\r\n          <button mat-raised-button color=\"primary\" (click)=\"getConcepts(chap.key)\">\r\n            <span>Mostrar más</span>\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div align=\"center\">\r\n      <button *ngIf=\"this.loginService.isTeacher\" mat-raised-button color=\"primary\"\r\n        (click)=\"showDialogNewConcept(chap.key.id)\">\r\n        <mat-icon>add</mat-icon>\r\n      </button>\r\n    </div>\r\n  </td-expansion-panel>\r\n  <div align=\"center\">\r\n    <button *ngIf=\"this.loginService.isTeacher\" mat-raised-button color=\"primary\" (click)=\"addChapter()\" ><mat-icon>add</mat-icon></button>\r\n    <br>\r\n    <button mat-raised-button color=\"primary\" (click)=\"getChapters()\">\r\n      <span>Mostrar más</span>\r\n    </button>\r\n  </div>\r\n</mat-card>\r\n<div *ngIf=\"this.loginService.isLogged\" align=\"center\">\r\n  <button mat-raised-button color=\"primary\" class=\"align-center\" (click)=\"showDiagram()\">\r\n    Diagrama\r\n  </button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/home/main.component.ts":
/*!****************************************!*\
  !*** ./src/app/home/main.component.ts ***!
  \****************************************/
/*! exports provided: ChapterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChapterComponent", function() { return ChapterComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _chapter_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chapter.service */ "./src/app/home/chapter.service.ts");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");
/* harmony import */ var _header_header_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../header/header.service */ "./src/app/header/header.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../diagram/diagram.component */ "./src/app/diagram/diagram.component.ts");
/* harmony import */ var _images_image_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../images/image.service */ "./src/app/images/image.service.ts");
/* harmony import */ var _newConcept_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./newConcept.component */ "./src/app/home/newConcept.component.ts");
/* harmony import */ var _covalent_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @covalent/core */ "./node_modules/@covalent/core/fesm5/covalent-core.js");










var ChapterComponent = /** @class */ (function () {
    function ChapterComponent(dialogService, conceptDialog, diagramDialog, chapterService, loginService, headerService, imageService) {
        this.dialogService = dialogService;
        this.conceptDialog = conceptDialog;
        this.diagramDialog = diagramDialog;
        this.chapterService = chapterService;
        this.loginService = loginService;
        this.headerService = headerService;
        this.imageService = imageService;
        //-1 means not initialized, 0 means false, 1 means true
        //we need to use -1 so we don't get the alert first time we try to get them
        this.conceptsPage = new Map();
        this.conceptsOnce = new Map();
        //-1 means not initialized, 0 means false, 1 means true
        //we need to use -1 so we don't get the alert first time we try to get them
        this.chapterConcepts = new Map();
        this.chaptersPage = 0;
        this.chaptersOnce = -1;
    }
    ChapterComponent.prototype.ngOnInit = function () {
        this.getChapters();
    };
    ChapterComponent.prototype.getChapters = function () {
        var _this = this;
        var once = this.chaptersOnce;
        if ((once == -1) || (once == 0)) {
            var page = this.chaptersPage++;
            this.chapterService
                .getChapters(page)
                .subscribe(function (data) {
                if ((data.numberOfElements === 0) && (once == 0)) {
                    _this.chaptersOnce = 1;
                    _this.dialogService.openAlert({
                        message: 'No hay más temas disponibles',
                        title: 'No hay más temas',
                        closeButton: 'Cerrar'
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.chaptersOnce = 0;
                    }
                    _this.addChapters(data);
                }
            }, function (error) { return console.log(error); });
        }
    };
    ChapterComponent.prototype.addChapters = function (data) {
        for (var _i = 0, _a = data.content; _i < _a.length; _i++) {
            var ch = _a[_i];
            //Set chapter first to keep ordering
            console.log(this.chapterConcepts.get(ch));
            if (!this.chapterConcepts.has(ch)) {
                //console.log(this.chapterConcepts.has(ch));
                this.chapterConcepts.set(ch, []);
                if (!this.conceptsPage.has(ch)) { //add the chapter to both maps
                    this.conceptsPage.set(ch, -1);
                    this.conceptsOnce.set(ch, false);
                }
                this.getConcepts(ch);
                //console.log(this.chapterConcepts);
            }
        }
    };
    ChapterComponent.prototype.getConcepts = function (chapter) {
        var _this = this;
        if (this.conceptsOnce.has(chapter)) {
            var once_1 = this.conceptsOnce.get(chapter);
            var page = this.conceptsPage.get(chapter) + 1;
            this.conceptsPage.set(chapter, page);
            this.chapterService
                .getConceptPerChapter(chapter.id, page)
                .subscribe(function (data) {
                if ((data.numberOfElements === 0) && (once_1 == true)) {
                    _this.conceptsOnce.delete(chapter);
                    _this.conceptsPage.delete(chapter);
                    _this.dialogService.openAlert({
                        message: 'No hay más conceptos para ' + chapter.chapterName,
                        title: 'No hay más conceptos',
                        closeButton: 'Cerrar'
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once_1 == false) {
                        _this.conceptsOnce.set(chapter, true);
                    }
                    _this.addConcepts(chapter, data);
                }
            }, function (error) { return console.log(error); });
        }
    };
    ChapterComponent.prototype.addConcepts = function (chapter, data) {
        var _this = this;
        var conceptInfo = data.content;
        var _loop_1 = function (concept) {
            this_1.imageService.getImage(concept.id).subscribe(function (data) { return _this.imageService.createImageFromBlob(data, (function (image) { return concept.image = image; })); }, function (error) { return console.log(error); });
        };
        var this_1 = this;
        for (var _i = 0, conceptInfo_1 = conceptInfo; _i < conceptInfo_1.length; _i++) {
            var concept = conceptInfo_1[_i];
            _loop_1(concept);
        }
        conceptInfo = this.chapterConcepts.get(chapter).concat(data.content);
        this.chapterConcepts.set(chapter, conceptInfo);
    };
    ChapterComponent.prototype.showDiagram = function () {
        this.diagramDialog.open(_diagram_diagram_component__WEBPACK_IMPORTED_MODULE_6__["DiagramComponent"], {
            height: "600px",
            width: "800px"
        });
    };
    ChapterComponent.prototype.showDialogNewConcept = function (id) {
        var _this = this;
        var dialogRef = this.conceptDialog.open(_newConcept_component__WEBPACK_IMPORTED_MODULE_8__["newConcept"], {
            data: {
                id: id
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
            var chapters = Array.from(_this.chapterConcepts.keys());
            var chapter = chapters.find(function (j) { return j.id == id; });
            var concepts = _this.chapterConcepts.get(chapter);
            concepts.push(result);
            _this.chapterConcepts.set(chapter, concepts);
        }, function (error) { return console.log(error); });
    };
    ChapterComponent.prototype.deleteConcept = function (chapterId, conceptId) {
        var _this = this;
        this.dialogService.openConfirm({
            message: '¿Quieres eliminar este concepto?',
            title: 'Confirmar',
            acceptButton: 'Aceptar',
            cancelButton: 'Cancelar',
            width: '500px',
            height: '175px'
        }).afterClosed().subscribe(function (accept) {
            if (accept) {
                _this.chapterService
                    .deleteConcept(chapterId, conceptId)
                    .subscribe(function (_) {
                    var chapters = Array.from(_this.chapterConcepts.keys());
                    var chapter = chapters.find(function (j) { return j.id == chapterId; });
                    var concepts = _this.chapterConcepts.get(chapter);
                    var concept = concepts.find(function (i) { return i.id == conceptId; });
                    var index = concepts.indexOf(concept, 0);
                    if (index > -1) {
                        concepts.splice(index, 1);
                    }
                    _this.chapterConcepts.set(chapter, concepts);
                }, function (error) { return console.error(error + 'markedanswers on ans delete'); });
            }
        });
    };
    ChapterComponent.prototype.deleteChapter = function (chapter) {
        var _this = this;
        this.dialogService.openConfirm({
            message: '¿Quieres eliminar este tema?',
            title: 'Confirmar',
            acceptButton: 'Aceptar',
            cancelButton: 'Cancelar',
            width: '500px',
            height: '175px'
        }).afterClosed().subscribe(function (accept) {
            if (accept) {
                _this.chapterService.deleteChapter(chapter.id).subscribe(function (_) { return _this.chapterConcepts.delete(chapter); }, function (error) { return console.error(error); });
            }
        });
    };
    ChapterComponent.prototype.addChapter = function () {
        var _this = this;
        this.dialogService.openPrompt({
            message: "Elige un nombre para el tema: ",
            title: "Crear tema",
            acceptButton: "Crear",
            cancelButton: "Cancelar",
            width: '500px',
            height: '250px'
        }).afterClosed().subscribe(function (newChapterName) {
            if (newChapterName) {
                _this.chapterService.createChapter(newChapterName).subscribe(function (data) { _this.chapterConcepts.set(data, []); console.log(); }, function (error) { return console.error(error); });
            }
            else {
                alert("Tienes que escribir un nombre para el tema en el campo de texto.");
            }
        });
    };
    ChapterComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "main",
            template: __webpack_require__(/*! ./main.component.html */ "./src/app/home/main.component.html"),
            styles: [__webpack_require__(/*! ./main.component.css */ "./src/app/home/main.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_covalent_core__WEBPACK_IMPORTED_MODULE_9__["TdDialogService"],
            _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatDialog"],
            _angular_material__WEBPACK_IMPORTED_MODULE_5__["MatDialog"],
            _chapter_service__WEBPACK_IMPORTED_MODULE_2__["ChapterService"],
            _login_login_service__WEBPACK_IMPORTED_MODULE_3__["LoginService"],
            _header_header_service__WEBPACK_IMPORTED_MODULE_4__["HeaderService"],
            _images_image_service__WEBPACK_IMPORTED_MODULE_7__["ImageService"]])
    ], ChapterComponent);
    return ChapterComponent;
}());



/***/ }),

/***/ "./src/app/home/newConcept.component.ts":
/*!**********************************************!*\
  !*** ./src/app/home/newConcept.component.ts ***!
  \**********************************************/
/*! exports provided: newConcept */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "newConcept", function() { return newConcept; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _chapter_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chapter.service */ "./src/app/home/chapter.service.ts");




var newConcept = /** @class */ (function () {
    function newConcept(dialogRef, data, chapterService) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.chapterService = chapterService;
        this.id = data["id"];
    }
    newConcept.prototype.newConcept = function () {
        var _this = this;
        var concept = {
            conceptName: this.conceptName,
            URL: this.URL,
        };
        this.chapterService.addConcept(this.id, concept).subscribe(function (data) { return _this.dialogRef.close(data); }, function (error) { return console.log(error); });
    };
    newConcept.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    newConcept = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'dialogConcept',
            template: __webpack_require__(/*! ./dialogConcept.component.html */ "./src/app/home/dialogConcept.component.html")
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], Object, _chapter_service__WEBPACK_IMPORTED_MODULE_3__["ChapterService"]])
    ], newConcept);
    return newConcept;
}());



/***/ }),

/***/ "./src/app/images/image.service.ts":
/*!*****************************************!*\
  !*** ./src/app/images/image.service.ts ***!
  \*****************************************/
/*! exports provided: ImageService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImageService", function() { return ImageService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");




var ImageService = /** @class */ (function () {
    function ImageService(http) {
        this.http = http;
        this.apiUrl = src_environments_environment__WEBPACK_IMPORTED_MODULE_2__["environment"].baseUrl;
    }
    ImageService.prototype.getImage = function (conceptId) {
        return this.http.get(this.apiUrl + "/concepts/" + conceptId + "/image", {
            responseType: "blob"
        });
    };
    ImageService.prototype.postImage = function (image, conceptId) {
        var formData = new FormData();
        formData.append("file", image);
        return this.http.post(this.apiUrl + "/concepts/" + conceptId + "/image", formData);
    };
    ImageService.prototype.createImageFromBlob = function (image, callback) {
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            callback(reader.result);
        }, false);
        if (image) {
            reader.readAsDataURL(image);
        }
    };
    ImageService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClient"]])
    ], ImageService);
    return ImageService;
}());



/***/ }),

/***/ "./src/app/login/auth.interceptor.ts":
/*!*******************************************!*\
  !*** ./src/app/login/auth.interceptor.ts ***!
  \*******************************************/
/*! exports provided: BasicAuthInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BasicAuthInterceptor", function() { return BasicAuthInterceptor; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


// Strategy based on http://jasonwatmore.com/post/2018/09/07/angular-6-basic-http-authentication-tutorial-example
var BasicAuthInterceptor = /** @class */ (function () {
    function BasicAuthInterceptor() {
    }
    BasicAuthInterceptor.prototype.intercept = function (request, next) {
        // add authorization header with basic auth credentials if available
        var user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.authdata) {
            request = request.clone({
                setHeaders: {
                    Authorization: "Basic " + user.authdata
                }
            });
        }
        return next.handle(request);
    };
    BasicAuthInterceptor = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])()
    ], BasicAuthInterceptor);
    return BasicAuthInterceptor;
}());



/***/ }),

/***/ "./src/app/login/error.interceptor.ts":
/*!********************************************!*\
  !*** ./src/app/login/error.interceptor.ts ***!
  \********************************************/
/*! exports provided: ErrorInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ErrorInterceptor", function() { return ErrorInterceptor; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _login_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./login.service */ "./src/app/login/login.service.ts");





var ErrorInterceptor = /** @class */ (function () {
    function ErrorInterceptor(loginService) {
        this.loginService = loginService;
    }
    ErrorInterceptor.prototype.intercept = function (request, next) {
        var _this = this;
        console.log("Error intercepted");
        return next.handle(request).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])(function (err) {
            if (err.status === 401) {
                console.log(_this.loginService.isLogged);
                // auto logout if 401 response returned from api
                _this.loginService.removeCurrentUser();
                //location.reload(true);
                console.log(_this.loginService.isLogged);
            }
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["throwError"])(err);
        }));
    };
    ErrorInterceptor = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_login_service__WEBPACK_IMPORTED_MODULE_4__["LoginService"]])
    ], ErrorInterceptor);
    return ErrorInterceptor;
}());



/***/ }),

/***/ "./src/app/login/login.service.ts":
/*!****************************************!*\
  !*** ./src/app/login/login.service.ts ***!
  \****************************************/
/*! exports provided: LoginService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginService", function() { return LoginService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _header_header_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../header/header.service */ "./src/app/header/header.service.ts");






var URL = _environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].baseUrl;
var LoginService = /** @class */ (function () {
    function LoginService(http, headerService) {
        this.http = http;
        this.headerService = headerService;
        this.isLogged = false;
        this.isTeacher = false;
        var user = JSON.parse(localStorage.getItem("currentUser"));
        if (user) {
            console.log("Logged user");
            this.setCurrentUser(user);
        }
    }
    LoginService.prototype.logIn = function (user, pass) {
        var _this = this;
        var auth = window.btoa(user + ":" + pass);
        var headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            Authorization: "Basic " + auth,
            "X-Requested-With": "XMLHttpRequest"
        });
        return this.http.get("/api/logIn", { headers: headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(function (user) {
            if (user) {
                _this.setCurrentUser(user);
                user.authdata = auth;
                localStorage.setItem("currentUser", JSON.stringify(user));
            }
            return user;
        }));
    };
    LoginService.prototype.logOut = function () {
        var _this = this;
        return this.http.get(URL + "/logOut").pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(function (response) {
            _this.removeCurrentUser();
            return response;
        }));
    };
    LoginService.prototype.setCurrentUser = function (user) {
        this.isLogged = true;
        this.user = user;
        this.isTeacher = this.user.roles.indexOf("ROLE_TEACHER") !== -1;
    };
    LoginService.prototype.removeCurrentUser = function () {
        localStorage.removeItem("currentUser");
        this.isLogged = false;
        this.isTeacher = false;
        this.headerService.resetTabs();
    };
    LoginService.prototype.signup = function (username, password) {
        var headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            "Content-Type": "application/json"
        });
        var body = {
            name: username,
            password: password
        };
        return this.http.post(URL + "/register", body, { headers: headers });
    };
    LoginService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"], _header_header_service__WEBPACK_IMPORTED_MODULE_5__["HeaderService"]])
    ], LoginService);
    return LoginService;
}());



/***/ }),

/***/ "./src/app/student/question.service.ts":
/*!*********************************************!*\
  !*** ./src/app/student/question.service.ts ***!
  \*********************************************/
/*! exports provided: QuestionsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "QuestionsService", function() { return QuestionsService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");





var BASE_URL = _environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].baseUrl;
var QuestionsService = /** @class */ (function () {
    function QuestionsService(http, loginService) {
        this.http = http;
        this.loginService = loginService;
    }
    QuestionsService.prototype.getMarkedQuestions = function (id, page) {
        return this.http.get(BASE_URL + "/concepts/" + id + "/markedquestions" + "?page=" + page, { withCredentials: true });
    };
    QuestionsService.prototype.getUnmarkedQuestions = function (id, page) {
        return this.http.get(BASE_URL + "/concepts/" + id + "/unmarkedquestions" + "?page=" + page, { withCredentials: true });
    };
    QuestionsService.prototype.getNewQuestion = function (id) {
        return this.http.get(BASE_URL + "/concepts/" + id + "/newquestion", { withCredentials: true });
    };
    QuestionsService.prototype.saveAnswer = function (conceptId, questionType, answerText, questionText, answerId, justificationId) {
        var body = {
            questionType: questionType,
            questionText: questionText
        };
        if (questionType == 2 || questionType == 3) { // If question is a yes/no question
            body.answerOption = answerText;
        }
        else {
            body.answerText = answerText;
        }
        if (answerId != null)
            body.answerId = answerId;
        if (justificationId != null)
            body.justificationQuestionId = justificationId;
        return this.http.post(BASE_URL + "/concepts/" + conceptId + "/saveanswer", body, { withCredentials: true });
    };
    QuestionsService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"], _login_login_service__WEBPACK_IMPORTED_MODULE_4__["LoginService"]])
    ], QuestionsService);
    return QuestionsService;
}());



/***/ }),

/***/ "./src/app/student/student.component.css":
/*!***********************************************!*\
  !*** ./src/app/student/student.component.css ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".checkOverflow {\r\n    overflow: auto;\r\n}\r\n\r\n.studentContent {\r\n    padding-top: 2.5%;\r\n}\r\n\r\n.studentCard {\r\n    width: 48%;\r\n    float: left;\r\n}\r\n\r\nmat-card-title {\r\n    text-align: center;\r\n    text-transform: uppercase;\r\n    padding-bottom: 2%;\r\n}\r\n\r\n.correctSize .mat-list-item {\r\n    height: auto;\r\n}\r\n\r\n.center {\r\n    text-align: center;\r\n}\r\n\r\n.question {\r\n    width: 50%;\r\n    padding-top: 2%;\r\n    padding-bottom: 2%;\r\n}\r\n\r\n.answer {\r\n    width: 40%;\r\n    text-align: center;\r\n    padding-top: 2%;\r\n    padding-bottom: 2%;\r\n}\r\n\r\n.icon {\r\n    width: 10%;\r\n    text-align: center;\r\n}\r\n\r\nbutton[color=\"primary\"] {\r\n    margin: 10px\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvc3R1ZGVudC9zdHVkZW50LmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxjQUFjO0FBQ2xCOztBQUVBO0lBQ0ksaUJBQWlCO0FBQ3JCOztBQUVBO0lBQ0ksVUFBVTtJQUNWLFdBQVc7QUFDZjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIsa0JBQWtCO0FBQ3RCOztBQUVBO0lBQ0ksWUFBWTtBQUNoQjs7QUFFQTtJQUNJLGtCQUFrQjtBQUN0Qjs7QUFFQTtJQUNJLFVBQVU7SUFDVixlQUFlO0lBQ2Ysa0JBQWtCO0FBQ3RCOztBQUVBO0lBQ0ksVUFBVTtJQUNWLGtCQUFrQjtJQUNsQixlQUFlO0lBQ2Ysa0JBQWtCO0FBQ3RCOztBQUVBO0lBQ0ksVUFBVTtJQUNWLGtCQUFrQjtBQUN0Qjs7QUFFQTtJQUNJO0FBQ0oiLCJmaWxlIjoic3JjL2FwcC9zdHVkZW50L3N0dWRlbnQuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jaGVja092ZXJmbG93IHtcclxuICAgIG92ZXJmbG93OiBhdXRvO1xyXG59XHJcblxyXG4uc3R1ZGVudENvbnRlbnQge1xyXG4gICAgcGFkZGluZy10b3A6IDIuNSU7XHJcbn1cclxuXHJcbi5zdHVkZW50Q2FyZCB7XHJcbiAgICB3aWR0aDogNDglO1xyXG4gICAgZmxvYXQ6IGxlZnQ7XHJcbn1cclxuXHJcbm1hdC1jYXJkLXRpdGxlIHtcclxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XHJcbiAgICBwYWRkaW5nLWJvdHRvbTogMiU7XHJcbn1cclxuXHJcbi5jb3JyZWN0U2l6ZSAubWF0LWxpc3QtaXRlbSB7XHJcbiAgICBoZWlnaHQ6IGF1dG87XHJcbn1cclxuXHJcbi5jZW50ZXIge1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG59XHJcblxyXG4ucXVlc3Rpb24ge1xyXG4gICAgd2lkdGg6IDUwJTtcclxuICAgIHBhZGRpbmctdG9wOiAyJTtcclxuICAgIHBhZGRpbmctYm90dG9tOiAyJTtcclxufVxyXG5cclxuLmFuc3dlciB7XHJcbiAgICB3aWR0aDogNDAlO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgcGFkZGluZy10b3A6IDIlO1xyXG4gICAgcGFkZGluZy1ib3R0b206IDIlO1xyXG59XHJcblxyXG4uaWNvbiB7XHJcbiAgICB3aWR0aDogMTAlO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG59XHJcblxyXG5idXR0b25bY29sb3I9XCJwcmltYXJ5XCJdIHtcclxuICAgIG1hcmdpbjogMTBweFxyXG59Il19 */"

/***/ }),

/***/ "./src/app/student/student.component.html":
/*!************************************************!*\
  !*** ./src/app/student/student.component.html ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"checkOverflow studentContent\">\r\n\r\n    <mat-card class=\"studentCard\">\r\n        <mat-card-title>Preguntas corregidas</mat-card-title>\r\n        <mat-nav-list *ngIf=\"markedQuestions?.length == 0\" role=\"list\" class=\"correctSize\">\r\n            <mat-card-content>No hay preguntas corregidas</mat-card-content>\r\n        </mat-nav-list>\r\n        <mat-card-content *ngIf=\"markedQuestions?.length > 0\">\r\n            <table mat-table [dataSource]=\"dataSourceMarked\" class=\"mat-elevation-z8\">\r\n                <ng-container matColumnDef=\"questionText\">\r\n                    <th mat-header-cell *matHeaderCellDef class=\"center\"> Pregunta </th>\r\n                    <td mat-cell *matCellDef=\"let element\" class=\"question\"> {{element.questionText}} </td>\r\n                </ng-container>\r\n                <ng-container matColumnDef=\"userResponse\">\r\n                    <th mat-header-cell *matHeaderCellDef class=\"center\"> Respuesta </th>\r\n                    <td mat-cell *matCellDef=\"let element\" class=\"answer\">\r\n                        <div *ngIf=\"element.yesNoQuestion\">\r\n                            <span *ngIf=\"element.userResponse\">Sí</span>\r\n                            <span *ngIf=\"!element.userResponse\">No</span>\r\n                        </div>\r\n                        <div *ngIf=\"!element.yesNoQuestion\">\r\n                            <div *ngIf=\"!element.justification\">\r\n                                <span>{{element.answer.answerText}}</span>\r\n                            </div>\r\n                            <div *ngIf=\"element.justification\">\r\n                                <span>{{element.justification.justificationText}}</span>\r\n                            </div>\r\n                        </div>\r\n                    </td>\r\n                </ng-container>\r\n                <ng-container matColumnDef=\"correct\">\r\n                    <th mat-header-cell *matHeaderCellDef class=\"center\"> Correccion </th>\r\n                    <td mat-cell *matCellDef=\"let element\" class=\"icon\">\r\n                        <mat-icon *ngIf=\"element.correct\">check</mat-icon>\r\n                        <mat-icon *ngIf=\"!element.correct\">clear</mat-icon>\r\n                    </td>\r\n                </ng-container>\r\n                <tr mat-header-row *matHeaderRowDef=\"displayedColumnsMarked\"></tr>\r\n                <tr mat-row *matRowDef=\"let row; columns: displayedColumnsMarked;\"></tr>\r\n            </table>\r\n        </mat-card-content>\r\n        <mat-card-actions>\r\n            <button mat-raised-button color=\"primary\" (click)=\"getMarkedQuestions()\">\r\n                <span>Mostrar más</span>\r\n            </button>\r\n        </mat-card-actions>\r\n    </mat-card>\r\n\r\n    <mat-card class=\"studentCard\">\r\n        <mat-card-title>Preguntas por corregir</mat-card-title>\r\n        <mat-nav-list *ngIf=\"unmarkedQuestions?.length == 0\" role=\"list\" class=\"correctSize\">\r\n            <mat-card-content>No hay preguntas por corregir</mat-card-content>\r\n        </mat-nav-list>\r\n        <mat-card-content *ngIf=\"unmarkedQuestions?.length > 0\">\r\n            <table mat-table [dataSource]=\"dataSourceUnmarked\" class=\"mat-elevation-z8\">\r\n                <ng-container matColumnDef=\"questionText\">\r\n                    <th mat-header-cell *matHeaderCellDef class=\"center\"> Pregunta </th>\r\n                    <td mat-cell *matCellDef=\"let element\" class=\"question\"> {{element.questionText}} </td>\r\n                </ng-container>\r\n                <ng-container matColumnDef=\"userResponse\">\r\n                    <th mat-header-cell *matHeaderCellDef class=\"center\"> Respuesta </th>\r\n                    <td mat-cell *matCellDef=\"let element\" class=\"answer\">\r\n                        <div *ngIf=\"element.yesNoQuestion\">\r\n                            <span *ngIf=\"element.userResponse\">Sí</span>\r\n                            <span *ngIf=\"!element.userResponse\">No</span>\r\n                        </div>\r\n                        <div *ngIf=\"!element.yesNoQuestion\">\r\n                            <div *ngIf=\"!element.justification\">\r\n                                <span>{{element.answer.answerText}}</span>\r\n                            </div>\r\n                            <div *ngIf=\"element.justification\">\r\n                                <span>{{element.justification.justificationText}}</span>\r\n                            </div>\r\n                        </div>\r\n                    </td>\r\n                </ng-container>\r\n                <tr mat-header-row *matHeaderRowDef=\"displayedColumnsUnmarked\"></tr>\r\n                <tr mat-row *matRowDef=\"let row; columns: displayedColumnsUnmarked;\"></tr>\r\n            </table>\r\n        </mat-card-content>\r\n        <mat-card-actions>\r\n            <button mat-raised-button color=\"primary\" (click)=\"getUnmarkedQuestions()\">\r\n                <span>Mostrar más</span>\r\n            </button>\r\n        </mat-card-actions>\r\n    </mat-card>\r\n\r\n</div>\r\n\r\n<div align=\"center\">\r\n    <button mat-raised-button color=\"primary\" (click)=\"getNewQuestion()\"\r\n        >\r\n        <mat-icon>add</mat-icon>\r\n    </button>\r\n    <button mat-raised-button color=\"primary\" class=\"align-center\" (click)=\"showDiagram()\">\r\n        Diagrama\r\n    </button>\r\n</div>"

/***/ }),

/***/ "./src/app/student/student.component.ts":
/*!**********************************************!*\
  !*** ./src/app/student/student.component.ts ***!
  \**********************************************/
/*! exports provided: StudentComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StudentComponent", function() { return StudentComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _question_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./question.service */ "./src/app/student/question.service.ts");
/* harmony import */ var _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../diagram/diagram.component */ "./src/app/diagram/diagram.component.ts");
/* harmony import */ var _covalent_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @covalent/core */ "./node_modules/@covalent/core/fesm5/covalent-core.js");
/* harmony import */ var _yesNoDialog_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./yesNoDialog.component */ "./src/app/student/yesNoDialog.component.ts");








var StudentComponent = /** @class */ (function () {
    //@ViewChild(MatPaginator) markedPaginator: MatPaginator;
    //@ViewChild(MatPaginator) unmarkedPaginator: MatPaginator;
    function StudentComponent(dialogs, router, activatedRoute, questionsService, dialogService) {
        this.dialogs = dialogs;
        this.router = router;
        this.questionsService = questionsService;
        this.dialogService = dialogService;
        this.markedQuestions = [];
        //-1 means not initialized, 0 means false, 1 means true
        //we need to use -1 so we don't get the alert first time we try to get them
        this.unmarkedQuestions = [];
        this.displayedColumnsMarked = [
            "questionText",
            "userResponse",
            "correct"
        ];
        this.displayedColumnsUnmarked = ["questionText", "userResponse"];
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.id = activatedRoute.snapshot.params["id"];
        this.markedQuestionsPage = 0;
        this.markedOnce = -1;
        this.unmarkedQuestionsPage = 0;
        this.unmarkedOnce = -1;
    }
    StudentComponent.prototype.ngOnInit = function () {
        this.getMarkedQuestions();
        this.getUnmarkedQuestions();
    };
    StudentComponent.prototype.getMarkedQuestions = function () {
        var _this = this;
        var once = this.markedOnce;
        if (once == -1 || once == 0) {
            var page = this.markedQuestionsPage++;
            this.questionsService.getMarkedQuestions(this.id, page).subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.markedOnce = 1;
                    _this.dialogService.openAlert({
                        message: "No hay más preguntas corregidas",
                        title: "No hay más preguntas",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.markedOnce = 0;
                    }
                    _this.markedQuestions = _this.markedQuestions.concat(data.content);
                    _this.dataSourceMarked = new _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.markedQuestions);
                }
            }, function (error) { return console.log(error); });
        }
    };
    StudentComponent.prototype.getUnmarkedQuestions = function () {
        var _this = this;
        var once = this.unmarkedOnce;
        if (once == -1 || once == 0) {
            var page = this.unmarkedQuestionsPage++;
            this.questionsService.getUnmarkedQuestions(this.id, page).subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.unmarkedOnce = 1;
                    _this.dialogService.openAlert({
                        message: "No hay más preguntas por corregir",
                        title: "No hay más preguntas",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.unmarkedOnce = 0;
                    }
                    _this.unmarkedQuestions = _this.unmarkedQuestions.concat(data.content);
                    _this.dataSourceUnmarked = new _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.unmarkedQuestions);
                }
            }, function (error) { return console.log(error); });
        }
    };
    StudentComponent.prototype.showDiagram = function () {
        this.dialogs.open(_diagram_diagram_component__WEBPACK_IMPORTED_MODULE_5__["DiagramComponent"], {
            height: "600px",
            width: "800px"
        });
    };
    StudentComponent.prototype.getNewQuestion = function () {
        var _this = this;
        this.questionsService.getNewQuestion(this.id).subscribe(function (data) {
            if (data.yesNoQuestion) {
                _this.dialogs
                    .open(_yesNoDialog_component__WEBPACK_IMPORTED_MODULE_7__["YesNoDialogComponent"], {
                    width: "800px",
                    data: {
                        questionText: data.questionText
                    }
                })
                    .afterClosed()
                    .subscribe(function (answer) {
                    if (answer) {
                        if (data.justification)
                            _this.saveAnswer(data.type, answer, data.questionText, data.answer.id, data.justification.id);
                        else if (data.answer)
                            _this.saveAnswer(data.type, answer, data.questionText, data.answer.id);
                        else
                            _this.saveAnswer(data.type, answer, data.questionText);
                    }
                });
            }
            else {
                _this.dialogService
                    .openPrompt({
                    message: data.questionText,
                    title: "Pregunta",
                    cancelButton: "Cancelar",
                    acceptButton: "Enviar"
                })
                    .afterClosed()
                    .subscribe(function (answer) {
                    if (answer) {
                        if (data.justification)
                            _this.saveAnswer(data.type, answer, data.questionText, data.answer.id, data.justification.id);
                        else if (data.answer)
                            _this.saveAnswer(data.type, answer, data.questionText, data.answer.id);
                        else
                            _this.saveAnswer(data.type, answer, data.questionText);
                    }
                });
            }
        }, function (error) { return console.log(error); });
    };
    StudentComponent.prototype.saveAnswer = function (questionType, answerText, questionText, answerId, justificationId) {
        var _this = this;
        if (justificationId != null)
            this.questionsService
                .saveAnswer(this.id, questionType, answerText, questionText, answerId, justificationId)
                .subscribe(function (data) {
                console.log(questionText);
                console.log(data);
                _this.addNewQuestion(data);
            }, function (error) { return console.log(error); });
        else if (answerId != null)
            this.questionsService
                .saveAnswer(this.id, questionType, answerText, questionText, answerId)
                .subscribe(function (data) {
                console.log(questionText);
                console.log(data);
                _this.addNewQuestion(data);
            }, function (error) { return console.log(error); });
        else
            this.questionsService
                .saveAnswer(this.id, questionType, answerText, questionText, answerId)
                .subscribe(function (data) {
                console.log(questionText);
                console.log(data);
                _this.addNewQuestion(data);
            }, function (error) { return console.log(error); });
    };
    StudentComponent.prototype.addNewQuestion = function (data) {
        var question;
        if (data.type == 2 || data.type == 3) {
            question = {
                questionText: data.questionText,
                type: data.type,
                userResponse: data.userResponse,
                marked: false,
                yesNoQuestion: true,
                correct: data.correct
            };
            this.markedQuestions.push(question);
            this.dataSourceMarked = new _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](this.markedQuestions);
        }
        else {
            if (data.type == 0) {
                var ans = {
                    answerText: data.answer.answerText,
                    marked: false,
                    correct: false
                };
                question = {
                    questionText: data.questionText,
                    type: data.type,
                    userResponse: true,
                    marked: false,
                    yesNoQuestion: false,
                    correct: false,
                    answer: ans
                };
            }
            else if (data.type == 1) {
                var jus = {
                    justificationText: data.justification.justificationText,
                    marked: false,
                    valid: false,
                    error: ""
                };
                question = {
                    questionText: data.questionText,
                    type: data.type,
                    userResponse: true,
                    marked: false,
                    yesNoQuestion: false,
                    correct: false,
                    justification: jus
                };
            }
            this.unmarkedQuestions.push(question);
            this.dataSourceUnmarked = new _angular_material__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](this.unmarkedQuestions);
        }
    };
    StudentComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "student",
            template: __webpack_require__(/*! ./student.component.html */ "./src/app/student/student.component.html"),
            styles: [__webpack_require__(/*! ./student.component.css */ "./src/app/student/student.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_3__["MatDialog"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
            _question_service__WEBPACK_IMPORTED_MODULE_4__["QuestionsService"],
            _covalent_core__WEBPACK_IMPORTED_MODULE_6__["TdDialogService"]])
    ], StudentComponent);
    return StudentComponent;
}());



/***/ }),

/***/ "./src/app/student/yesNoDialog.component.html":
/*!****************************************************!*\
  !*** ./src/app/student/yesNoDialog.component.html ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Pregunta</h1>\r\n  <p>{{ data.questionText }}</p>\r\n    <mat-radio-group #radioGroup=\"matRadioGroup\">\r\n      <mat-radio-button value=\"yes\" (click)=\"checkRadio()\">Sí</mat-radio-button>\r\n      <br>\r\n      <mat-radio-button value=\"no\" (click)=\"checkRadio()\">No</mat-radio-button>\r\n    </mat-radio-group>\r\n<mat-dialog-actions align=\"end\">\r\n  <button mat-button color=\"primary\" mat-dialog-close>\r\n    Cancelar\r\n  </button>\r\n  <button mat-button color=\"primary\" [disabled]=\"disable\" [mat-dialog-close]=\"radioGroup.value\">\r\n    Enviar\r\n  </button>\r\n</mat-dialog-actions>\r\n"

/***/ }),

/***/ "./src/app/student/yesNoDialog.component.ts":
/*!**************************************************!*\
  !*** ./src/app/student/yesNoDialog.component.ts ***!
  \**************************************************/
/*! exports provided: YesNoDialogComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "YesNoDialogComponent", function() { return YesNoDialogComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");



var YesNoDialogComponent = /** @class */ (function () {
    function YesNoDialogComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.disable = true;
    }
    YesNoDialogComponent.prototype.checkRadio = function () {
        this.disable = false;
    };
    YesNoDialogComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "yesnodialog",
            template: __webpack_require__(/*! ./yesNoDialog.component.html */ "./src/app/student/yesNoDialog.component.html"),
            styles: ["\n  mat-radio-button {\n    margin-bottom: 5px\n  }\n  "]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], Object])
    ], YesNoDialogComponent);
    return YesNoDialogComponent;
}());



/***/ }),

/***/ "./src/app/teacher/answer.service.ts":
/*!*******************************************!*\
  !*** ./src/app/teacher/answer.service.ts ***!
  \*******************************************/
/*! exports provided: AnswerService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnswerService", function() { return AnswerService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");







//It will be necessary to access the user information by a new service
var AnswerService = /** @class */ (function () {
    function AnswerService(http, loginService) {
        this.http = http;
        this.loginService = loginService;
        this.apiUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].baseUrl;
        this.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            "Content-Type": "application/json"
        });
    }
    AnswerService.prototype.getMarkedAnswers = function (id, page) {
        return this.http.get(this.apiUrl + "/concepts/" + id + "/markedanswers" + "?page=" + page, { withCredentials: true });
    };
    AnswerService.prototype.getUnmarkedAnswers = function (id, page) {
        return this.http.get(this.apiUrl + "/concepts/" + id + "/unmarkedanswers" + "?page=" + page, { withCredentials: true });
    };
    AnswerService.prototype.removeAnswer = function (answerId, conceptId) {
        var _this = this;
        return this.http
            .delete(this.apiUrl + "/concepts/" + conceptId + "/answers/" + answerId)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["catchError"])(function (error) { return _this.handleError(error); }));
    };
    AnswerService.prototype.handleError = function (error) {
        console.error(error);
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["throwError"])(new Error("Server error (" + error.status + "): " + error));
    };
    AnswerService.prototype.postNewAnswer = function (id, answer) {
        return this.http.post(this.apiUrl + "/concepts/" + id + "/answers", answer, { withCredentials: true });
    };
    AnswerService.prototype.editAnswer = function (conceptId, answerId, answerText, correct) {
        var body = {
            answerText: answerText,
            correct: correct
        };
        return this.http.put(this.apiUrl + "/concepts/" + conceptId + "/answers/" + answerId, body, { headers: this.headers, withCredentials: true });
    };
    AnswerService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"], _login_login_service__WEBPACK_IMPORTED_MODULE_5__["LoginService"]])
    ], AnswerService);
    return AnswerService;
}());



/***/ }),

/***/ "./src/app/teacher/dialogAnswer.component.html":
/*!*****************************************************!*\
  !*** ./src/app/teacher/dialogAnswer.component.html ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Nueva respuesta</h1>\r\n<div mat-dialog-content>\r\n    <form class=\"newAnswer\">\r\n        <p class=\"padding\">Respuesta:</p>\r\n        <mat-form-field>\r\n            <input matInput [(ngModel)]=\"answerText\" name=\"answerText\">\r\n        </mat-form-field>\r\n        <mat-radio-group aria-label=\"Selecciona una opción\" class=\"padding\" [(ngModel)]=\"correct\" name=\"correct\">\r\n            <mat-radio-button value=\"true\">Correcta</mat-radio-button>\r\n            <mat-radio-button value=\"false\">Incorrecta</mat-radio-button>\r\n        </mat-radio-group>\r\n        <div *ngIf=\"correct\">\r\n            <p class=\"padding\">Justificacion: </p>\r\n            <mat-form-field>\r\n                <input matInput class=\"padding\" [(ngModel)]=\"justificationText\" name=\"justificationText\">\r\n            </mat-form-field>\r\n            <mat-radio-group aria-label=\"Selecciona una opción\" class=\"padding\" [(ngModel)]=\"validJustification\"\r\n                name=\"validJustification\">\r\n                <mat-radio-button value=\"true\">Valida</mat-radio-button>\r\n                <mat-radio-button value=\"false\">Invalida</mat-radio-button>\r\n            </mat-radio-group>\r\n        </div>\r\n        <div *ngIf=\"validJustification\">\r\n            <p class=\"padding\">Error: </p>\r\n            <mat-form-field>\r\n                <input matInput class=\"padding\" [(ngModel)]=\"error\" name=\"error\">\r\n            </mat-form-field>\r\n        </div>\r\n    </form>\r\n</div>\r\n<div mat-dialog-actions>\r\n    <button mat-button [disabled]=\"(!correct) || (!answerText)\" (click)=\"newAnswer()\" cdkFocusInitial>Aceptar</button>\r\n    <button mat-button (click)=\"onNoClick()\">Cancelar</button>\r\n</div>"

/***/ }),

/***/ "./src/app/teacher/dialogJust.component.html":
/*!***************************************************!*\
  !*** ./src/app/teacher/dialogJust.component.html ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Nueva Justificación</h1>\r\n<div mat-dialog-content>\r\n    <form>\r\n        <p class=\"padding\">Justificación:</p>\r\n        <mat-form-field>\r\n                <input matInput [(ngModel)]=\"justificationText\" name=\"justificationText\">\r\n        </mat-form-field>\r\n            <mat-radio-group aria-label=\"Selecciona una opción\" class=\"padding\" [(ngModel)]=\"validJustification\" name=\"validJustification\"> \r\n                <mat-radio-button value=\"true\">Valida</mat-radio-button>\r\n                <mat-radio-button value=\"false\">Invalida</mat-radio-button>\r\n            </mat-radio-group>\r\n            <p class=\"padding\">Error: </p>\r\n            <mat-form-field>\r\n                <input matInput class=\"padding\" [(ngModel)]=\"error\" name=\"error\">\r\n            </mat-form-field>\r\n    </form>\r\n</div>\r\n<div mat-dialog-actions>\r\n    <button mat-button (click)=\"newJustification()\" cdkFocusInitial>Aceptar</button>\r\n    <button mat-button (click)=\"onNoClick()\">Cancelar</button>\r\n</div>"

/***/ }),

/***/ "./src/app/teacher/imageposter.component.css":
/*!***************************************************!*\
  !*** ./src/app/teacher/imageposter.component.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".imageList {\r\n    vertical-align: middle;\r\n    width: 100px;\r\n    height: 100px;\r\n    margin: 20px;\r\n}\r\ntd-file-upload {\r\n    display: inline-block\r\n}\r\nimg {\r\n    border: 1px solid black;\r\n    width: 100px;\r\n    height: 100px;\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdGVhY2hlci9pbWFnZXBvc3Rlci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksc0JBQXNCO0lBQ3RCLFlBQVk7SUFDWixhQUFhO0lBQ2IsWUFBWTtBQUNoQjtBQUNBO0lBQ0k7QUFDSjtBQUVBO0lBQ0ksdUJBQXVCO0lBQ3ZCLFlBQVk7SUFDWixhQUFhO0FBQ2pCIiwiZmlsZSI6InNyYy9hcHAvdGVhY2hlci9pbWFnZXBvc3Rlci5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmltYWdlTGlzdCB7XHJcbiAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xyXG4gICAgd2lkdGg6IDEwMHB4O1xyXG4gICAgaGVpZ2h0OiAxMDBweDtcclxuICAgIG1hcmdpbjogMjBweDtcclxufVxyXG50ZC1maWxlLXVwbG9hZCB7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2tcclxufVxyXG5cclxuaW1nIHtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xyXG4gICAgd2lkdGg6IDEwMHB4O1xyXG4gICAgaGVpZ2h0OiAxMDBweDtcclxufSJdfQ== */"

/***/ }),

/***/ "./src/app/teacher/imageposter.component.html":
/*!****************************************************!*\
  !*** ./src/app/teacher/imageposter.component.html ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-card>\r\n  <mat-card-header>\r\n    <mat-card-title>Imagen</mat-card-title>\r\n  </mat-card-header>\r\n  <img class=\"imageList\" [src]=\"this.image\">\r\n  <td-file-upload\r\n    #singleFileUpload\r\n    (upload)=\"uploadEvent($event)\"\r\n    required\r\n  >\r\n    <mat-icon>file_upload</mat-icon\r\n    ><span>{{ singleFileUpload.value?.name }}</span>\r\n    <ng-template td-file-input-label>\r\n      <mat-icon>attach_file</mat-icon>\r\n      <span>Selecciona una imagen...</span>\r\n      <span [hidden]=\"!singleFileUpload?.required\"></span>\r\n    </ng-template>\r\n  </td-file-upload>\r\n</mat-card>\r\n"

/***/ }),

/***/ "./src/app/teacher/imageposter.component.ts":
/*!**************************************************!*\
  !*** ./src/app/teacher/imageposter.component.ts ***!
  \**************************************************/
/*! exports provided: ImagePosterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImagePosterComponent", function() { return ImagePosterComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _images_image_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../images/image.service */ "./src/app/images/image.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");




var ImagePosterComponent = /** @class */ (function () {
    function ImagePosterComponent(imageService, activatedRoute) {
        this.imageService = imageService;
        this.activatedRoute = activatedRoute;
        this.conceptId = activatedRoute.snapshot.params["id"];
        this.loadImage();
    }
    ImagePosterComponent.prototype.uploadEvent = function (file) {
        var _this = this;
        this.imageService.postImage(file, this.conceptId).subscribe(function (data) {
            _this.loadImage();
        }, function (error) { return _this.loadImage(); });
    };
    ImagePosterComponent.prototype.loadImage = function () {
        var _this = this;
        this.imageService.getImage(this.conceptId).subscribe(function (data) { return _this.imageService.createImageFromBlob(data, (function (image) { return _this.image = image; })); }, function (error) { return console.log(error); });
    };
    ImagePosterComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "imageposter",
            template: __webpack_require__(/*! ./imageposter.component.html */ "./src/app/teacher/imageposter.component.html"),
            styles: [__webpack_require__(/*! ./imageposter.component.css */ "./src/app/teacher/imageposter.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_images_image_service__WEBPACK_IMPORTED_MODULE_2__["ImageService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]])
    ], ImagePosterComponent);
    return ImagePosterComponent;
}());



/***/ }),

/***/ "./src/app/teacher/justification.service.ts":
/*!**************************************************!*\
  !*** ./src/app/teacher/justification.service.ts ***!
  \**************************************************/
/*! exports provided: JustificationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JustificationService", function() { return JustificationService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _login_login_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../login/login.service */ "./src/app/login/login.service.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");







var BASE_URL = _environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].baseUrl;
//It will be necessary to access the user information by a new service
var JustificationService = /** @class */ (function () {
    function JustificationService(http, loginService) {
        this.http = http;
        this.loginService = loginService;
        this.apiUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].baseUrl;
        this.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            "Content-Type": "application/json"
        });
    }
    JustificationService.prototype.getUnmarkedJustifications = function (id, page) {
        return this.http.get(this.apiUrl + "/concepts/" + id + "/unmarkedjustifications" + "?page=" + page, { withCredentials: true });
    };
    JustificationService.prototype.getMarkedJustificationsByAnswer = function (conceptId, answerId, page) {
        return this.http.get(this.apiUrl + "/concepts/" + conceptId + "/answers/" + answerId + "/markedjustifications" + "?page=" + page, { withCredentials: true });
    };
    JustificationService.prototype.removeJustification = function (justId, answerId) {
        var _this = this;
        return this.http
            .delete(this.apiUrl + '/answers/' + answerId + '/justifications/' + justId)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["catchError"])(function (error) {
            if (error.status === 400) {
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["throwError"])(error.status);
            }
            else {
                _this.handleError(error);
            }
        }));
    };
    JustificationService.prototype.handleError = function (error) {
        console.error(error);
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["throwError"])(new Error('Server error (' + error.status + '): ' + error));
    };
    JustificationService.prototype.postNewJustification = function (id, just) {
        return this.http.post(this.apiUrl + "/answers/" + id + "/justifications", just, { withCredentials: true });
    };
    JustificationService.prototype.markJustification = function (answerId, justId, valid, errorText) {
        var body = {
            valid: valid
        };
        if (errorText) {
            body["errorText"] = errorText;
        }
        return this.http.put(this.apiUrl + "/answers/" + answerId + "/correct/" + justId, body, { headers: this.headers, withCredentials: true });
    };
    JustificationService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"], _login_login_service__WEBPACK_IMPORTED_MODULE_5__["LoginService"]])
    ], JustificationService);
    return JustificationService;
}());



/***/ }),

/***/ "./src/app/teacher/newanswer.component.css":
/*!*************************************************!*\
  !*** ./src/app/teacher/newanswer.component.css ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".padding {\r\n   padding-top: 1%;\r\n}\r\n\r\nmat-form-field {\r\n    width: 100%;\r\n}\r\n\r\nmat-radio-button {\r\n    margin-left: 16px;\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdGVhY2hlci9uZXdhbnN3ZXIuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtHQUNHLGVBQWU7QUFDbEI7O0FBRUE7SUFDSSxXQUFXO0FBQ2Y7O0FBRUE7SUFDSSxpQkFBaUI7QUFDckIiLCJmaWxlIjoic3JjL2FwcC90ZWFjaGVyL25ld2Fuc3dlci5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLnBhZGRpbmcge1xyXG4gICBwYWRkaW5nLXRvcDogMSU7XHJcbn1cclxuXHJcbm1hdC1mb3JtLWZpZWxkIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG59XHJcblxyXG5tYXQtcmFkaW8tYnV0dG9uIHtcclxuICAgIG1hcmdpbi1sZWZ0OiAxNnB4O1xyXG59Il19 */"

/***/ }),

/***/ "./src/app/teacher/newanswer.component.ts":
/*!************************************************!*\
  !*** ./src/app/teacher/newanswer.component.ts ***!
  \************************************************/
/*! exports provided: NewAnswerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NewAnswerComponent", function() { return NewAnswerComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _answer_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./answer.service */ "./src/app/teacher/answer.service.ts");
/* harmony import */ var _justification_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./justification.service */ "./src/app/teacher/justification.service.ts");





var NewAnswerComponent = /** @class */ (function () {
    function NewAnswerComponent(dialogRef, data, answerService, justificationService) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.answerService = answerService;
        this.justificationService = justificationService;
        this.marked = true;
        this.markedJustification = true;
        this.id = data["id"];
    }
    NewAnswerComponent.prototype.newAnswer = function () {
        var _this = this;
        var justificationArray = [];
        var justification;
        if (this.validJustification !== false) {
            justification = {
                justificationText: this.justificationText,
                marked: this.markedJustification,
                valid: this.validJustification,
                error: this.error,
            };
        }
        else {
            justification = {
                justificationText: this.justificationText,
                marked: this.markedJustification,
                valid: this.validJustification,
            };
        }
        if (justification.justificationText != null) {
            justificationArray.push(justification);
        }
        var answer = {
            answerText: this.answerText,
            marked: this.marked,
            correct: this.correct,
            justifications: justificationArray
        };
        this.answerService.postNewAnswer(this.id, answer).subscribe(function (data) { return _this.dialogRef.close(data); }, function (error) { return console.log(error); });
    };
    NewAnswerComponent.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    NewAnswerComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'dialogAnswer',
            template: __webpack_require__(/*! ./dialogAnswer.component.html */ "./src/app/teacher/dialogAnswer.component.html"),
            styles: [__webpack_require__(/*! ./newanswer.component.css */ "./src/app/teacher/newanswer.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], Object, _answer_service__WEBPACK_IMPORTED_MODULE_3__["AnswerService"],
            _justification_service__WEBPACK_IMPORTED_MODULE_4__["JustificationService"]])
    ], NewAnswerComponent);
    return NewAnswerComponent;
}());



/***/ }),

/***/ "./src/app/teacher/newjust.component.css":
/*!***********************************************!*\
  !*** ./src/app/teacher/newjust.component.css ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".padding {\r\n    padding-top: 1%;\r\n }\r\n \r\n mat-form-field {\r\n     width: 100%;\r\n }\r\n \r\n mat-radio-button {\r\n     margin-left: 16px;\r\n }\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdGVhY2hlci9uZXdqdXN0LmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxlQUFlO0NBQ2xCOztDQUVBO0tBQ0ksV0FBVztDQUNmOztDQUVBO0tBQ0ksaUJBQWlCO0NBQ3JCIiwiZmlsZSI6InNyYy9hcHAvdGVhY2hlci9uZXdqdXN0LmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIucGFkZGluZyB7XHJcbiAgICBwYWRkaW5nLXRvcDogMSU7XHJcbiB9XHJcbiBcclxuIG1hdC1mb3JtLWZpZWxkIHtcclxuICAgICB3aWR0aDogMTAwJTtcclxuIH1cclxuIFxyXG4gbWF0LXJhZGlvLWJ1dHRvbiB7XHJcbiAgICAgbWFyZ2luLWxlZnQ6IDE2cHg7XHJcbiB9Il19 */"

/***/ }),

/***/ "./src/app/teacher/newjust.component.ts":
/*!**********************************************!*\
  !*** ./src/app/teacher/newjust.component.ts ***!
  \**********************************************/
/*! exports provided: NewJustComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NewJustComponent", function() { return NewJustComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _justification_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./justification.service */ "./src/app/teacher/justification.service.ts");




var NewJustComponent = /** @class */ (function () {
    function NewJustComponent(dialogRef, data, justificationService) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.justificationService = justificationService;
        this.id = data["id"];
    }
    NewJustComponent.prototype.newJustification = function () {
        var _this = this;
        var justification = {
            justificationText: this.justificationText,
            valid: this.validJustification,
            error: this.error,
            marked: true
        };
        this.justificationService.postNewJustification(this.id, justification).subscribe(function (data) { return _this.dialogRef.close(data); }, function (error) { return console.log(error); });
    };
    NewJustComponent.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    NewJustComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'dialogJust',
            template: __webpack_require__(/*! ./dialogJust.component.html */ "./src/app/teacher/dialogJust.component.html"),
            styles: [__webpack_require__(/*! ./newjust.component.css */ "./src/app/teacher/newjust.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], Object, _justification_service__WEBPACK_IMPORTED_MODULE_3__["JustificationService"]])
    ], NewJustComponent);
    return NewJustComponent;
}());



/***/ }),

/***/ "./src/app/teacher/teacher.component.css":
/*!***********************************************!*\
  !*** ./src/app/teacher/teacher.component.css ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".checkOverflow {\r\n    overflow: auto;\r\n}\r\n\r\ntextarea {\r\n    resize: none;\r\n    text-rendering: auto;\r\n    color: initial;\r\n    letter-spacing: normal;\r\n    word-spacing: normal;\r\n    text-transform: none;\r\n    text-indent: 0px;\r\n    text-shadow: none;\r\n    display: inline-block;\r\n    text-align: start;\r\n    margin: 0em;\r\n    font: 400 13.3333px Arial;\r\n}\r\n\r\n.teacherContent {\r\n    padding-top: 2.5%;\r\n}\r\n\r\n.teacherCard {\r\n    font-size: 100%;\r\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif\r\n}\r\n\r\nmat-card-title {\r\n    text-align: left;\r\n    text-transform: uppercase;\r\n    padding-bottom: 2%;\r\n    font-family: Arial, Helvetica, sans-serif;\r\n}\r\n\r\nmat-nav-list{\r\n    background-color: lightgray;\r\n}\r\n\r\nmat-card-actions{\r\n    color: blue;\r\n}\r\n\r\nmat-card-subtitle{\r\n    font: arial;\r\n    font-size: 80%;\r\n}\r\n\r\n.correctSize .mat-list-item {\r\n    height: auto;\r\n    font-family: sans-serif;\r\n}\r\n\r\n.answer{\r\n    font-family: Verdana, Geneva, Tahoma, sans-serif;\r\n    float: left;\r\n    width: 80%;\r\n    text-align: left;\r\n}\r\n\r\n.question {\r\n    float: left;\r\n    width: 50%;\r\n}\r\n\r\n.icon {\r\n    float: left;\r\n    width: 10%;\r\n}\r\n\r\ntable {\r\n    width:90%\r\n}\r\n\r\nbutton {\r\n    margin: 5px\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdGVhY2hlci90ZWFjaGVyLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxjQUFjO0FBQ2xCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLG9CQUFvQjtJQUNwQixjQUFjO0lBQ2Qsc0JBQXNCO0lBQ3RCLG9CQUFvQjtJQUNwQixvQkFBb0I7SUFDcEIsZ0JBQWdCO0lBQ2hCLGlCQUFpQjtJQUNqQixxQkFBcUI7SUFDckIsaUJBQWlCO0lBQ2pCLFdBQVc7SUFDWCx5QkFBeUI7QUFDN0I7O0FBRUE7SUFDSSxpQkFBaUI7QUFDckI7O0FBRUE7SUFDSSxlQUFlO0lBQ2Y7QUFDSjs7QUFFQTtJQUNJLGdCQUFnQjtJQUNoQix5QkFBeUI7SUFDekIsa0JBQWtCO0lBQ2xCLHlDQUF5QztBQUM3Qzs7QUFFQTtJQUNJLDJCQUEyQjtBQUMvQjs7QUFFQTtJQUNJLFdBQVc7QUFDZjs7QUFFQTtJQUNJLFdBQVc7SUFDWCxjQUFjO0FBQ2xCOztBQUdBO0lBQ0ksWUFBWTtJQUNaLHVCQUF1QjtBQUMzQjs7QUFFQTtJQUNJLGdEQUFnRDtJQUNoRCxXQUFXO0lBQ1gsVUFBVTtJQUNWLGdCQUFnQjtBQUNwQjs7QUFFQTtJQUNJLFdBQVc7SUFDWCxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxXQUFXO0lBQ1gsVUFBVTtBQUNkOztBQUVBO0lBQ0k7QUFDSjs7QUFFQTtJQUNJO0FBQ0oiLCJmaWxlIjoic3JjL2FwcC90ZWFjaGVyL3RlYWNoZXIuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jaGVja092ZXJmbG93IHtcclxuICAgIG92ZXJmbG93OiBhdXRvO1xyXG59XHJcblxyXG50ZXh0YXJlYSB7XHJcbiAgICByZXNpemU6IG5vbmU7XHJcbiAgICB0ZXh0LXJlbmRlcmluZzogYXV0bztcclxuICAgIGNvbG9yOiBpbml0aWFsO1xyXG4gICAgbGV0dGVyLXNwYWNpbmc6IG5vcm1hbDtcclxuICAgIHdvcmQtc3BhY2luZzogbm9ybWFsO1xyXG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XHJcbiAgICB0ZXh0LWluZGVudDogMHB4O1xyXG4gICAgdGV4dC1zaGFkb3c6IG5vbmU7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgICB0ZXh0LWFsaWduOiBzdGFydDtcclxuICAgIG1hcmdpbjogMGVtO1xyXG4gICAgZm9udDogNDAwIDEzLjMzMzNweCBBcmlhbDtcclxufVxyXG5cclxuLnRlYWNoZXJDb250ZW50IHtcclxuICAgIHBhZGRpbmctdG9wOiAyLjUlO1xyXG59XHJcblxyXG4udGVhY2hlckNhcmQge1xyXG4gICAgZm9udC1zaXplOiAxMDAlO1xyXG4gICAgZm9udC1mYW1pbHk6ICdHaWxsIFNhbnMnLCAnR2lsbCBTYW5zIE1UJywgQ2FsaWJyaSwgJ1RyZWJ1Y2hldCBNUycsIHNhbnMtc2VyaWZcclxufVxyXG5cclxubWF0LWNhcmQtdGl0bGUge1xyXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcclxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XHJcbiAgICBwYWRkaW5nLWJvdHRvbTogMiU7XHJcbiAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcclxufVxyXG5cclxubWF0LW5hdi1saXN0e1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogbGlnaHRncmF5O1xyXG59XHJcblxyXG5tYXQtY2FyZC1hY3Rpb25ze1xyXG4gICAgY29sb3I6IGJsdWU7XHJcbn1cclxuXHJcbm1hdC1jYXJkLXN1YnRpdGxle1xyXG4gICAgZm9udDogYXJpYWw7XHJcbiAgICBmb250LXNpemU6IDgwJTtcclxufVxyXG5cclxuXHJcbi5jb3JyZWN0U2l6ZSAubWF0LWxpc3QtaXRlbSB7XHJcbiAgICBoZWlnaHQ6IGF1dG87XHJcbiAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcclxufVxyXG5cclxuLmFuc3dlcntcclxuICAgIGZvbnQtZmFtaWx5OiBWZXJkYW5hLCBHZW5ldmEsIFRhaG9tYSwgc2Fucy1zZXJpZjtcclxuICAgIGZsb2F0OiBsZWZ0O1xyXG4gICAgd2lkdGg6IDgwJTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbn1cclxuXHJcbi5xdWVzdGlvbiB7XHJcbiAgICBmbG9hdDogbGVmdDtcclxuICAgIHdpZHRoOiA1MCU7XHJcbn1cclxuXHJcbi5pY29uIHtcclxuICAgIGZsb2F0OiBsZWZ0O1xyXG4gICAgd2lkdGg6IDEwJTtcclxufVxyXG5cclxudGFibGUge1xyXG4gICAgd2lkdGg6OTAlXHJcbn1cclxuXHJcbmJ1dHRvbiB7XHJcbiAgICBtYXJnaW46IDVweFxyXG59Il19 */"

/***/ }),

/***/ "./src/app/teacher/teacher.component.html":
/*!************************************************!*\
  !*** ./src/app/teacher/teacher.component.html ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<urlchange></urlchange>\r\n<imageposter></imageposter>\r\n<div class=\"checkOverflow teacherContent\">\r\n  <mat-card class=\"checkOverflow teacherContent\">\r\n    <mat-card-title>Respuestas corregidas</mat-card-title>\r\n    <mat-nav-list\r\n      *ngIf=\"markedAnswers?.length == 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <mat-card-content>No hay respuestas corregidas</mat-card-content>\r\n      <div align=\"center\">\r\n        <button mat-raised-button color=\"primary\" (click)=\"openDialogAnswer()\">\r\n          <mat-icon>add</mat-icon>\r\n        </button>\r\n      </div>\r\n    </mat-nav-list>\r\n    <mat-nav-list\r\n      *ngIf=\"markedAnswers?.length > 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <div\r\n        *ngFor=\"let ans of markedAnswers\"\r\n        role=\"listitem\"\r\n        class=\"checkOverflow\"\r\n      >\r\n        <div *ngIf=\"ans.marked\" class=\"answer\">\r\n          <mat-divider></mat-divider>\r\n          <table>\r\n            <td style=\"width: 110%\">\r\n              <textarea\r\n                value=\"{{ ans.answerText }}\"\r\n                style=\"width: 90%\"\r\n                rows=\"3\"\r\n                autocapitalize=\"characters\"\r\n                required\r\n                #answerText\r\n              ></textarea>\r\n            </td>\r\n            <mat-radio-group>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct{{ ans.id }}\"\r\n                  [checked]=\"ans.correct\"\r\n                  value=\"yes\"\r\n                >\r\n                  Correcta\r\n                </mat-radio-button>\r\n              </td>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct{{ ans.id }}\"\r\n                  [checked]=\"!ans.correct\"\r\n                  value=\"no\"\r\n                  #markedAnswerIncorrect\r\n                >\r\n                  Incorrecta\r\n                </mat-radio-button>\r\n              </td>\r\n            </mat-radio-group>\r\n          </table>\r\n          <table class=\"btnPanel\">\r\n            <td>\r\n              <button\r\n                mat-raised-button\r\n                color=\"primary\"\r\n                (click)=\"deleteAnswer(ans.id)\"\r\n              >\r\n                <mat-icon>delete</mat-icon> Borrar\r\n              </button>\r\n\r\n              <button\r\n                mat-raised-button\r\n                color=\"primary\"\r\n                (click)=\"\r\n                  editAnswer(\r\n                    ans,\r\n                    answerText.value,\r\n                    markedAnswerIncorrect.checked\r\n                  )\r\n                \"\r\n              >\r\n                <mat-icon>build</mat-icon>Editar\r\n              </button>\r\n            </td>\r\n          </table>\r\n          <div *ngIf=\"!ans.correct\">\r\n            <a\r\n              *ngFor=\"let jus of markedJust.get(ans.id)\"\r\n              role=\"listitem\"\r\n              class=\"checkOverflow\"\r\n              required\r\n            >\r\n              <table>\r\n                <td style=\"width: 100%\">\r\n                  <mat-card-subtitle> JUSTIFICACION: </mat-card-subtitle>\r\n                  <table style=\"width: 80%\">\r\n                    <td style=\"width: 80%\">\r\n                      <textarea\r\n                        value=\"{{ jus.justificationText }}\"\r\n                        style=\"width: 90%\"\r\n                        rows=\"3\"\r\n                        autocapitalize=\"characters\"\r\n                      ></textarea>\r\n                    </td>\r\n                    <mat-radio-group>\r\n                      <td>\r\n                        <mat-radio-button\r\n                          color=\"primary\"\r\n                          name=\"valid{{ jus.id }}\"\r\n                          [checked]=\"jus.valid\"\r\n                          value=\"yes\"\r\n                        >\r\n                          Válida\r\n                        </mat-radio-button>\r\n                      </td>\r\n                      <td>\r\n                        <mat-radio-button\r\n                          color=\"primary\"\r\n                          name=\"valid{{ jus.id }}\"\r\n                          [checked]=\"!jus.valid\"\r\n                          value=\"no\"\r\n                        >\r\n                          Inválida\r\n                        </mat-radio-button>\r\n                      </td>\r\n                    </mat-radio-group>\r\n                  </table>\r\n                </td>\r\n                <td [hidden]=\"jus.valid\">\r\n                  <mat-card-subtitle> ERROR: </mat-card-subtitle>\r\n                  <textarea\r\n                    value=\"{{ jus.error }}\"\r\n                    style=\"width: 200%\"\r\n                    rows=\"3\"\r\n                    autocapitalize=\"characters\"\r\n                  ></textarea>\r\n                </td>\r\n              </table>\r\n              <table>\r\n                <td>\r\n                  <button\r\n                    mat-raised-button\r\n                    color=\"primary\"\r\n                    (click)=\"deleteJustification(jus.id, ans.id)\"\r\n                  >\r\n                    <mat-icon>delete</mat-icon>\r\n                  </button>\r\n                  <button mat-raised-button color=\"primary\">\r\n                    <mat-icon></mat-icon>\r\n                  </button>\r\n                </td>\r\n              </table>\r\n            </a>\r\n            <mat-divider></mat-divider>\r\n            <table>\r\n              <td>\r\n                <button\r\n                  mat-raised-button\r\n                  color=\"primary\"\r\n                  (click)=\"getMarkedJustificationsByAnswer(ans.id)\"\r\n                >\r\n                  <span>Mostrar más</span>\r\n                </button>\r\n              </td>\r\n              <td>\r\n                <button\r\n                  mat-raised-button\r\n                  color=\"primary\"\r\n                  (click)=\"addJustification(ans.id)\"\r\n                >\r\n                  <mat-icon>plus_one</mat-icon>\r\n                </button>\r\n              </td>\r\n            </table>\r\n          </div>\r\n        </div>\r\n        <mat-divider></mat-divider>\r\n      </div>\r\n      <button mat-raised-button color=\"primary\" (click)=\"getMarkedAnswers()\">\r\n        <span>Mostrar más</span>\r\n      </button>\r\n      <div align=\"center\">\r\n        <button mat-raised-button color=\"primary\" (click)=\"openDialogAnswer()\">\r\n          <mat-icon>add</mat-icon>\r\n        </button>\r\n      </div>\r\n    </mat-nav-list>\r\n  </mat-card>\r\n\r\n  <mat-card class=\"checkOverflow teacherContent\">\r\n    <mat-card-title>Respuestas por corregir</mat-card-title>\r\n    <mat-nav-list\r\n      *ngIf=\"unmarkedAnswers?.length == 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <mat-card-content>No hay respuestas por corregir</mat-card-content>\r\n    </mat-nav-list>\r\n    <mat-nav-list\r\n      *ngIf=\"unmarkedAnswers?.length > 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <div\r\n        *ngFor=\"let ans of unmarkedAnswers\"\r\n        role=\"listitem\"\r\n        class=\"checkOverflow\"\r\n      >\r\n        <div class=\"answer\">\r\n          <mat-divider></mat-divider>\r\n          <table>\r\n            <td style=\"width: 90%\">\r\n              <textarea\r\n                value=\"{{ ans.answerText }}\"\r\n                style=\"width: 90%\"\r\n                rows=\"3\"\r\n                autocapitalize=\"characters\"\r\n                disabled\r\n                required\r\n              ></textarea>\r\n            </td>\r\n            <mat-radio-group>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct\"\r\n                  id=\"correct{{ ans.id }}\"\r\n                  [checked]=\"false\"\r\n                  value=\"yes\"\r\n                >\r\n                  Correcta\r\n                </mat-radio-button>\r\n              </td>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct\"\r\n                  id=\"incorrect{{ ans.id }}\"\r\n                  [checked]=\"false\"\r\n                  value=\"no\"\r\n                >\r\n                  Incorrecta\r\n                </mat-radio-button>\r\n              </td>\r\n            </mat-radio-group>\r\n          </table>\r\n          <button mat-raised-button color=\"primary\">\r\n            <span>Corregir (no hace na)</span>\r\n          </button>\r\n        </div>\r\n        <mat-divider></mat-divider>\r\n      </div>\r\n      <button mat-raised-button color=\"primary\" (click)=\"getUnmarkedAnswers()\">\r\n        <span>Mostrar más</span>\r\n      </button>\r\n    </mat-nav-list>\r\n  </mat-card>\r\n\r\n  <mat-card class=\"checkOverflow teacherContent\">\r\n    <mat-card-title>Justificaciones por corregir</mat-card-title>\r\n    <mat-nav-list\r\n      *ngIf=\"unmarkedJust?.length == 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <mat-card-content>No hay justificaciones por corregir</mat-card-content>\r\n    </mat-nav-list>\r\n    <mat-nav-list\r\n      *ngIf=\"unmarkedJust?.length > 0\"\r\n      role=\"list\"\r\n      class=\"correctSize\"\r\n    >\r\n      <div\r\n        *ngFor=\"let jus of unmarkedJust\"\r\n        role=\"listitem\"\r\n        class=\"checkOverflow\"\r\n      >\r\n        <div class=\"answer\">\r\n          <table>\r\n            <td style=\"width: 90%\">\r\n              <textarea\r\n                value=\"{{ jus.answer.answerText }}\"\r\n                style=\"width: 90%\"\r\n                rows=\"3\"\r\n                required\r\n                disabled\r\n              ></textarea>\r\n            </td>\r\n            <mat-radio-group>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct\"\r\n                  id=\"correct{{ jus.answer.id }}\"\r\n                  [checked]=\"jus.answer.correct === true\"\r\n                  value=\"yes\"\r\n                  required\r\n                  disabled\r\n                >\r\n                  Correcta\r\n                </mat-radio-button>\r\n              </td>\r\n              <td>\r\n                <mat-radio-button\r\n                  color=\"primary\"\r\n                  name=\"correct\"\r\n                  id=\"incorrect{{ jus.answer.id }}\"\r\n                  [checked]=\"jus.answer.correct === false\"\r\n                  value=\"no\"\r\n                  required\r\n                  disabled\r\n                >\r\n                  Incorrecta\r\n                </mat-radio-button>\r\n              </td>\r\n            </mat-radio-group>\r\n          </table>\r\n          <table>\r\n            <td style=\"width: 100%\">\r\n              <mat-card-subtitle> JUSTIFICACION: </mat-card-subtitle>\r\n              <table style=\"width: 80%\">\r\n                <td style=\"width: 80%\">\r\n                  <textarea\r\n                    value=\"{{ jus.justificationText }}\"\r\n                    style=\"width: 90%\"\r\n                    rows=\"3\"\r\n                    autocapitalize=\"characters\"\r\n                    disabled\r\n                  ></textarea>\r\n                </td>\r\n                <mat-radio-group>\r\n                  <td>\r\n                    <mat-radio-button\r\n                      color=\"primary\"\r\n                      name=\"valid{{ jus.id }}\"\r\n                      [checked]=\"false\"\r\n                      value=\"yes\"\r\n                      #validRadio\r\n                    >\r\n                      Válida\r\n                    </mat-radio-button>\r\n                  </td>\r\n                  <td>\r\n                    <mat-radio-button\r\n                      color=\"primary\"\r\n                      name=\"valid{{ jus.id }}\"\r\n                      [checked]=\"false\"\r\n                      value=\"no\"\r\n                      #invalidRadio\r\n                    >\r\n                      Inválida\r\n                    </mat-radio-button>\r\n                  </td>\r\n                </mat-radio-group>\r\n              </table>\r\n            </td>\r\n            <td [hidden]=\"!invalidRadio.checked\">\r\n              <mat-card-subtitle> ERROR: </mat-card-subtitle>\r\n              <textarea\r\n                style=\"width: 200%\"\r\n                rows=\"3\"\r\n                autocapitalize=\"characters\"\r\n                #errorMarkJust\r\n              ></textarea>\r\n            </td>\r\n          </table>\r\n          <table class=\"btnPanel\">\r\n            <td>\r\n              <button\r\n                mat-raised-button\r\n                (click)=\"this.markJust(jus.answer.id, jus.id, invalidRadio.checked, validRadio.checked, errorMarkJust?.value)\"\r\n                color=\"primary\"\r\n              >\r\n                <mat-icon>done</mat-icon>Corregir\r\n              </button>\r\n            </td>\r\n          </table>\r\n        </div>\r\n      </div>\r\n      <button\r\n        mat-raised-button\r\n        color=\"primary\"\r\n        (click)=\"getUnmarkedJustifications()\"\r\n      >\r\n        <span>Mostrar más</span>\r\n      </button>\r\n    </mat-nav-list>\r\n  </mat-card>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/teacher/teacher.component.ts":
/*!**********************************************!*\
  !*** ./src/app/teacher/teacher.component.ts ***!
  \**********************************************/
/*! exports provided: TeacherComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TeacherComponent", function() { return TeacherComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _answer_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./answer.service */ "./src/app/teacher/answer.service.ts");
/* harmony import */ var _justification_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./justification.service */ "./src/app/teacher/justification.service.ts");
/* harmony import */ var _diagram_diagram_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../diagram/diagram.component */ "./src/app/diagram/diagram.component.ts");
/* harmony import */ var _newanswer_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./newanswer.component */ "./src/app/teacher/newanswer.component.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _covalent_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @covalent/core */ "./node_modules/@covalent/core/fesm5/covalent-core.js");
/* harmony import */ var _newjust_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./newjust.component */ "./src/app/teacher/newjust.component.ts");










/**
 * Wrapper component for all teacher information.
 */
var TeacherComponent = /** @class */ (function () {
    function TeacherComponent(answerDialog, diagramDialog, router, activatedRoute, answerService, justificationService, dialogService) {
        this.answerDialog = answerDialog;
        this.diagramDialog = diagramDialog;
        this.router = router;
        this.answerService = answerService;
        this.justificationService = justificationService;
        this.dialogService = dialogService;
        this.markedAnswers = [];
        this.unmarkedAnswers = [];
        this.unmarkedJust = [];
        //-1 means not initialized, 0 means false, 1 means true
        this.dataSourceJustmarked = new Map();
        this.markedJust = new Map(); // key is answer id
        this.markedJustPage = new Map(); // key is answer id
        this.markedJustOnce = new Map(); // key: answer id   value:  -1 means not initialized, 0 means false, 1 means true
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.id = activatedRoute.snapshot.params["id"];
        this.markedAnswersPage = 0;
        this.markedOnce = -1;
        this.unmarkedAnswersPage = 0;
        this.unmarkedOnce = -1;
        this.unmarkedJustPage = 0;
        this.unmarkedJustOnce = -1;
    }
    TeacherComponent.prototype.ngOnInit = function () {
        this.getMarkedAnswers();
        this.getUnmarkedAnswers();
        this.getUnmarkedJustifications();
    };
    TeacherComponent.prototype.getMarkedAnswers = function () {
        var _this = this;
        var once = this.markedOnce;
        if (once == -1 || once == 0) {
            var page = this.markedAnswersPage++;
            this.answerService.getMarkedAnswers(this.id, page).subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.markedOnce = 1;
                    _this.dialogService.openAlert({
                        message: "No hay más respuestas corregidas",
                        title: "No hay más respuestas",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.markedOnce = 0;
                    }
                    _this.markedAnswers = _this.markedAnswers.concat(data.content);
                    _this.dataSourceMarked = new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](_this.markedAnswers);
                    data.content.forEach(function (answer) {
                        if (!answer.correct) {
                            var id = answer.id;
                            if (!_this.markedJustOnce.has(id)) {
                                _this.markedJustOnce.set(id, -1);
                                _this.markedJustPage.set(id, -1); //starts in -1 bc its increased after
                            }
                            _this.getMarkedJustificationsByAnswer(id);
                        }
                    });
                }
            }, function (error) { return console.log(error + "markedanswers"); });
        }
    };
    TeacherComponent.prototype.getUnmarkedAnswers = function () {
        var _this = this;
        var once = this.unmarkedOnce;
        if (once == -1 || once == 0) {
            var page = this.unmarkedAnswersPage++;
            this.answerService.getUnmarkedAnswers(this.id, page).subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.unmarkedOnce = 1;
                    _this.dialogService.openAlert({
                        message: "No hay más respuestas por corregir",
                        title: "No hay más respuestas",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.unmarkedOnce = 0;
                    }
                    _this.unmarkedAnswers = _this.unmarkedAnswers.concat(data.content);
                    _this.dataSourceUnmarked = new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](_this.unmarkedAnswers);
                }
            }, function (error) { return console.log(error + "unmarkedanswers"); });
        }
    };
    TeacherComponent.prototype.getUnmarkedJustifications = function () {
        var _this = this;
        var once = this.unmarkedJustOnce;
        if (once == -1 || once == 0) {
            var page = this.unmarkedJustPage++;
            this.justificationService
                .getUnmarkedJustifications(this.id, page)
                .subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.unmarkedJustOnce = 1;
                    _this.dialogService.openAlert({
                        message: "No hay más justificaciones por corregir",
                        title: "No hay más justificaciones",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.unmarkedJustOnce = 0;
                    }
                    _this.unmarkedJust = _this.unmarkedJust.concat(data.content);
                    _this.dataSourceJustUnmarked = new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](_this.unmarkedJust);
                }
            }, function (error) { return console.log(error + "unmarkedjustifications"); });
        }
    };
    TeacherComponent.prototype.getMarkedJustificationsByAnswer = function (answerId) {
        var _this = this;
        var once = this.markedJustOnce.get(answerId);
        if (once == -1 || once == 0) {
            var page_1 = this.markedJustPage.get(answerId) + 1;
            this.justificationService
                .getMarkedJustificationsByAnswer(this.id, answerId, page_1)
                .subscribe(function (data) {
                if (data.numberOfElements === 0 && once == 0) {
                    _this.markedJustOnce.set(answerId, 1);
                    _this.dialogService.openAlert({
                        message: "No hay más justificaciones en esta respuesta",
                        title: "No hay más justificaciones",
                        closeButton: "Cerrar"
                    });
                }
                else if (data.numberOfElements > 0) {
                    if (once == -1) {
                        _this.markedJustOnce.set(answerId, 0);
                        _this.markedJust.set(answerId, []);
                    }
                    _this.markedJustPage.set(answerId, page_1);
                    var just = _this.markedJust.get(answerId).concat(data.content);
                    _this.markedJust.set(answerId, just);
                    _this.dataSourceJustmarked.set(answerId, new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](just));
                }
            }, function (error) {
                return console.log(error + "markedjustifications in answer " + answerId);
            });
        }
    };
    TeacherComponent.prototype.deleteAnswer = function (answerId) {
        var _this = this;
        this.dialogService
            .openConfirm({
            message: "¿Quieres eliminar esta respuesta?",
            title: "Confirmar",
            acceptButton: "Aceptar",
            cancelButton: "Cancelar",
            width: "500px",
            height: "175px"
        })
            .afterClosed()
            .subscribe(function (accept) {
            if (accept) {
                _this.answerService.removeAnswer(answerId, _this.id).subscribe(function (_) {
                    var answer = _this.markedAnswers.find(function (a) { return a.id == answerId; });
                    var index = _this.markedAnswers.indexOf(answer, 0);
                    if (index >= 0) {
                        _this.markedAnswers.splice(index, 1);
                        _this.dataSourceMarked = new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](_this.markedAnswers);
                    }
                }, function (error) { return console.error(error + "markedanswers on ans delete"); });
            }
        });
    };
    TeacherComponent.prototype.deleteJustification = function (justId, answerId) {
        var _this = this;
        this.dialogService
            .openConfirm({
            message: "¿Quieres eliminar esta justificacion?",
            title: "Confirmar",
            acceptButton: "Aceptar",
            cancelButton: "Cancelar",
            width: "500px",
            height: "175px"
        })
            .afterClosed()
            .subscribe(function (accept) {
            if (accept) {
                _this.justificationService
                    .removeJustification(justId, answerId)
                    .subscribe(function (_) {
                    var justOfAnswer = _this.markedJust.get(answerId); //get array of just from map
                    var just = justOfAnswer.find(function (j) { return j.id == justId; }); //get just from array
                    var index = justOfAnswer.indexOf(just, 0); //get just index
                    justOfAnswer.splice(index, 1); //delete just from array
                    _this.markedJust.set(answerId, justOfAnswer); //set updated array in map
                    _this.dataSourceJustmarked.set(answerId, new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](justOfAnswer));
                }, function (error) {
                    if (error === 400) {
                        _this.dialogService.openAlert({
                            message: "No se puede eliminar una justificación de una respuesta incorrecta si no hay mas justificaciones",
                            title: "Error al borrar",
                            closeButton: "Cerrar"
                        });
                    }
                    else {
                        console.error(error + "markedanswers on just delete");
                    }
                });
            }
        });
    };
    TeacherComponent.prototype.showDiagram = function () {
        this.diagramDialog.open(_diagram_diagram_component__WEBPACK_IMPORTED_MODULE_5__["DiagramComponent"], {
            height: "600px",
            width: "800px"
        });
    };
    TeacherComponent.prototype.openDialogAnswer = function () {
        var _this = this;
        var dialogRef = this.answerDialog.open(_newanswer_component__WEBPACK_IMPORTED_MODULE_6__["NewAnswerComponent"], {
            data: {
                id: this.id
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
            _this.markedAnswers.push(result);
            _this.markedJust.set(result.id, result.justifications);
            _this.dataSourceMarked = new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](_this.markedAnswers);
            _this.dataSourceJustmarked.set(result.id, new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](result.justifications));
        });
    };
    TeacherComponent.prototype.addJustification = function (answerId) {
        var _this = this;
        var dialogRef = this.answerDialog.open(_newjust_component__WEBPACK_IMPORTED_MODULE_9__["NewJustComponent"], {
            data: {
                id: answerId
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
            if (result) {
                var justOfAnswer = _this.markedJust.get(answerId).concat(result);
                _this.markedJust.set(answerId, justOfAnswer);
                _this.dataSourceJustmarked.set(answerId, new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](justOfAnswer));
            }
        });
    };
    TeacherComponent.prototype.editAnswer = function (oldAnswer, answerText, incorrect) {
        this.editAnswerServiceCall(oldAnswer, answerText, incorrect);
    };
    TeacherComponent.prototype.editAnswerServiceCall = function (oldAnswer, answerText, incorrect) {
        var _this = this;
        this.answerService
            .editAnswer(this.id, oldAnswer.id, answerText, !incorrect)
            .subscribe(function (data) {
            console.log(data);
            if (incorrect && oldAnswer.correct) {
                var dialogRef = _this.answerDialog.open(_newjust_component__WEBPACK_IMPORTED_MODULE_9__["NewJustComponent"], {
                    data: {
                        id: oldAnswer.id
                    }
                });
                dialogRef.afterClosed().subscribe(function (result) {
                    if (result) {
                        _this.markedJust.set(oldAnswer.id, [result]);
                        _this.dataSourceJustmarked.set(oldAnswer.id, new _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTableDataSource"](result));
                        oldAnswer.answerText = answerText;
                        oldAnswer.correct = !incorrect;
                    }
                });
            }
            else if (!incorrect && !oldAnswer.correct) {
                _this.markedJust.get(oldAnswer.id).length = 0;
                _this.markedJustOnce.delete(oldAnswer.id);
                _this.markedJustPage.delete(oldAnswer.id);
                oldAnswer.answerText = answerText;
                oldAnswer.correct = !incorrect;
            }
        }, function (error) {
            console.log(error);
        });
    };
    TeacherComponent.prototype.markJust = function (answerId, justId, invalid, valid, errorText) {
        if (!valid && !invalid) {
            this.dialogService.openAlert({
                message: "Es necesario especificar si la justificación es válida o no.",
                closeButton: "Cerrar"
            });
        }
        else {
            if (errorText) {
                this.justificationService
                    .markJustification(answerId, justId, !invalid, errorText)
                    .subscribe(function (data) {
                    //TODO: show this marked justification in marked answers and remove from unmarked justifications (better use a new function)
                    console.log(data);
                }, function (error) { return console.log(error); });
            }
            else {
                if (!invalid) {
                    this.justificationService
                        .markJustification(answerId, justId, !invalid)
                        .subscribe(function (data) {
                        //TODO: show this marked justification in marked answers and remove from unmarked justifications (better use a new function)
                        console.log(data);
                    }, function (error) { return console.log(error); });
                }
                else {
                    this.dialogService.openAlert({
                        message: "Es necesario especificar el error si la justificación no es válida.",
                        closeButton: "Cerrar"
                    });
                }
            }
        }
    };
    TeacherComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "teacher",
            template: __webpack_require__(/*! ./teacher.component.html */ "./src/app/teacher/teacher.component.html"),
            styles: [__webpack_require__(/*! ./teacher.component.css */ "./src/app/teacher/teacher.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_7__["MatDialog"],
            _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatDialog"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
            _answer_service__WEBPACK_IMPORTED_MODULE_3__["AnswerService"],
            _justification_service__WEBPACK_IMPORTED_MODULE_4__["JustificationService"],
            _covalent_core__WEBPACK_IMPORTED_MODULE_8__["TdDialogService"]])
    ], TeacherComponent);
    return TeacherComponent;
}());



/***/ }),

/***/ "./src/app/teacher/teacher.service.ts":
/*!********************************************!*\
  !*** ./src/app/teacher/teacher.service.ts ***!
  \********************************************/
/*! exports provided: TeacherService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TeacherService", function() { return TeacherService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");




/**
 * Service for teacher requests to backend
 */
var TeacherService = /** @class */ (function () {
    function TeacherService(http) {
        this.http = http;
        this.apiUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].baseUrl;
    }
    TeacherService.prototype.getConceptInfo = function (id) {
        return this.http.get(this.apiUrl + "/concepts/" + id, { withCredentials: true });
    };
    TeacherService.prototype.updateConceptInfo = function (id, conceptInfo) {
        var headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
            'Content-Type': 'application/json',
        });
        return this.http.put(this.apiUrl + "/concepts/" + id, conceptInfo, { headers: headers, withCredentials: true });
    };
    TeacherService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
    ], TeacherService);
    return TeacherService;
}());



/***/ }),

/***/ "./src/app/teacher/urlchange.component.css":
/*!*************************************************!*\
  !*** ./src/app/teacher/urlchange.component.css ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#urlForm {\r\n    margin-left:16px;\r\n    width:90%;\r\n}\r\nmat-card-title {\r\n    text-align: center;\r\n    text-transform: uppercase;\r\n    padding-bottom: 2%;\r\n    width: 100%\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdGVhY2hlci91cmxjaGFuZ2UuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLGdCQUFnQjtJQUNoQixTQUFTO0FBQ2I7QUFDQTtJQUNJLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIsa0JBQWtCO0lBQ2xCO0FBQ0oiLCJmaWxlIjoic3JjL2FwcC90ZWFjaGVyL3VybGNoYW5nZS5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiI3VybEZvcm0ge1xyXG4gICAgbWFyZ2luLWxlZnQ6MTZweDtcclxuICAgIHdpZHRoOjkwJTtcclxufVxyXG5tYXQtY2FyZC10aXRsZSB7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xyXG4gICAgcGFkZGluZy1ib3R0b206IDIlO1xyXG4gICAgd2lkdGg6IDEwMCVcclxufSJdfQ== */"

/***/ }),

/***/ "./src/app/teacher/urlchange.component.html":
/*!**************************************************!*\
  !*** ./src/app/teacher/urlchange.component.html ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-card>\r\n  <mat-card-header>\r\n    <mat-card-title>Url</mat-card-title>\r\n  </mat-card-header>\r\n  <form (ngSubmit)=saveUrl()>\r\n    <mat-form-field id=\"urlForm\">\r\n      <input matInput type=\"url\" class=\"form-control\" name=\"url\" [(ngModel)]=\"url\" />\r\n    </mat-form-field>\r\n    <mat-card-actions>\r\n      <button mat-raised-button color=\"primary\" type=\"submit\">\r\n        Guardar\r\n      </button>\r\n    </mat-card-actions>\r\n  </form>\r\n</mat-card>\r\n"

/***/ }),

/***/ "./src/app/teacher/urlchange.component.ts":
/*!************************************************!*\
  !*** ./src/app/teacher/urlchange.component.ts ***!
  \************************************************/
/*! exports provided: UrlChangerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UrlChangerComponent", function() { return UrlChangerComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _teacher_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./teacher.service */ "./src/app/teacher/teacher.service.ts");




/**
 * Url changer for teacher
 */
var UrlChangerComponent = /** @class */ (function () {
    function UrlChangerComponent(router, activatedRoute, teacherService) {
        var _this = this;
        this.router = router;
        this.teacherService = teacherService;
        this.url = "";
        this.id = activatedRoute.snapshot.params["id"];
        this.teacherService
            .getConceptInfo(this.id)
            .subscribe(function (data) { return (_this.url = data["URL"]); }, function (error) { return console.log(error); });
    }
    UrlChangerComponent.prototype.saveUrl = function () {
        var _this = this;
        var conceptInfo = {
            URL: this.url
        };
        this.teacherService
            .updateConceptInfo(this.id, conceptInfo)
            .subscribe(function (data) { return (_this.url = data["URL"]); }, function (error) { return console.log(error); });
    };
    UrlChangerComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: "urlchange",
            template: __webpack_require__(/*! ./urlchange.component.html */ "./src/app/teacher/urlchange.component.html"),
            styles: [__webpack_require__(/*! ./urlchange.component.css */ "./src/app/teacher/urlchange.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
            _teacher_service__WEBPACK_IMPORTED_MODULE_3__["TeacherService"]])
    ], UrlChangerComponent);
    return UrlChangerComponent;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false,
    baseUrl: '/api'
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_4__);





if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /angular/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map