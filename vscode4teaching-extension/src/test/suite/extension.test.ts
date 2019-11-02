import * as assert from 'assert';
import { afterEach, suite, test } from 'mocha';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as simple from 'simple-mock';
import { V4TItem, V4TItemType } from '../../courses';
import { Course, Exercise, User } from '../../model';
import { RestClient } from '../../restclient';
import * as fs from 'fs';
import * as path from 'path';
import rimraf = require('rimraf');

suite('Extension Test Suite', () => {

	afterEach(() => {
		simple.restore();
		extension.coursesProvider.client = new RestClient();
		extension.coursesProvider.userinfo = undefined;
		if (fs.existsSync('v4tdownloads')) {
			rimraf('v4tdownloads', error => {
				// console.log(error);
			});
		}
		if (fs.existsSync('openworkspacetest')) {
			rimraf('openworkspacetest', error => {
				// console.log(error);
			});
		}
	});

	test('should be present', () => {
		assert.ok(vscode.extensions.getExtension("codeurjc-students.vscode4teaching"));
	});

	test('should activate properly', () => {
		const extensionActivator = vscode.extensions.getExtension("codeurjc-students.vscode4teaching");
		if (extensionActivator && !extensionActivator.isActive) {
			extensionActivator.activate().then(() => {
				assert.ok(extension.coursesProvider);
			});
		}
	});

	test('login', async () => {
		let mockVSCodeInputBox = simple.mock(vscode.window, "showInputBox");
		mockVSCodeInputBox.resolveWith("http://test.com").resolveWith("johndoe").resolveWith("password");
		let mockLogin = simple.mock(extension.coursesProvider.client, "login");
		let loginResponse = {
			data: { "jwtToken": "mockToken" }
		};
		mockLogin.resolveWith(loginResponse);
		let mockCsrf = simple.mock(extension.coursesProvider.client, "getCsrfToken");
		mockCsrf.resolveWith(null);
		await extension.coursesProvider.login();
		assert.deepStrictEqual(mockVSCodeInputBox.callCount, 3, "vs code should ask for server, username and password");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[0].returned, Promise.resolve("http://test.com"), "server input box should return test url");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[1].returned, Promise.resolve("johndoe"), "username input box should return test username");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[2].returned, Promise.resolve("password"), "password input box should return test password");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[0].arg, { "prompt": "Server", "validateInput": extension.coursesProvider.validateInputCustomUrl, "value": "http://localhost:8080" },
			"config for the server input box should have correct prompt, be validated and default value localhost:8080");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[1].arg, { "prompt": "Username" },
			"config for the username input box should have correct prompt");
		assert.deepStrictEqual(mockVSCodeInputBox.calls[2].arg, { "prompt": "Password", "password": true },
			"config for the password input box should have correct prompt and hide the input");
		assert.deepStrictEqual(mockCsrf.callCount, 1, "csrf should be set");
		assert.deepStrictEqual(mockLogin.callCount, 1, "login should be called 1 time");
		assert.deepStrictEqual(mockLogin.lastCall.returned, Promise.resolve(loginResponse), "client login mock should resolve with a mock token");
		assert.deepStrictEqual(mockLogin.lastCall.args, ["johndoe", "password"], "client should login with the credentials above");
	});

	test('validate URL', () => {
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://localhost:8080"), null, "http://localhost:8080");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://localhost:3000"), null, "http://localhost:3000");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://192.168.99.100:8080"), null, "http://192.168.99.100:8080");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://1.2.4.3"), null, "http://1.2.4.3");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://test.com:4567"), null, "http://test.com:4567");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://api.test.com"), null, "http://api.test.com");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://test.com/api"), null, "http://test.com/api");
		assert.deepStrictEqual(extension.coursesProvider.validateInputCustomUrl("http://test.com/api:8080"), null, "http://test.com/api:8080");
	});

	test('get login button (get children, not logged in)', () => {
		let expectedButton = new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, {
			"command": "vscode4teaching.login",
			"title": "Log in to VS Code 4 Teaching"
		});


		let loginButton = extension.coursesProvider.getChildren();
		if (loginButton instanceof Array) {
			assert.deepStrictEqual(loginButton[0], expectedButton);
		} else {
			assert.fail("loginButton is not an array");
		}
	});

	test('get courses (get children, logged in)', () => {
		let getJwtTokenMock = simple.mock(extension.coursesProvider.client, "getJwtToken");
		getJwtTokenMock.returnWith("mockToken");
		let user = {
			id: 20,
			username: "johndoe",
			courses: [
				{
					id: 23,
					name: "Spring Boot Course 1"
				},
				{
					id: 52,
					name: "Angular Course 1"
				}
			]
		};
		let expectedButtons = user.courses.map(course => new V4TItem(course.name, V4TItemType.Course, vscode.TreeItemCollapsibleState.Collapsed));
		extension.coursesProvider.userinfo = user;
		extension.coursesProvider.client.jwtToken = "mockToken";

		let courseButtons = extension.coursesProvider.getChildren();

		if (courseButtons instanceof Array) {
			assert.deepStrictEqual(courseButtons, expectedButtons);
		} else {
			assert.fail("loginButton is not an array");
		}
	});

	test('get exercises (get children, element)', async () => {
		let user: User = {
			id: 343,
			username: "johndoe"
		};
		let course: Course = {
			id: 123,
			name: "Spring Boot Course"
		};
		user.courses = [course];
		let courseItem = new V4TItem(course.name, V4TItemType.Course, vscode.TreeItemCollapsibleState.Collapsed);
		extension.coursesProvider.userinfo = user;
		let exercises: Exercise[] = [{
			id: 4,
			name: "Exercise 1"
		},
		{
			id: 5,
			name: "Exercise 2"
		},
		{
			id: 6,
			name: "Exercise 3"
		}];
		let exerciseItems = exercises.map(exercise => new V4TItem(exercise.name, V4TItemType.Exercise, vscode.TreeItemCollapsibleState.None, {
			"command": "vscode4teaching.getexercisefiles",
			"title": "Get exercise files",
			"arguments": [course.name, exercise.name, exercise.id]
		}));
		let getExercisesMock = simple.mock(extension.coursesProvider.client, "getExercises");
		getExercisesMock.resolveWith({ data: exercises });

		extension.coursesProvider.getChildren(courseItem);

		await new Promise(resolve => setTimeout(resolve, 10)); // Wait for exercises to "download"

		let newExerciseItems = extension.coursesProvider.getChildren(courseItem);
		assert.deepStrictEqual(exerciseItems, newExerciseItems);

	});

	test('get exercise files', async () => {
		let user: User = {
			id: 343,
			username: "johndoe"
		};
		let getExercisesMock = simple.mock(extension.coursesProvider.client, "getExerciseFiles");
		getExercisesMock.resolveWith({
			data: fs.readFileSync(__dirname + path.sep + ".." + path.sep + ".." + path.sep + ".." +
				path.sep + 'test-resources' + path.sep + 'files' + path.sep + 'exs.zip')
		});
		extension.coursesProvider.userinfo = user;
		let newWorkspaceURI = await extension.coursesProvider.getExerciseFiles("Spring Boot Course", "Exercise 1", 4);
		await new Promise(resolve => setTimeout(resolve, 100)); // Wait for exercises to "download"
		assert.deepStrictEqual(fs.existsSync('v4tdownloads/johndoe/Spring Boot Course/Exercise 1/ex1.html'), true, "ex1 exists");
		assert.deepStrictEqual(fs.existsSync('v4tdownloads/johndoe/Spring Boot Course/Exercise 1/ex2.html'), true, "ex2 exists");
		assert.deepStrictEqual(fs.existsSync('v4tdownloads/johndoe/Spring Boot Course/Exercise 1/exs/ex3.html'), true, "ex3 exists");
		assert.deepStrictEqual(fs.existsSync('v4tdownloads/johndoe/Spring Boot Course/Exercise 1/exs/ex4/ex4.html'), true, "ex4 exists");
		assert.deepStrictEqual(newWorkspaceURI, path.resolve('v4tdownloads/johndoe/Spring Boot Course/Exercise 1'), "uri is correct");
	});

	test('on 401 should try to log in again', () => {
		let loginMock = simple.mock(extension.coursesProvider, "login");
		loginMock.resolveWith(null);
		let error = {
			response: {
				status: 401
			}
		};
		extension.coursesProvider.handleAxiosError(error);
		assert.deepStrictEqual(loginMock.callCount, 1, "login should be called");
	});

	test('on 403 should try to get csrf token again', () => {
		let csrfMock = simple.mock(extension.coursesProvider.client, "getCsrfToken");
		csrfMock.resolveWith(null);
		let error = {
			response: {
				status: 403
			}
		};
		extension.coursesProvider.handleAxiosError(error);
		assert.deepStrictEqual(csrfMock.callCount, 1, "get csrf should be called");
	});
});
