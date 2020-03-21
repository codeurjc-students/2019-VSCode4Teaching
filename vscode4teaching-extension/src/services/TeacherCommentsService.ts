import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
import { ServerComment } from "../model/serverModel/comment/ServerComment";
import { ServerCommentThread } from "../model/serverModel/comment/ServerCommentThread";
import { NoteComment } from "./NoteComment";

export class TeacherCommentService {
    public readonly commentController: vscode.CommentController;
    private cwds: vscode.WorkspaceFolder[] = [];
    // Key: server id, value: thread
    private threads: Map<number, vscode.CommentThread> = new Map();
    private client = APIClient.getClient();
    constructor(private author: string) {
        this.commentController = vscode.comments.createCommentController("teacherComments", "Teacher comments");
        this.commentController.commentingRangeProvider = {
            provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
                // If document isn't in workspace don't allow comments
                return this.isValidDocument(document) ? [new vscode.Range(0, 0, document.lineCount - 1, 0)] : [];
            },
        };
    }

    public addCwd(cwd: vscode.WorkspaceFolder) {
        if (!this.cwds.includes(cwd)) {
            this.cwds.push(cwd);
        }
    }

    public dispose() {
        this.commentController.dispose();
    }

    public replyNote(reply: vscode.CommentReply, fileId: number, errorCallback: ((error: any) => void)) {
        const thread = reply.thread;
        const markdownText = new vscode.MarkdownString(reply.text);
        vscode.workspace.openTextDocument(reply.thread.uri).then((textDoc: vscode.TextDocument) => {
            const lineText = textDoc.lineAt(thread.range.start.line).text;
            const newComment = new NoteComment(markdownText, vscode.CommentMode.Preview, { name: this.author }, lineText);
            thread.comments = [...thread.comments, newComment];
            const serverCommentThread: ServerCommentThread = {
                line: thread.range.start.line,
                lineText,
                comments: thread.comments.map((comment) => {
                    const serverComment: ServerComment = {
                        author: this.author,
                        body: comment.body instanceof vscode.MarkdownString ? comment.body.value : comment.body,
                    };
                    return serverComment;
                }),
            };
            this.client.saveComment(fileId, serverCommentThread).then((response) => {
                if (response.data.id) {
                    this.threads.set(response.data.id, thread);
                }
            }).catch((error: any) => {
                errorCallback(error);
            });
        });
    }

    public getThreads(exerciseId: number, username: string, cwd: vscode.WorkspaceFolder, errorCallback: ((error: any) => void)) {
        let currentCommentThread: ServerCommentThread;
        const callCreateThreadServer = (textDoc: vscode.TextDocument) => {
            this.createThreadFromServer(currentCommentThread, textDoc);
        };
        this.client.getAllComments(username, exerciseId).then(((response) => {
            if (response.data) {
                const fileInfoArray = response.data;
                for (const fileInfo of fileInfoArray) {
                    if (fileInfo.comments) {
                        for (const commentThread of fileInfo.comments) {
                            const uri = vscode.Uri.file(path.resolve(cwd.uri.fsPath, fileInfo.path));
                            currentCommentThread = commentThread;
                            vscode.workspace.openTextDocument(uri).then(callCreateThreadServer);
                        }
                    }
                }
            }
        })).catch((error: any) => {
            errorCallback(error);
        });
    }

    public getFileCommentThreads(uri: vscode.Uri) {
        const fileThreads: Array<[number, vscode.CommentThread]> = [];
        for (const thread of this.threads) {
            if (uri.fsPath === thread[1].uri.fsPath) {
                fileThreads.push(thread);
            }
        }
        return fileThreads;
    }

    public updateThreadLine(threadId: number, line: number, lineText: string, errorCallback: ((e: any) => void)) {
        this.client.updateCommentThreadLine(threadId, line, lineText).then((response) => {
            const commentThread = response.data;
            const oldThread = this.threads.get(threadId);
            if (oldThread) {
                oldThread.range = new vscode.Range(commentThread.line, 0, commentThread.line, 0);
            }
        }).catch((error) => {
            errorCallback(error);
        });
    }

    private isValidDocument(document: vscode.TextDocument) {
        let relPath: string = "";
        for (const cwd of this.cwds) {
            relPath = path.relative(cwd.uri.fsPath, document.fileName);
            if (relPath.length !== 0 && cwd.name !== "template" && !document.fileName.includes("v4texercise.v4t")) {
                return true;
            }
        }
        return false;
    }

    private createThreadFromServer(commentThread: ServerCommentThread, textDoc: vscode.TextDocument) {
        const lineText = textDoc.lineAt(commentThread.line).text;
        if (commentThread.comments && lineText.trim() === commentThread.lineText.trim()) {
            const comments = commentThread.comments.map((comment) => new NoteComment(
                new vscode.MarkdownString(comment.body), vscode.CommentMode.Preview, { name: comment.author }, lineText,
            ));
            const newThread = this.commentController.createCommentThread(
                textDoc.uri,
                new vscode.Range(commentThread.line, 0, commentThread.line, 0),
                comments,
            );
            if (commentThread.id) {
                this.threads.set(commentThread.id, newThread);
            }
        }
    }
}
