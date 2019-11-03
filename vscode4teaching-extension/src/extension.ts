import * as vscode from 'vscode';
import { CoursesProvider } from './courses';

export let coursesProvider = new CoursesProvider();
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teaching', coursesProvider);
	let loginDisposable = vscode.commands.registerCommand('vscode4teaching.login', () => {
		coursesProvider.login();
	});
	let getFilesDisposable = vscode.commands.registerCommand('vscode4teaching.getexercisefiles', (courseName: string, exerciseName: string, exerciseId: number) => {
		coursesProvider.getExerciseFiles(courseName, exerciseName, exerciseId).then(async (newWorkspaceURI) => {
			if (newWorkspaceURI) {
				let uri = vscode.Uri.file(newWorkspaceURI);
				await vscode.commands.executeCommand('vscode.openFolder', uri);
			}
		});
	});
	context.subscriptions.push(loginDisposable, getFilesDisposable);
}

export function deactivate() { }

// Meant to be used for tests
export function createNewCoursesProvider() {
	coursesProvider = new CoursesProvider();
}