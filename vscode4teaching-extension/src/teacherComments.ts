import * as vscode from 'vscode';
import * as path from 'path';
import { ServerComment, ServerCommentThread } from './model/commentServerModel';
import { RestClient } from './restclient';

let commentId = 1;

export class TeacherCommentProvider {
    readonly commentController: vscode.CommentController;
    private cwds: vscode.WorkspaceFolder[] = [];
    // Key: server id, value: thread
    private threads: Map<number, vscode.CommentThread> = new Map();
    constructor(private author: string) {
        this.commentController = vscode.comments.createCommentController("teacherComments", "Teacher comments");
        this.commentController.commentingRangeProvider = {
            provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
                // If document isn't in workspace don't allow comments
                return this.isValidDocument(document) ? [new vscode.Range(0, 0, document.lineCount - 1, 0)] : [];
            }
        };
    }

    private isValidDocument(document: vscode.TextDocument) {
        let relPath: string = "";
        for (let cwd of this.cwds) {
            relPath = path.relative(cwd.uri.fsPath, document.fileName);
            if (relPath.length !== 0 && cwd.name !== "template" && !document.fileName.includes("v4texercise.v4t")) {
                return true;
            }
        }
        return false;
    }

    addCwd(cwd: vscode.WorkspaceFolder) {
        if (!this.cwds.includes(cwd)) {
            this.cwds.push(cwd);
        }
    }

    dispose() {
        this.commentController.dispose();
    }

    replyNote(reply: vscode.CommentReply, fileId: number, errorCallback: ((error: any) => void)) {
        let thread = reply.thread;
        let markdownText = new vscode.MarkdownString(reply.text);
        vscode.workspace.openTextDocument(reply.thread.uri).then((textDoc: vscode.TextDocument) => {
            let lineText = textDoc.lineAt(thread.range.start.line).text;
            let newComment = new NoteComment(markdownText, vscode.CommentMode.Preview, { name: this.author }, lineText);
            thread.comments = [...thread.comments, newComment];
            let serverCommentThread: ServerCommentThread = {
                line: thread.range.start.line,
                lineText: lineText,
                comments: thread.comments.map(comment => {
                    let serverComment: ServerComment = {
                        author: this.author,
                        body: comment.body instanceof vscode.MarkdownString ? comment.body.value : comment.body
                    };
                    return serverComment;
                })
            };
            let client = RestClient.getClient();
            client.saveComment(fileId, serverCommentThread).then(response => {
                if (response.data.id) {
                    this.threads.set(response.data.id, thread);
                }
            }).catch((error: any) => {
                errorCallback(error);
            });
        });
    }

    getThreads(exerciseId: number, username: string, cwd: vscode.WorkspaceFolder, errorCallback: ((error: any) => void)) {
        let client = RestClient.getClient();
        client.getAllComments(username, exerciseId).then((response => {
            if (response.data) {
                let fileInfoArray = response.data;
                for (let fileInfo of fileInfoArray) {
                    if (fileInfo.comments) {
                        for (let commentThread of fileInfo.comments) {
                            let uri = vscode.Uri.file(path.resolve(cwd.uri.fsPath, fileInfo.path));
                            vscode.workspace.openTextDocument(uri).then((textDoc: vscode.TextDocument) => {
                                let lineText = textDoc.lineAt(commentThread.line).text;
                                if (commentThread.comments && lineText.trim() === commentThread.lineText.trim()) {
                                    let comments = commentThread.comments.map(comment => new NoteComment(
                                        new vscode.MarkdownString(comment.body), vscode.CommentMode.Preview, { name: comment.author }, lineText
                                    ));
                                    let newThread = this.commentController.createCommentThread(
                                        uri,
                                        new vscode.Range(commentThread.line, 0, commentThread.line, 0),
                                        comments
                                    );
                                    if (commentThread.id) {
                                        this.threads.set(commentThread.id, newThread);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        })).catch((error: any) => {
            errorCallback(error);
        });
    }

    getFileCommentThreads(uri: vscode.Uri) {
        let fileThreads: [number, vscode.CommentThread][] = [];
        for (let thread of this.threads) {
            if (uri.fsPath === thread[1].uri.fsPath) {
                fileThreads.push(thread);
            }
        }
        return fileThreads;
    }

    removeThread(id: number) {
        this.threads.delete(id);
    }
}

export class NoteComment implements vscode.Comment {
    id: number;
    label: string | undefined;
    constructor(
        public body: string | vscode.MarkdownString,
        public mode: vscode.CommentMode,
        public author: vscode.CommentAuthorInformation,
        public lineText: string
    ) {
        this.id = ++commentId;
    }
}