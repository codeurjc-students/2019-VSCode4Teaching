import * as vscode from 'vscode';
import { RestClient } from './restclient';

const client = new RestClient();
export function activate(context: vscode.ExtensionContext) {
	let loginDisposable = vscode.commands.registerCommand('extension.login', () => {
		login();
	});

	context.subscriptions.push(loginDisposable);
}

export function deactivate() { }

export async function login() {
	// Ask for server url, then username, then password, and try to log in at the end
	let serverInputOptions: vscode.InputBoxOptions = { "prompt": "Server", "value": "http://localhost:8080" };
	serverInputOptions.validateInput = validateInputCustomUrl;
	let url: string | undefined = await vscode.window.showInputBox(serverInputOptions);
	if (url) {
		client.setUrl(url);
		let username: string | undefined = await vscode.window.showInputBox({ "prompt": "Username" });
		if (username) {
			let password: string | undefined = await vscode.window.showInputBox({ "prompt": "Password", "password": true });
			if (password) {
				await callLogin(username, password);
			}
		}
	}
}

async function callLogin(username: string, password: string) {
	let loginThenable = client.login(username, password);
	vscode.window.setStatusBarMessage("Logging in to VS Code 4 Teaching...", loginThenable);
	try {
		let response = await loginThenable;
		vscode.window.showInformationMessage("Logged in");
		client.setJwtToken(response.data['jwtToken']);
	} catch (error) {
		if (error.response) {
			vscode.window.showErrorMessage(error.response.data);
		} else if (error.request) {
			vscode.window.showErrorMessage("Can't connect to the server");
		} else {
			vscode.window.showErrorMessage(error.message);
		}
	}
}

export function validateInputCustomUrl(value: string): string | undefined | null | Thenable<string | undefined | null> {
	let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
	let pattern = new RegExp(regexp);
	if (pattern.test(value)) {
		return null;
	} else {
		return "Invalid URL";
	}

}

export function getClient(): RestClient {
	return client;
}