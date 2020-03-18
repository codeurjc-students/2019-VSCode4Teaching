import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../../src/extension';
import { V4TItem, V4TItemType } from '../../src/components/courses/V4TItem';
import { Course, Exercise, User } from '../../src/model/serverModel/ServerModel';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { UserPick } from '../../src/components/courses/CoursesTreeProvider';
import { APIClient } from "../../src/client/APIClient";
import { Validators } from '../../src/model/Validators';
import { CurrentUser } from '../../src/model/CurrentUser';
import JSZip = require('jszip');



export async function run (): Promise<void> {
	let apiClient = APIClient;
	afterEach(() => {
		// simple.restore();
		extension.createNewCoursesProvider();
		apiClient.invalidateSession();
		if (fs.existsSync('v4tdownloads')) {
			rimraf('v4tdownloads', error => {
				// console.error(error);
			});
		}
		if (fs.existsSync('openworkspacetest')) {
			rimraf('openworkspacetest', error => {
				// console.error(error);
			});
		}
		let v4tPath = path.resolve(__dirname, '..', '..', 'src', 'v4t');
		if (fs.existsSync(v4tPath)) {
			rimraf(v4tPath, ((error) => {
				// console.error(error);
			}));
		}

	});

	test('should be present', () => {
		assert.ok(vscode.extensions.getExtension("codeurjc-students.vscode4teaching"));
	});

	test('should register all commands', () => {
		const extensionActivator = vscode.extensions.getExtension("codeurjc-students.vscode4teaching");
		if (extensionActivator) {
			return extensionActivator.activate().then(() => {
				return vscode.commands.getCommands(true).then((commands) => {
					const V4T_COMMANDS = [
						"vscode4teaching.login",
						'vscode4teaching.logout',
						"vscode4teaching.getexercisefiles",
						'vscode4teaching.addcourse',
						"vscode4teaching.editcourse",
						"vscode4teaching.deletecourse",
						"vscode4teaching.refreshcourses",
						"vscode4teaching.refreshexercises",
						"vscode4teaching.addexercise",
						"vscode4teaching.editexercise",
						"vscode4teaching.deleteexercise",
						"vscode4teaching.adduserstocourse",
						"vscode4teaching.removeusersfromcourse",
						"vscode4teaching.getstudentfiles",
						"vscode4teaching.diff",
						'vscode4teaching.createComment',
						'vscode4teaching.share',
						'vscode4teaching.signup',
						'vscode4teaching.signupteacher',
						'vscode4teaching.getwithcode'
					];

					const foundCommands = commands.filter((value) => {
						return V4T_COMMANDS.indexOf(value) >= 0;
					});

					assert.equal(foundCommands.length, V4T_COMMANDS.length, "should register all commands");
				});
			});
		} else {
			assert.fail("Couldn't activate extension.");
		}
	});

	// test('login', async () => {
	// 	let mockVSCodeInputBox = simple.mock(vscode.window, "showInputBox");
	// 	mockVSCodeInputBox.resolveWith("http://test.com").resolveWith("johndoe").resolveWith("password");

	// 	let mockLogin = simple.mock(apiClient, "callLogin");
	// 	mockLogin.resolveWith(null);
	// 	// let mockCsrf = simple.mock(apiClient, "getXSRFToken");
	// 	// mockCsrf.resolveWith(null);
	// 	await extension.coursesProvider.login();
	// 	assert.deepStrictEqual(mockVSCodeInputBox.callCount, 3, "vs code should ask for server, username and password");
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[0].returned, Promise.resolve("http://test.com"), "server input box should return test url");
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[1].returned, Promise.resolve("johndoe"), "username input box should return test username");
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[2].returned, Promise.resolve("password"), "password input box should return test password");
	// 	let serverInputBoxOptions: vscode.InputBoxOptions = { "prompt": "Server", "validateInput": Validators.validateUrl, "value": "http://localhost:8080" };
	// 	serverInputBoxOptions.validateInput = Validators.validateUrl;
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[0].arg, serverInputBoxOptions,
	// 		"config for the server input box should have correct prompt, be validated and default value localhost:8080");
	// 	let usernameInputBoxOptions: vscode.InputBoxOptions = { "prompt": "Username" };
	// 	usernameInputBoxOptions.validateInput = Validators.validateUsername;
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[1].arg, usernameInputBoxOptions,
	// 		"config for the username input box should have correct prompt");
	// 	let passwordInputBoxOptions: vscode.InputBoxOptions = { "prompt": "Password", "password": true };
	// 	passwordInputBoxOptions.validateInput = Validators.validatePasswordLogin;
	// 	assert.deepStrictEqual(mockVSCodeInputBox.calls[2].arg, passwordInputBoxOptions,
	// 		"config for the password input box should have correct prompt and hide the input");
	// 	// assert.deepStrictEqual(mockCsrf.callCount, 1, "csrf should be set");
	// 	assert.deepStrictEqual(mockLogin.callCount, 1, "login should be called 1 time");
	// 	// assert.deepStrictEqual(mockLogin.lastCall.returned, Promise.resolve(loginResponse), "apiClient login mock should resolve with a mock token");
	// 	assert.deepStrictEqual(mockLogin.lastCall.args, ["johndoe", "password", "http://test.com"], "apiClient should login with the credentials above");
	// });

	test('get login button (get children, not logged in)', () => {
		let expectedButtonLogin = new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
			"command": "vscode4teaching.login",
			"title": "Log in to VS Code 4 Teaching"
		});

		let loginButtons = extension.coursesProvider.getChildren();
		if (loginButtons instanceof Array) {
			assert.deepStrictEqual(loginButtons[0], expectedButtonLogin);
		} else {
			assert.fail("loginButton is not an array");
		}
	});

	// test('get courses (get children, logged in)', () => {

	// 	let getJwtTokenMock = simple.mock(apiClient, "getJwtToken");
	// 	getJwtTokenMock.returnWith("mockToken");
	// 	let user: User = {
	// 		id: 20,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		],
	// 		courses: [

	// 		]
	// 	};
	// 	let courses = [
	// 		{
	// 			id: 23,
	// 			name: "Spring Boot Course 1",
	// 			creator: user,
	// 			exercises: []
	// 		},
	// 		{
	// 			id: 52,
	// 			name: "Angular Course 1",
	// 			creator: user,
	// 			exercises: []
	// 		}
	// 	];
	// 	user.courses = courses;
	// 	if (user.courses) {
	// 		let expectedButtons = user.courses.map(course => new V4TItem(course.name, V4TItemType.CourseStudent, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
	// 		expectedButtons.push(new V4TItem('Logout', V4TItemType.Logout, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
	// 			'command': 'vscode4teaching.logout',
	// 			'title': 'Log out of VS Code 4 Teaching'
	// 		}));
	// 		expectedButtons.unshift(new V4TItem('Get with code', V4TItemType.GetWithCode, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
	// 			'command': 'vscode4teaching.getwithcode',
	// 			'title': 'Get course with sharing code'
	// 		}));
	// 		CurrentUser.userinfo = user;
	// 		apiClient.jwtToken = "mockToken";

	// 		let courseButtons = extension.coursesProvider.getChildren();

	// 		if (courseButtons instanceof Array) {
	// 			assert.deepStrictEqual(courseButtons, expectedButtons);
	// 		} else {
	// 			assert.fail("courseButtons is not an array");
	// 		}
	// 	} else {
	// 		assert.fail("user courses don't exist");
	// 	}
	// });

	// test('get courses with add button (get children, logged in, is teacher)', () => {

	// 	let getJwtTokenMock = simple.mock(apiClient, "getJwtToken");
	// 	getJwtTokenMock.returnWith("mockToken");
	// 	let user: User = {
	// 		id: 20,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: [

	// 		]
	// 	};
	// 	let courses = [
	// 		{
	// 			id: 23,
	// 			name: "Spring Boot Course 1",
	// 			creator: user,
	// 			exercises: []
	// 		},
	// 		{
	// 			id: 52,
	// 			name: "Angular Course 1",
	// 			creator: user,
	// 			exercises: []
	// 		}
	// 	];
	// 	user.courses = courses;
	// 	if (user.courses) {
	// 		let expectedButtons = user.courses.map(course => new V4TItem(course.name, V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
	// 		expectedButtons.unshift(new V4TItem("Add Course", V4TItemType.AddCourse, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
	// 			command: "vscode4teaching.addcourse",
	// 			title: "Add Course"
	// 		}));
	// 		expectedButtons.push(new V4TItem('Sign up a teacher', V4TItemType.SignupTeacher, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
	// 			'command': 'vscode4teaching.signupteacher',
	// 			'title': 'Sign up in VS Code 4 Teaching'
	// 		}));
	// 		expectedButtons.push(new V4TItem('Logout', V4TItemType.Logout, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
	// 			'command': 'vscode4teaching.logout',
	// 			'title': 'Log out of VS Code 4 Teaching'
	// 		}));
	// 		CurrentUser.userinfo = user;
	// 		apiClient.jwtToken = "mockToken";

	// 		let courseButtons = extension.coursesProvider.getChildren();

	// 		if (courseButtons instanceof Array) {
	// 			assert.deepStrictEqual(courseButtons, expectedButtons);
	// 		} else {
	// 			assert.fail("courseButtons is not an array");
	// 		}
	// 	} else {
	// 		assert.fail("user courses don't exist");
	// 	}
	// });

	// test('get exercises (get children, element)', async () => {
	// 	let user: User = {
	// 		id: 343,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	};
	// 	let course: Course = {
	// 		id: 123,
	// 		name: "Spring Boot Course",
	// 		creator: user,
	// 		exercises: []
	// 	};
	// 	user.courses = [course];
	// 	let courseItem = new V4TItem(course.name, V4TItemType.CourseStudent, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);

	// 	CurrentUser.userinfo = user;
	// 	let exercises: Exercise[] = [{
	// 		id: 4,
	// 		name: "Exercise 1"
	// 	},
	// 	{
	// 		id: 5,
	// 		name: "Exercise 2"
	// 	},
	// 	{
	// 		id: 6,
	// 		name: "Exercise 3"
	// 	}];
	// 	let exerciseItems = exercises.map(exercise => new V4TItem(exercise.name, V4TItemType.ExerciseStudent, vscode.TreeItemCollapsibleState.None, courseItem, exercise, {
	// 		"command": "vscode4teaching.getexercisefiles",
	// 		"title": "Get exercise files",
	// 		"arguments": [course.name, exercise]
	// 	}));
	// 	let getExercisesMock = simple.mock(apiClient, "getExercises");
	// 	getExercisesMock.resolveWith({ data: exercises });

	// 	extension.coursesProvider.getChildren(courseItem);

	// 	await new Promise(resolve => setTimeout(resolve, 10)); // Wait for exercises to "download"

	// 	let newExerciseItems = extension.coursesProvider.getChildren(courseItem);
	// 	assert.deepStrictEqual(exerciseItems, newExerciseItems);

	// });

	// test('get exercises (get children, element, is teacher)', async () => {
	// 	let user: User = {
	// 		id: 343,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	};
	// 	let course: Course = {
	// 		id: 123,
	// 		name: "Spring Boot Course",
	// 		creator: user,
	// 		exercises: []
	// 	};
	// 	user.courses = [course];
	// 	let courseItem = new V4TItem(course.name, V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);

	// 	CurrentUser.userinfo = user;
	// 	let exercises: Exercise[] = [{
	// 		id: 4,
	// 		name: "Exercise 1"
	// 	},
	// 	{
	// 		id: 5,
	// 		name: "Exercise 2"
	// 	},
	// 	{
	// 		id: 6,
	// 		name: "Exercise 3"
	// 	}];
	// 	let exerciseItems = exercises.map(exercise => new V4TItem(exercise.name, V4TItemType.ExerciseTeacher, vscode.TreeItemCollapsibleState.None, courseItem, exercise, {
	// 		"command": "vscode4teaching.getstudentfiles",
	// 		"title": "Get exercise files",
	// 		"arguments": [course.name, exercise]
	// 	}));
	// 	let getExercisesMock = simple.mock(apiClient, "getExercises");
	// 	getExercisesMock.resolveWith({ data: exercises });

	// 	extension.coursesProvider.getChildren(courseItem);

	// 	await new Promise(resolve => setTimeout(resolve, 10)); // Wait for exercises to "download"

	// 	let newExerciseItems = extension.coursesProvider.getChildren(courseItem);
	// 	assert.deepStrictEqual(exerciseItems, newExerciseItems);
	// });

	// test('get exercise files', async () => {
	// 	let user: User = {
	// 		id: 343,
	// 		username: "johndoe",
	// 		roles: []
	// 	};

	// 	let getExercisesMock = simple.mock(apiClient, "getExerciseFiles");
	// 	let filePath = path.resolve(__dirname, "..", "..", "..", 'test-resources', 'files', 'exs.zip');
	// 	getExercisesMock.resolveWith({
	// 		data: fs.readFileSync(filePath)
	// 	});
	// 	CurrentUser.userinfo = user;
	// 	let newWorkspaceURI = await extension.coursesProvider.getExerciseFiles("Spring Boot Course", { id: 4, name: "Exercise 1" });
	// 	await new Promise(resolve => setTimeout(resolve, 200)); // Wait for exercises to "download"
	// 	let ex1Path = path.resolve('v4tdownloads', 'johndoe', 'Spring Boot Course', 'Exercise 1');
	// 	assert.deepStrictEqual(fs.existsSync(path.resolve(ex1Path, 'ex1.html')), true, "ex1 exists");
	// 	assert.deepStrictEqual(fs.existsSync(path.resolve(ex1Path, 'ex2.html')), true, "ex2 exists");
	// 	assert.deepStrictEqual(fs.existsSync(path.resolve(ex1Path, 'exs', 'ex3.html')), true, "ex3 exists");
	// 	assert.deepStrictEqual(fs.existsSync(path.resolve(ex1Path, 'exs', 'ex4', 'ex4.html')), true, "ex4 exists");
	// 	assert.deepStrictEqual(fs.existsSync(path.resolve(ex1Path, 'v4texercise.v4t')), true, 'exercise file should exist');
	// 	assert.deepStrictEqual(newWorkspaceURI, ex1Path, "uri is correct");
	// });

	// test('if session file exists', () => {

	// 	apiClient.jwtToken = undefined;
	// 	let existsMock = simple.mock(fs, "existsSync");
	// 	existsMock.returnWith(true);
	// 	let fileMock = simple.mock(fs, "readFileSync");
	// 	fileMock.returnWith(new MockFile("mockToken\nmockXsrf\nmockUrl"));
	// 	let userInfoMock = simple.mock(apiClient, "getServerUserInfo");
	// 	userInfoMock.resolveWith({
	// 		id: 1,
	// 		name: "johndoe"
	// 	});
	// 	extension.coursesProvider.getChildren();

	// 	assert.deepStrictEqual(apiClient.jwtToken, "mockToken");
	// 	assert.deepStrictEqual(apiClient.xsrfToken, "mockXsrf");
	// 	assert.deepStrictEqual(apiClient.baseUrl, "mockUrl");
	// });

	// test('refresh should call getServerUserInfo', () => {

	// 	CurrentUser.userinfo = {
	// 		id: 1,
	// 		username: "mockUser",
	// 		roles: []
	// 	};
	// 	let userInfoMock = simple.mock(apiClient, "getServerUserInfo");
	// 	extension.coursesProvider.refreshCourses();
	// 	assert.deepStrictEqual(userInfoMock.callCount, 1);
	// });

	// test('add course', async () => {
	// 	let vscodeInputMock = simple.mock(vscode.window, "showInputBox");
	// 	vscodeInputMock.resolveWith("Test course");
	// 	let user: User = {
	// 		id: 456,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: []
	// 	};
	// 	let course: Course = {
	// 		id: 123,
	// 		name: "Test course",
	// 		creator: user,
	// 		exercises: []
	// 	};
	// 	user.courses = [course];

	// 	let addCourseClientMock = simple.mock(apiClient, "addCourse");
	// 	addCourseClientMock.resolveWith(course);
	// 	let userInfoMock = simple.mock(apiClient, "getServerUserInfo");
	// 	userInfoMock.resolveWith(user);
	// 	await extension.coursesProvider.addCourse();
	// 	if (CurrentUser.userinfo && CurrentUser.userinfo.courses) {
	// 		assert.deepStrictEqual(CurrentUser.userinfo.courses, [course]);
	// 	}
	// });

	// test('delete course', async () => {

	// 	let vscodeInputMock = simple.mock(vscode.window, "showWarningMessage");
	// 	vscodeInputMock.resolveWith("Accept");
	// 	let user: User = {
	// 		id: 456,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: []
	// 	};
	// 	let course: Course = {
	// 		id: 123,
	// 		name: "Test course",
	// 		creator: user,
	// 		exercises: []
	// 	};

	// 	let deleteCourseClientMock = simple.mock(apiClient, "deleteCourse");
	// 	deleteCourseClientMock.resolveWith(course);
	// 	user.courses = [course];
	// 	CurrentUser.userinfo = user;
	// 	let newUser: User = {
	// 		id: 456,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: []
	// 	};
	// 	let userInfoMock = simple.mock(apiClient, "getServerUserInfo");
	// 	userInfoMock.resolveWith({ data: newUser });
	// 	let item = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);
	// 	await extension.coursesProvider.deleteCourse(item);
	// 	if (CurrentUser.userinfo && CurrentUser.userinfo.courses) {
	// 		assert.deepStrictEqual(CurrentUser.userinfo.courses, []);
	// 	}
	// });

	// test('edit course', async () => {
	// 	let user: User = {
	// 		id: 456,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: []
	// 	};
	// 	let newUser: User = {
	// 		id: 456,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		],
	// 		courses: []
	// 	};
	// 	let course: Course = {
	// 		id: 123,
	// 		name: "Test course",
	// 		creator: user,
	// 		exercises: [
	// 			{
	// 				id: 111,
	// 				name: "Exercise 1"
	// 			}
	// 		]
	// 	};
	// 	let newCourse: Course = {
	// 		id: 123,
	// 		name: "Test course edited",
	// 		creator: newUser,
	// 		exercises: [
	// 			{
	// 				id: 111,
	// 				name: "Exercise 1"
	// 			}
	// 		]
	// 	};
	// 	user.courses = [course];
	// 	newUser.courses = [newCourse];

	// 	let editCourseClientMock = simple.mock(apiClient, "editCourse");
	// 	editCourseClientMock.resolveWith(newCourse);
	// 	let vscodeInputMock = simple.mock(vscode.window, "showInputBox");
	// 	vscodeInputMock.resolveWith("Test course");
	// 	let userInfoMock = simple.mock(apiClient, "getServerUserInfo");
	// 	userInfoMock.resolveWith({ data: newUser });
	// 	CurrentUser.userinfo = user;
	// 	let item = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);
	// 	await extension.coursesProvider.editCourse(item);
	// 	if (CurrentUser.userinfo && CurrentUser.userinfo.courses) {
	// 		assert.deepStrictEqual(CurrentUser.userinfo.courses, [newCourse]);
	// 	}
	// });

	// test('refresh exercises', async () => {
	// 	let creator: User = {
	// 		id: 3,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	};
	// 	let course: Course = {
	// 		id: 1234,
	// 		name: "Test course",
	// 		creator: creator,
	// 		exercises: [
	// 			{
	// 				id: 5678,
	// 				name: "Test exercise"
	// 			}
	// 		]
	// 	};
	// 	let courseItem = new V4TItem(course.name, V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);
	// 	// This method has already been tested, can be mocked
	// 	let getExercisesMock = simple.mock(extension.coursesProvider, "getExercises");
	// 	extension.coursesProvider.refreshExercises(courseItem);
	// 	assert.deepStrictEqual(getExercisesMock.callCount, 1);
	// });

	// test('add exercise', async () => {
	// 	let nameMock = simple.mock(vscode.window, "showInputBox");
	// 	nameMock.resolveWith("Test exercise");
	// 	let openDialogMock = simple.mock(vscode.window, 'showOpenDialog');
	// 	let filesPath = path.resolve(__dirname, "..", "..", "..", 'test-resources', 'files');
	// 	let ex1Path = path.resolve(filesPath, 'ex1.html');
	// 	let ex2Path = path.resolve(filesPath, 'ex2.html');
	// 	let exsPath = path.resolve(filesPath, 'exs');
	// 	openDialogMock.resolveWith([
	// 		vscode.Uri.file(ex1Path),
	// 		vscode.Uri.file(ex2Path),
	// 		vscode.Uri.file(exsPath)
	// 	]);
	// 	let creator: User = {
	// 		id: 3,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	};
	// 	let mockCourse: Course = {
	// 		id: 345,
	// 		name: "Test course",
	// 		creator: creator,
	// 		exercises: []
	// 	};

	// 	let apiClientAddMock = simple.mock(apiClient, "addExercise");
	// 	let exerciseDataMock: Exercise = {
	// 		id: 123,
	// 		name: "Test exercise"
	// 	};
	// 	apiClientAddMock.resolveWith({ data: exerciseDataMock });
	// 	let apiClientTemplateMock = simple.mock(apiClient, "uploadExerciseTemplate");
	// 	apiClientTemplateMock.resolveWith(null);
	// 	let refreshExercisesMock = simple.mock(extension.coursesProvider, "refreshExercises");
	// 	let mockItem = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Expanded, undefined, mockCourse);
	// 	await extension.coursesProvider.addExercise(mockItem);

	// 	assert.deepStrictEqual(apiClientAddMock.lastCall.args[0], 345, "addExercise should get correct course id");
	// 	assert.deepStrictEqual(apiClientAddMock.lastCall.args[1], { name: "Test exercise" }, "addExercise should get name gotten on showInputBox");

	// 	assert.deepStrictEqual(apiClientTemplateMock.lastCall.args[0], 123, "uploadExerciseTemplate should get correct exercise id");

	// 	//Assertions on template data sent
	// 	let zipContent: Buffer = apiClientTemplateMock.lastCall.args[1];
	// 	let zip = new JSZip();
	// 	let zipEntries: string[] = [];
	// 	zip = await zip.loadAsync(zipContent);
	// 	zip.forEach((relativePath, file) => {
	// 		zipEntries.push(relativePath);
	// 	});

	// 	// console.log(zipEntries);
	// 	// Depending on system directories can be saved as entries or whole path can be saved
	// 	assert.deepStrictEqual(zipEntries.includes("ex1.html"), true, "ex1.html should be saved");
	// 	assert.deepStrictEqual(zipEntries.includes("ex2.html"), true, "ex2.html should be saved");
	// 	assert.deepStrictEqual(zipEntries.includes("exs" + path.sep + "ex3.html"), true, "exs/ex3.html should be saved");
	// 	assert.deepStrictEqual(zipEntries.includes("exs" + path.sep + "ex4" + path.sep + "ex4.html"), true, "exs/ex4/ex4.html should be saved");
	// 	assert.deepStrictEqual(!zipEntries.includes("exs" + path.sep + "ignoredex.html"), true, "ignoredex.html should be ignored");
	// 	assert.deepStrictEqual(!zipEntries.includes("exs" + path.sep + "ignoredexs" + path.sep + "exignored.html"), true, "exs/ignoredexs/exignored.html should be ignored");
	// 	assert.deepStrictEqual(zipEntries.includes("exs" + path.sep + "ignoredexs" + path.sep + "notignoredex.html"), true, "exs/ignoredexs/notignoredex.html should be saved");
	// 	assert.deepStrictEqual(zipEntries.includes("exs" + path.sep + "ignoredexs" + path.sep + "notignoredexs" + path.sep + "exnotignored.html"), true, "exs/ignoredexs/notignoredexs/exnotignored.html should be saved");

	// 	assert.deepStrictEqual(refreshExercisesMock.callCount, 1, "exercises should be refreshed");
	// });

	// test('edit exercise', async () => {
	// 	let creator: User = {
	// 		id: 3,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	};
	// 	let exercise: Exercise = {
	// 		id: 1,
	// 		name: "Test exercise"
	// 	};
	// 	let course: Course = {
	// 		id: 2,
	// 		name: "Test course",
	// 		creator: creator,
	// 		exercises: [exercise]
	// 	};
	// 	let courseItem = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Expanded, undefined, course, undefined);
	// 	let exerciseItem = new V4TItem("Test exercise", V4TItemType.ExerciseTeacher, vscode.TreeItemCollapsibleState.None, courseItem, exercise, undefined);
	// 	let inputMock = simple.mock(vscode.window, "showInputBox");
	// 	inputMock.resolveWith("Edited exercise");

	// 	let apiClientMock = simple.mock(apiClient, "editExercise");
	// 	apiClientMock.resolveWith(null); // Not needed
	// 	await extension.coursesProvider.editExercise(exerciseItem);

	// 	assert.deepStrictEqual(apiClientMock.callCount, 1, "editExercise is called");
	// 	assert.deepStrictEqual(apiClientMock.lastCall.args[0], 1, "exercise id is passed");
	// 	assert.deepStrictEqual(apiClientMock.lastCall.args[1], { name: "Edited exercise" }, "new exercise name is passed");
	// });

	// test('delete exercise', async () => {
	// 	let creator: User = {
	// 		id: 3,
	// 		username: "johndoe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	};
	// 	let exercise: Exercise = {
	// 		id: 1,
	// 		name: "Test exercise"
	// 	};
	// 	let course: Course = {
	// 		id: 2,
	// 		name: "Test course",
	// 		creator: creator,
	// 		exercises: [exercise]
	// 	};
	// 	let courseItem = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Expanded, undefined, course);
	// 	let exerciseItem = new V4TItem("Test exercise", V4TItemType.ExerciseTeacher, vscode.TreeItemCollapsibleState.None, courseItem, exercise);

	// 	let apiClientMock = simple.mock(apiClient, "deleteExercise");
	// 	apiClientMock.resolveWith(null);
	// 	let modalMock = simple.mock(vscode.window, "showWarningMessage");
	// 	modalMock.resolveWith('Accept');

	// 	await extension.coursesProvider.deleteExercise(exerciseItem);

	// 	assert.deepStrictEqual(apiClientMock.callCount, 1);
	// 	assert.deepStrictEqual(apiClientMock.lastCall.args[0], 1);
	// });

	// test('add users to course', async () => {
	// 	let selectableUsers: User[] = [{
	// 		id: 1,
	// 		username: "johndoe",
	// 		name: "John",
	// 		lastName: "Doe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	},
	// 	{
	// 		id: 2,
	// 		username: "johndoe2",
	// 		name: "John",
	// 		lastName: "Doe 2",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	},
	// 	{
	// 		id: 3,
	// 		username: "johndoe3",
	// 		name: "John",
	// 		lastName: "Doe 3",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	}];
	// 	let userInCourse: User = {
	// 		id: 4,
	// 		username: "johndoe4",
	// 		name: "John",
	// 		lastName: "Doe 4",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	};
	// 	let allUsers = selectableUsers.slice();
	// 	allUsers.push(userInCourse);
	// 	let course = {
	// 		id: 10,
	// 		name: "Test course",
	// 		exercises: []
	// 	};
	// 	let item = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);

	// 	let getUsersMock = simple.mock(apiClient, "getAllUsers");
	// 	getUsersMock.resolveWith({ data: allUsers });
	// 	let getCourseUsersMock = simple.mock(apiClient, "getUsersInCourse");
	// 	getCourseUsersMock.resolveWith({ data: [userInCourse] });
	// 	let quickpickMock = simple.mock(vscode.window, "showQuickPick");
	// 	let selectableUsersPicks: UserPick[] = [];
	// 	selectableUsers.forEach(user => selectableUsersPicks.push(new UserPick(user.name && user.lastName ? user.name + " " + user.lastName : user.username, user)));
	// 	let selectedUsers = [new UserPick("John Doe", selectableUsers[0]), new UserPick("John Doe 3", selectableUsers[2])];
	// 	quickpickMock.resolveWith(selectedUsers);
	// 	let addUsersMock = simple.mock(apiClient, "addUsersToCourse");

	// 	await extension.coursesProvider.addUsersToCourse(item);

	// 	assert.deepStrictEqual(getUsersMock.callCount, 1, "getAllUsers should be called");
	// 	assert.deepStrictEqual(quickpickMock.callCount, 1, "showQuickPick should be called");
	// 	assert.deepStrictEqual(quickpickMock.lastCall.args[0], selectableUsersPicks, "showQuickPick should show selectable users");
	// 	assert.deepStrictEqual(addUsersMock.callCount, 1, "addUsersToCourse should be called");
	// 	assert.deepStrictEqual(addUsersMock.lastCall.args[0], 10, "addUsersToCourse should be called");
	// 	assert.deepStrictEqual(addUsersMock.lastCall.args[1], { ids: [1, 3] });
	// });

	// test('remove users from course', async () => {
	// 	let selectableUsers: User[] = [{
	// 		id: 1,
	// 		username: "johndoe",
	// 		name: "John",
	// 		lastName: "Doe",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	},
	// 	{
	// 		id: 2,
	// 		username: "johndoe2",
	// 		name: "John",
	// 		lastName: "Doe 2",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	},
	// 	{
	// 		id: 3,
	// 		username: "johndoe3",
	// 		name: "John",
	// 		lastName: "Doe 3",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			}
	// 		]
	// 	},
	// 	{
	// 		id: 4,
	// 		username: "johndoeteacher",
	// 		name: "John",
	// 		lastName: "Doe Teacher",
	// 		roles: [
	// 			{
	// 				roleName: "ROLE_STUDENT"
	// 			},
	// 			{
	// 				roleName: "ROLE_TEACHER"
	// 			}
	// 		]
	// 	}];
	// 	let course: Course = {
	// 		id: 10,
	// 		name: "Test course",
	// 		creator: selectableUsers[3],
	// 		exercises: []
	// 	};
	// 	let item = new V4TItem("Test course", V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course);

	// 	let getCourseUsersMock = simple.mock(apiClient, "getUsersInCourse");
	// 	getCourseUsersMock.resolveWith({ data: selectableUsers });
	// 	let getCreatorMock = simple.mock(apiClient, "getCreator");
	// 	getCreatorMock.resolveWith({
	// 		data: {
	// 			id: 4,
	// 			username: "johndoeteacher",
	// 			name: "John",
	// 			lastName: "Doe Teacher",
	// 			roles: [
	// 				{
	// 					roleName: "ROLE_STUDENT"
	// 				},
	// 				{
	// 					roleName: "ROLE_TEACHER"
	// 				}
	// 			]
	// 		}
	// 	});
	// 	let quickpickMock = simple.mock(vscode.window, "showQuickPick");
	// 	let selectableUsersPicks: UserPick[] = [];
	// 	selectableUsers.forEach(user => {
	// 		if (user !== course.creator) {
	// 			selectableUsersPicks.push(new UserPick(user.name && user.lastName ? user.name + " " + user.lastName : user.username, user));
	// 		}
	// 	});
	// 	let selectedUsers = [new UserPick("John Doe", selectableUsers[0]), new UserPick("John Doe 3", selectableUsers[2])];
	// 	quickpickMock.resolveWith(selectedUsers);

	// 	let addUsersMock = simple.mock(apiClient, "removeUsersFromCourse");

	// 	await extension.coursesProvider.removeUsersFromCourse(item);

	// 	assert.deepStrictEqual(quickpickMock.callCount, 1, "showQuickPick should be called");
	// 	assert.deepStrictEqual(quickpickMock.lastCall.args[0], selectableUsersPicks, "showQuickPick should show selectable users");
	// 	assert.deepStrictEqual(addUsersMock.callCount, 1, "removeUsersFromCourse should be called");
	// 	assert.deepStrictEqual(addUsersMock.lastCall.args[0], 10, "removeUsersFromCourse should be called");
	// 	assert.deepStrictEqual(addUsersMock.lastCall.args[1], { ids: [1, 3] });
	// });
}
