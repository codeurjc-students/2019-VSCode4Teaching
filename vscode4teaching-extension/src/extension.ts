import * as vscode from 'vscode';
import { CoursesProvider } from './courses';
import { Exercise } from './model/serverModel';
import { V4TItem } from './v4titem';
import * as path from 'path';
import * as fs from 'fs';
import JSZip = require('jszip');
import { V4TExerciseFile } from './model/v4texerciseFile';
import { FileIgnoreUtil } from './fileIgnoreUtil';
import { TeacherCommentProvider, NoteComment } from './teacherComments';
import { Dictionary } from './model/dictionary';
import { RestClient } from './restclient';

export let coursesProvider = new CoursesProvider();
let templates: Dictionary<string> = {};
let commentProvider: TeacherCommentProvider | undefined;
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teachingview', coursesProvider);
	let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
	if (fs.existsSync(sessionPath)) {
		let readSession = fs.readFileSync(sessionPath).toString();
		let sessionParts = readSession.split('\n');
		let client = RestClient.getClient();
		client.jwtToken = sessionParts[0];
		client.xsrfToken = sessionParts[1];
		client.baseUrl = sessionParts[2];
		coursesProvider.getUserInfo();
	}
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
				let wsURI: string = newWorkspaceURI[1];
				let subdirectoriesURIs = fs.readdirSync(newWorkspaceURI[1], {withFileTypes: true})
					.filter(dirent => dirent.isDirectory())
					.map(dirent => {
						return {
							uri: vscode.Uri.file(path.resolve(wsURI, dirent.name))
						};
					});
					//open all student files and template
					vscode.workspace.updateWorkspaceFolders(0, 
						vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length: 0, 
						...subdirectoriesURIs);
					cwds = vscode.workspace.workspaceFolders;
					if (cwds) {
						enableFSWIfExercise(cwds);
					}
			}
		});
	});

	let diff = vscode.commands.registerCommand('vscode4teaching.diff', (file: vscode.Uri) => {
			let wf = vscode.workspace.getWorkspaceFolder(file);
			if (wf) {
				let relativePath = path.relative(wf.uri.fsPath, file.fsPath);
				let templateFile = path.resolve(templates[wf.name], relativePath);
				if (fs.existsSync(templateFile)) {
					let templateFileUri = vscode.Uri.file(templateFile);
					vscode.commands.executeCommand('vscode.diff', file, templateFileUri);
				} else {
					vscode.window.showErrorMessage("File doesn't exist in the template.");
				}
			}
	});

	let createComment = vscode.commands.registerCommand('vscode4teaching.createComment', (reply: vscode.CommentReply) => {
		if (commentProvider) {
			commentProvider.replyNote(reply);
		}
	});

	let deleteComment = vscode.commands.registerCommand('vscode4teaching.deleteComment', (comment: NoteComment) => {
		let thread = comment.parent;
		if (!thread) {
			return;
		}

		thread.comments = thread.comments.filter(cmt => (cmt as NoteComment).id !== comment.id);

		if (thread.comments.length === 0 ) {
			thread.dispose();
		}
	});

	let deleteCommentThread = vscode.commands.registerCommand('vscode4teaching.deleteCommentThread', (thread: vscode.CommentThread) => {
		thread.dispose();
	});

	let saveComment = vscode.commands.registerCommand('vscode4teaching.saveComment', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				cmt.mode = vscode.CommentMode.Preview;
			}

			return cmt;
		});
	});

	let cancelSaveComment = vscode.commands.registerCommand('vscode4teaching.cancelSaveComment', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				cmt.mode = vscode.CommentMode.Preview;
			}

			return cmt;
		});
	});

	let editComment = vscode.commands.registerCommand('vscode4teaching.editComment', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				cmt.mode = vscode.CommentMode.Editing;
			}

			return cmt;
		});
	});

	context.subscriptions.push(loginDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
		deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
		removeUsersFromCourse, getStudentFiles, diff, createComment, saveComment, cancelSaveComment, deleteComment,
		deleteCommentThread);
}

export function deactivate() {
	if (commentProvider) {
		commentProvider.dispose();
	}
}

// Meant to be used for tests
export function createNewCoursesProvider() {
	coursesProvider = new CoursesProvider();
}

export function enableFSWIfExercise(cwds: vscode.WorkspaceFolder[]) {
	let checkedUris: string[] = [];
	cwds.forEach((cwd: vscode.WorkspaceFolder) => {
		// Checks recursively from parent directory of cwd for v4texercise.v4t
		let parentDir = path.resolve(cwd.uri.fsPath, '..');
		if (!checkedUris.includes(parentDir)) {
			vscode.workspace.findFiles(new vscode.RelativePattern(parentDir, '**/v4texercise.v4t'), null, 1).then(uris => {
				checkedUris.push(parentDir);
				if (uris.length > 0) {
					let v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
					// Set template location if exists
					if (v4tjson.teacher && v4tjson.template) {
						// Template should be the same in the workspace
						templates[cwd.name] = v4tjson.template;
						if (!commentProvider && coursesProvider.userinfo) {
							commentProvider = new TeacherCommentProvider(coursesProvider.userinfo.username);
						}
						if (commentProvider) {
							commentProvider.addCwd(cwd);
						}
					}
					// Zip Uri should be in the text file
					let zipUri = path.resolve(v4tjson.zipLocation);
					let jszipFile = new JSZip();
					if (!v4tjson.teacher && fs.existsSync(zipUri)) {
						let ignoredFiles: string[] = FileIgnoreUtil.recursiveReadGitIgnores(cwd.uri.fsPath);
						jszipFile.loadAsync(fs.readFileSync(zipUri));
						let fsw = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, "**/*.*"));
						fsw.onDidChange((e: vscode.Uri) => {
							if (!ignoredFiles.includes(e.fsPath)) {
								updateFile(e, zipUri, jszipFile, cwd);
							}
						});
						fsw.onDidCreate((e: vscode.Uri) => {
							if (!ignoredFiles.includes(e.fsPath)) {
								updateFile(e, zipUri, jszipFile, cwd);
							}
						});
						fsw.onDidDelete((e: vscode.Uri) => {
							if (!ignoredFiles.includes(e.fsPath)) {
								let filePath = path.resolve(e.fsPath);
								filePath = path.relative(cwd.uri.fsPath, filePath);
								jszipFile.remove(filePath);
								// Exercise id is in the name of the zip file
								let zipSplit = zipUri.split(path.sep);
								let exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
								let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
								vscode.window.setStatusBarMessage("Uploading files...", thenable);
								thenable.then(zipData => RestClient.getClient().uploadFiles(exerciseId, zipData))
									.catch(err => coursesProvider.handleAxiosError(err));
							}
						});
					}
				}
			});
		}
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
			thenable.then(zipData => RestClient.getClient().uploadFiles(exerciseId, zipData))
				.catch(err => coursesProvider.handleAxiosError(err));
		}
	});
}