import * as vscode from 'vscode';
import { CoursesProvider } from './courses';

export const coursesProvider = new CoursesProvider();
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teaching', coursesProvider);
	let loginDisposable = vscode.commands.registerCommand('vscode4teaching.login', () => {
			coursesProvider.login();
	});

	context.subscriptions.push(loginDisposable);
}

export function deactivate() { }