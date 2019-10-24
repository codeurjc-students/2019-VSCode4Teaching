import * as assert from 'assert';
import { afterEach, suite, test } from 'mocha';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as simple from 'simple-mock';
import { CourseItem } from '../../courses';

suite('Extension Test Suite', () => {

	afterEach(() => {
		simple.restore();
	});

	test('login', () => {
		let mockVSCodeInputBox = simple.mock(vscode.window, "showInputBox");
		mockVSCodeInputBox.resolveWith("http://test.com").resolveWith("johndoe").resolveWith("password");
		let mockLogin = simple.mock(extension.coursesProvider.client, "login");
		mockLogin.resolveWith({ "jwtToken": "mockToken" });
		let mockSetUrl = simple.mock(extension.coursesProvider.client, "setUrl");
		let mockSetJwtToken = simple.mock(extension.coursesProvider.client, "setJwtToken");
		let mockGetUserInfo = simple.mock(extension.coursesProvider.client, "getUserInfo");
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
		mockGetUserInfo.resolveWith(user);
		extension.coursesProvider.login().then(
			() => {
				assert.deepStrictEqual(mockVSCodeInputBox.callCount, 3, "vs code should ask for server, username and password");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[0].returned, "http://test.com", "server input box should return test url");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[1].returned, "johndoe", "username input box should return test username");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[2].returned, "password", "password input box should return test password");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[0].arg, { "prompt": "Server", "value": "http://localhost:8080" },
					"config for the server input box should have correct prompt and default value localhost:8080");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[1].arg, { "prompt": "Username" },
					"config for the username input box should have correct prompt");
				assert.deepStrictEqual(mockVSCodeInputBox.calls[2].arg, { "prompt": "Password", "password": true },
					"config for the password input box should have correct prompt and hide the input");
				assert.deepStrictEqual(mockLogin.callCount, 1, "login should be called 1 time");
				assert.deepStrictEqual(mockLogin.lastCall.returned, { "jwtToken": "mockToken" }, "client login mock should resolve with a mock token");
				assert.deepStrictEqual(mockLogin.lastCall.args, ["johndoe", "password"], "client should login with the credentials above");
				assert.deepStrictEqual(mockSetUrl.callCount, 1, "login should set server url in client");
				assert.deepStrictEqual(mockSetUrl.lastCall.arg, "http://test.com", "API url should be set to the url above");
				assert.deepStrictEqual(mockSetJwtToken.callCount, 1, "login should set the JWT Token for next operations");
				assert.deepStrictEqual(mockSetJwtToken.lastCall.arg, "mockToken", "setJwtToken should set the token received before");
				assert.deepStrictEqual(mockGetUserInfo.callCount, 1, "login should get user info");
				assert.deepStrictEqual(mockGetUserInfo.lastCall.returned, user, "user gotten should be the expected one");
			}
		);
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
		let expectedButton = new CourseItem("Login", vscode.TreeItemCollapsibleState.None, {
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
		let expectedButtons = user.courses.map(course => new CourseItem(course.name, vscode.TreeItemCollapsibleState.None));
		extension.coursesProvider.userinfo = user;

		let courseButtons = extension.coursesProvider.getChildren();

		if (courseButtons instanceof Array) {
			assert.deepStrictEqual(courseButtons, expectedButtons);
		} else {
			assert.fail("loginButton is not an array");
		}
	});
});
