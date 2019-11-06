import * as vscode from 'vscode';
import { CoursesProvider, V4TItem } from './courses';

export let coursesProvider = new CoursesProvider();
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teachingview', coursesProvider);
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
	let addCourseDisposable = vscode.commands.registerCommand('vscode4teaching.addcourse', () => {
		coursesProvider.addCourse();
	});

	let editCourseDisposable = vscode.commands.registerCommand('vscode4teaching.editcourse', (item: V4TItem) => {
		coursesProvider.editCourse(item.label);
	});

	let deleteCourseDisposable = vscode.commands.registerCommand('vscode4teaching.deletecourse', () => {
		coursesProvider.deleteCourse();
	});

	let refreshView = vscode.commands.registerCommand('vscode4teaching.refreshcourses', () => {
		coursesProvider.refreshCourses();
	});
	context.subscriptions.push(loginDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable, deleteCourseDisposable, refreshView);
}

export function deactivate() { }

// Meant to be used for tests
export function createNewCoursesProvider() {
	coursesProvider = new CoursesProvider();
}