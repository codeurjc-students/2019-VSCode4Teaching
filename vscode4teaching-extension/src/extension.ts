import * as vscode from 'vscode';
import { CoursesProvider } from './courses';
import { Exercise } from './model';
import { V4TItem } from './v4titem';

export let coursesProvider = new CoursesProvider();
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teachingview', coursesProvider);
	let loginDisposable = vscode.commands.registerCommand('vscode4teaching.login', () => {
		coursesProvider.login();
	});
	let getFilesDisposable = vscode.commands.registerCommand('vscode4teaching.getexercisefiles', (courseName: string, exercise: Exercise) => {
		coursesProvider.getExerciseFiles(courseName, exercise).then(async (newWorkspaceURI) => {
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
		coursesProvider.editCourse(item);
	});

	let deleteCourseDisposable = vscode.commands.registerCommand('vscode4teaching.deletecourse', (item: V4TItem) => {
		coursesProvider.deleteCourse(item);
	});

	let refreshView = vscode.commands.registerCommand('vscode4teaching.refreshcourses', () => {
		coursesProvider.refreshCourses();
	});

	let refreshCourse = vscode.commands.registerCommand('vscode4teaching.refreshexercises', (item: V4TItem) => {
		coursesProvider.refreshExercises(item);
	});

	let addExercise = vscode.commands.registerCommand('vscode4teaching.addexercise', (item: V4TItem) => {
		coursesProvider.addExercise(item);
	});

	let editExercise = vscode.commands.registerCommand('vscode4teaching.editexercise', (item: V4TItem) => {
		coursesProvider.editExercise(item);
	});

	let deleteExercise = vscode.commands.registerCommand('vscode4teaching.deleteexercise', (item: V4TItem) => {
		coursesProvider.deleteExercise(item);
	});

	context.subscriptions.push(loginDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
		deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise);
}

export function deactivate() { }

// Meant to be used for tests
export function createNewCoursesProvider() {
	coursesProvider = new CoursesProvider();
}