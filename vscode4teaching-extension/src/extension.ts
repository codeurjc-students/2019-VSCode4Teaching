import { APIClient } from "./client/APIClient";
import * as vscode from 'vscode';
import { CoursesProvider } from './components/courses/CoursesTreeProvider';
import { Exercise, FileInfo, ModelUtils, User } from './model/serverModel/ServerModel';
import { V4TItem } from './components/courses/V4TItem';
import * as path from 'path';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { V4TExerciseFile } from './model/V4TExerciseFile';
import { FileIgnoreUtil } from './utils/FileIgnoreUtil';
import { TeacherCommentService, NoteComment } from './services/TeacherCommentsService';
import { Dictionary } from './model/Dictionary';
import * as mkdirp from 'mkdirp';
import { AxiosResponse } from 'axios';
import { CurrentUser } from './model/CurrentUser';
import { FileZipUtil } from './utils/FileZipUtil';

export let coursesProvider = new CoursesProvider();
let templates: Dictionary<string> = {};
let commentProvider: TeacherCommentService | undefined;
let cwds: ReadonlyArray<vscode.WorkspaceFolder> | undefined;
export function activate (context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider('vscode4teachingview', coursesProvider);
	if (fs.existsSync(APIClient.sessionPath)) {
		APIClient.initializeSessionCredentials();
		CurrentUser.updateUserInfo().catch((error) => APIClient.handleAxiosError(error));
	}
	// If cwd is a v4t exercise run file system watcher
	let cwds = vscode.workspace.workspaceFolders;
	if (cwds) {
		initializeExtension(cwds);
	}

	let loginDisposable = vscode.commands.registerCommand('vscode4teaching.login', () => {
		coursesProvider.login();
	});

	let logoutDisposable = vscode.commands.registerCommand('vscode4teaching.logout', () => {
		coursesProvider.logout();
	});

	let getFilesDisposable = vscode.commands.registerCommand('vscode4teaching.getexercisefiles', (courseName: string, exercise: Exercise) => {
		getSingleStudentExerciseFiles(courseName, exercise);
	});

	let getStudentFiles = vscode.commands.registerCommand('vscode4teaching.getstudentfiles', (courseName: string, exercise: Exercise) => {
		getMultipleStudentExerciseFiles(courseName, exercise);
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
		if (commentProvider && coursesProvider && CurrentUser.userinfo) {
			let filePath = reply.thread.uri.fsPath;
			let separator = path.sep;
			let currentUsername = CurrentUser.userinfo.username;
			let teacherRelativePath = filePath.split(separator + currentUsername + separator)[1];
			let teacherRelativePathSplit = teacherRelativePath.split(separator);
			let exerciseName = teacherRelativePathSplit[1];
			// If teacher use username from student, else use own
			let currentUserIsTeacher = ModelUtils.isTeacher(CurrentUser.userinfo);
			let username = currentUserIsTeacher ? teacherRelativePathSplit[2] : currentUsername;

			let fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.userinfo.username, ".fileInfo", exerciseName, username + ".json");
			let fileInfoArray: FileInfo[] = JSON.parse(fs.readFileSync(fileInfoPath, { encoding: "utf8" }));
			let fileRelativePath = currentUserIsTeacher ? filePath.split(separator + username + separator)[1] : filePath.split(separator + exerciseName + separator)[1];
			let fileInfo = fileInfoArray.find((file: FileInfo) => file.path === fileRelativePath);
			if (fileInfo) {
				commentProvider.replyNote(reply, fileInfo.id, APIClient.handleAxiosError);
			} else {
				vscode.window.showErrorMessage("Error retrieving file id, please download the exercise again.");
			}
		}
	});

	let share = vscode.commands.registerCommand('vscode4teaching.share', (item: V4TItem) => {
		if (item.item) {
			let codeThenable = APIClient.getSharingCode(item.item);
			codeThenable.then(response => {
				let code = response.data;
				vscode.window.showInformationMessage(
					"Share this code with your students to give them access to this course:\n" + code,
					"Copy to clipboard"
				).then(clicked => {
					if (clicked) {
						vscode.env.clipboard.writeText(code).then(() => {
							vscode.window.showInformationMessage("Copied to clipboard");
						});
					}
				});
			}).catch(error => APIClient.handleAxiosError(error));
		}
	});

	let signup = vscode.commands.registerCommand('vscode4teaching.signup', () => {
		coursesProvider.signup();
	});

	let signupTeacher = vscode.commands.registerCommand('vscode4teaching.signupteacher', () => {
		coursesProvider.signup(true);
	});

	let getWithCode = vscode.commands.registerCommand('vscode4teaching.getwithcode', () => {
		coursesProvider.getCourseWithCode();
	});

	context.subscriptions.push(loginDisposable, logoutDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
		deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
		removeUsersFromCourse, getStudentFiles, diff, createComment, share, signup, signupTeacher, getWithCode);
}

