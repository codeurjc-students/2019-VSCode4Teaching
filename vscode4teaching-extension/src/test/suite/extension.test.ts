import * as assert from 'assert';
import { afterEach, suite, test } from 'mocha';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as simple from 'simple-mock';

suite('Extension Test Suite', () => {

	afterEach(() => {
		simple.restore();
	});

	test('login', () => {
		let mockVSCodeInputBox = simple.mock(vscode.window, "showInputBox");
		mockVSCodeInputBox.resolveWith("http://test.com").resolveWith("johndoe").resolveWith("password");
		let mockLogin = simple.mock(extension.getClient(), "login");
		mockLogin.resolveWith({ "jwtToken": "mockToken" });
		let mockSetUrl = simple.mock(extension.getClient(), "setUrl");
		let mockSetJwtToken = simple.mock(extension.getClient(), "setJwtToken");
		extension.login().then(
			() => {
				assert.equal(mockVSCodeInputBox.callCount, 3, "vs code should ask for server, username and password");
				assert.equal(mockLogin.callCount, 1, "login should be called 1 time");
				assert.equal(mockSetUrl.callCount, 1, "login should set server url in client");
				assert.equal(mockSetJwtToken.callCount, 1, "login should set the JWT Token for next operations");
			}
		);
	});

	test('validate URL', () => {
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://localhost:8080"), null, "http://localhost:8080");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://localhost:3000"), null, "http://localhost:3000");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://192.168.99.100:8080"), null, "http://192.168.99.100:8080");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://1.2.4.3"), null, "http://1.2.4.3");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://test.com:4567"), null, "http://test.com:4567");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://api.test.com"), null, "http://api.test.com");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://test.com/api"), null, "http://test.com/api");
		assert.deepStrictEqual(extension.validateInputCustomUrl("http://test.com/api:8080"), null, "http://test.com/api:8080");
	});
});
