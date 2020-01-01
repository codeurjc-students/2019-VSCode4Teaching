import * as vscode from 'vscode';
import { CoursesProvider } from './courses';
import { Exercise } from './model/serverModel';
import { V4TItem } from './v4titem';
import * as path from 'path';
import * as fs from 'fs';
import JSZip = require('jszip');
import { V4TExerciseFile } from './model/v4texerciseFile';

export let coursesProvider = new CoursesProvider();
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teachingview', coursesProvider);
	// If cwd is a v4t exercise run file system watcher
	let cwds = vscode.workspace.workspaceFolders;
	if (cwds) {
		enableFSWIfExercise(cwds);
	}

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

	let addUsersToCourse = vscode.commands.registerCommand('vscode4teaching.adduserstocourse', (item: V4TItem) => {
		coursesProvider.addUsersToCourse(item);
	});

	let removeUsersFromCourse = vscode.commands.registerCommand('vscode4teaching.removeusersfromcourse', (item: V4TItem) => {
		coursesProvider.removeUsersFromCourse(item);
	});

	let getStudentFiles = vscode.commands.registerCommand('vscode4teaching.getstudentfiles', (courseName: string, exercise: Exercise) => {
		coursesProvider.getStudentFiles(courseName, exercise).then(async (newWorkspaceURI) => {
			if (newWorkspaceURI && newWorkspaceURI[1]) {
				let uri = vscode.Uri.file(newWorkspaceURI[1]);
				await vscode.commands.executeCommand('vscode.openFolder', uri);
			}
		});
	});

	context.subscriptions.push(loginDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
		deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
		removeUsersFromCourse, getStudentFiles);
}

export function deactivate() { }

// Meant to be used for tests
export function createNewCoursesProvider() {
	coursesProvider = new CoursesProvider();
}

export function enableFSWIfExercise(cwds: vscode.WorkspaceFolder[]) {
	cwds.forEach((cwd: vscode.WorkspaceFolder) => {
		vscode.workspace.findFiles(new vscode.RelativePattern(cwd, 'v4texercise.v4t'), null, 1).then(uris => {
			if (uris.length > 0) {
				// Zip Uri should be in the text file
				let v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
				let zipUri = path.resolve(v4tjson.zipLocation);
				let jszipFile = new JSZip();
				if (fs.existsSync(zipUri)) {
					jszipFile.loadAsync(fs.readFileSync(zipUri));
					let fsw = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, "**/*.*"));
					fsw.onDidChange((e: vscode.Uri) => {
						updateFile(e, zipUri, jszipFile, cwd);
					});
					fsw.onDidCreate((e: vscode.Uri) => {
						updateFile(e, zipUri, jszipFile, cwd);
					});
					fsw.onDidDelete((e: vscode.Uri) => {
						let filePath = path.resolve(e.fsPath);
						filePath = path.relative(cwd.uri.fsPath, filePath);
						jszipFile.remove(filePath);
						// Exercise id is in the name of the zip file
						let zipSplit = zipUri.split(path.sep);
						let exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
						let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
						vscode.window.setStatusBarMessage("Uploading files...", thenable);
						thenable.then(zipData => coursesProvider.client.uploadFiles(exerciseId, zipData))
							.catch(err => coursesProvider.handleAxiosError(err));
					});
				}
			}
		});
	});

}

function updateFile(e: vscode.Uri, zipUri: string, jszipFile: JSZip, cwd: vscode.WorkspaceFolder) {
	let filePath = path.resolve(e.fsPath);
	fs.readFile(filePath, (err, data) => {
		filePath = path.relative(cwd.uri.fsPath, filePath);
		if (!filePath.includes("v4texercise.v4t")) {
			if (err) { throw (err); }
			jszipFile.file(filePath, data);
			// Exercise id is in the name of the zip file
			let zipSplit = zipUri.split(path.sep);
			let exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
			let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
			vscode.window.setStatusBarMessage("Uploading files...", thenable);
			thenable.then(zipData => coursesProvider.client.uploadFiles(exerciseId, zipData))
				.catch(err => coursesProvider.handleAxiosError(err));
		}
	});
}