export function deactivate () {
	if (commentProvider) {
		commentProvider.dispose();
	}
}

// Meant to be used for tests
export function createNewCoursesProvider () {
	coursesProvider = new CoursesProvider();
}

export function initializeExtension (cwds: ReadonlyArray<vscode.WorkspaceFolder>) {
	let checkedUris: string[] = [];
	cwds.forEach((cwd: vscode.WorkspaceFolder) => {
		// Checks recursively from parent directory of cwd for v4texercise.v4t
		let parentDir = path.resolve(cwd.uri.fsPath, '..');
		if (!checkedUris.includes(parentDir)) {
			vscode.workspace.findFiles(new vscode.RelativePattern(parentDir, '**/v4texercise.v4t'), null, 1).then(uris => {
				checkedUris.push(parentDir);
				if (uris.length > 0) {
					let v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
					// Zip Uri should be in the text file
					let zipUri = path.resolve(v4tjson.zipLocation);
					// Exercise id is in the name of the zip file
					let zipSplit = zipUri.split(path.sep);
					let exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
					if (!commentProvider && CurrentUser.userinfo) {
						commentProvider = new TeacherCommentService(CurrentUser.userinfo.username);
					}
					if (commentProvider && CurrentUser.userinfo) {
						commentProvider.addCwd(cwd);
						// Download comments
						if (cwd.name !== "template") {
							let currentUserIsTeacher = ModelUtils.isTeacher(CurrentUser.userinfo);
							let username: string = currentUserIsTeacher ? cwd.name : CurrentUser.userinfo.username;
							commentProvider.getThreads(exerciseId, username, cwd, APIClient.handleAxiosError);
							setInterval(commentProvider.getThreads, 60000, exerciseId, username, cwd, APIClient.handleAxiosError);
						}
					}
					// Set template location if exists
					if (v4tjson.teacher && v4tjson.template) {
						// Template should be the same in the workspace
						templates[cwd.name] = v4tjson.template;
					}
					let jszipFile = new JSZip();
					if (!v4tjson.teacher && fs.existsSync(zipUri)) {
						setStudentEvents(jszipFile, cwd, zipUri, exerciseId);
					}
				}
			});
		}
	});

}

// Set File System Watcher and comment events
function setStudentEvents (jszipFile: JSZip, cwd: vscode.WorkspaceFolder, zipUri: string, exerciseId: number) {
	let ignoredFiles: string[] = FileIgnoreUtil.recursiveReadGitIgnores(cwd.uri.fsPath);
	jszipFile.loadAsync(fs.readFileSync(zipUri));
	let pattern = new vscode.RelativePattern(cwd, "**/*");
	let fsw = vscode.workspace.createFileSystemWatcher(pattern);
	fsw.onDidChange((e: vscode.Uri) => {
		updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
	});
	fsw.onDidCreate((e: vscode.Uri) => {
		updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
	});
	fsw.onDidDelete((e: vscode.Uri) => {
		if (!ignoredFiles.includes(e.fsPath)) {
			let filePath = path.resolve(e.fsPath);
			filePath = path.relative(cwd.uri.fsPath, filePath);
			jszipFile.remove(filePath);
			let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
			vscode.window.setStatusBarMessage("Compressing files...", thenable);
			thenable.then(zipData => APIClient.uploadFiles(exerciseId, zipData))
				.catch(err => APIClient.handleAxiosError(err));
		}
	});

	vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
		if (commentProvider && commentProvider.getFileCommentThreads(e.document.uri).length > 0) {
			vscode.window.showWarningMessage(
				"If you write over a line with comments, the comments could be deleted next time you open VS Code."
			);
		}
	});

	vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
		checkCommentLineChanges(e);
	});
}

function updateFile (ignoredFiles: string[], e: vscode.Uri, exerciseId: number, jszipFile: JSZip, cwd: vscode.WorkspaceFolder) {
	if (!ignoredFiles.includes(e.fsPath)) {
		let filePath = path.resolve(e.fsPath);
		fs.readFile(filePath, (err, data) => {
			filePath = path.relative(cwd.uri.fsPath, filePath);
			if (!filePath.includes("v4texercise.v4t")) {
				if (err) { throw (err); }
				jszipFile.file(filePath, data);
				let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
				vscode.window.setStatusBarMessage("Compressing files...", thenable);
				thenable.then(zipData => APIClient.uploadFiles(exerciseId, zipData))
					.catch(axiosError => APIClient.handleAxiosError(axiosError));
			}
		});
	}
}

function checkCommentLineChanges (document: vscode.TextDocument) {
	if (commentProvider) {
		let fileThreads = commentProvider.getFileCommentThreads(document.uri);
		for (let thread of fileThreads) {
			let docText = document.getText();
			let docTextSeparatedByLines = docText.split(/\r?\n/);
			let threadLine = thread[1].range.start.line;
			let threadLineText = (<NoteComment>thread[1].comments[0]).lineText;
			if (docTextSeparatedByLines[threadLine].trim() !== threadLineText.trim()) {
				for (let i = 0; i < docTextSeparatedByLines.length; i++) {
					let line = docTextSeparatedByLines[i];
					if (threadLineText.trim() === line.trim()) {
						let threadId = thread[0];
						commentProvider.updateThreadLine(threadId, i, line, APIClient.handleAxiosError);
						break;
					}
				}
			}
		}
	}
}

function getSingleStudentExerciseFiles (courseName: string, exercise: Exercise) {
	coursesProvider.getExerciseFiles(courseName, exercise).then(async (newWorkspaceURI) => {
		if (newWorkspaceURI) {
			let uri = vscode.Uri.file(newWorkspaceURI);
			// Get file info for id references
			if (coursesProvider && CurrentUser.userinfo) {
				let username = CurrentUser.userinfo.username;
				let fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, username, ".fileInfo", exercise.name);
				getFilesInfo(exercise, fileInfoPath, [username]);
			}
			vscode.workspace.updateWorkspaceFolders(0,
				vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
				{ uri: uri, name: exercise.name });
			cwds = vscode.workspace.workspaceFolders;
			if (cwds) {
				initializeExtension(cwds);
			}
		}
	});
}

function getMultipleStudentExerciseFiles (courseName: string, exercise: Exercise) {
	coursesProvider.getStudentFiles(courseName, exercise).then(async (newWorkspaceURIs) => {
		if (newWorkspaceURIs && newWorkspaceURIs[1]) {
			let wsURI: string = newWorkspaceURIs[1];
			let directories = fs.readdirSync(newWorkspaceURIs[1], { withFileTypes: true })
				.filter(dirent => dirent.isDirectory());
			// Get file info for id references
			if (coursesProvider && CurrentUser.userinfo) {
				let usernames = directories.filter(dirent => !dirent.name.includes("template")).map(dirent => dirent.name);
				let fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.userinfo.username, ".fileInfo", exercise.name);
				getFilesInfo(exercise, fileInfoPath, usernames);
			}
			let subdirectoriesURIs = directories.map(dirent => {
				return {
					uri: vscode.Uri.file(path.resolve(wsURI, dirent.name))
				};
			});
			//open all student files and template
			vscode.workspace.updateWorkspaceFolders(0,
				vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
				...subdirectoriesURIs);
			cwds = vscode.workspace.workspaceFolders;
			if (cwds) {
				initializeExtension(cwds);
			}
		}
	});
}

function getFilesInfo (exercise: Exercise, fileInfoPath: string, usernames: string[]) {
	if (!fs.existsSync(fileInfoPath)) {
		mkdirp.sync(fileInfoPath);
	}
	usernames.forEach(username => {
		APIClient.getFilesInfo(username, exercise.id).then(
			filesInfo => {
				fs.writeFileSync(path.resolve(fileInfoPath, username + ".json"), JSON.stringify(filesInfo.data), { encoding: "utf8" });
			}
		).catch(error => APIClient.handleAxiosError(error));
	});
}