import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
import { ServerComment } from "../model/serverModel/comment/ServerComment";
import { ServerCommentThread } from "../model/serverModel/comment/ServerCommentThread";
import { NoteComment } from "./NoteComment";

/**
 * Manages comment threads and comments, supported by the VSCode comment API
 */
export class TeacherCommentService {
    public readonly commentController: vscode.CommentController;
    private cwds: vscode.WorkspaceFolder[] = [];
    // Key: server id, value: thread
    private threads: Map<number, vscode.CommentThread> = new Map();
    constructor(private author: string) {
        this.commentController = vscode.comments.createCommentController("teacherComments", "Teacher comments");
        this.commentController.commentingRangeProvider = {
            provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
                // If document isn't valid don't allow comments
                return this.isValidDocument(document) ? [new vscode.Range(0, 0, document.lineCount - 1, 0)] : [];
            },
        };
    }

    /**
     * Include current workspace to list of valid current workspaces for checking document validity
     * @param cwd current workspace directory to add
     */
    public addCwd(cwd: vscode.WorkspaceFolder) {
        if (!this.cwds.includes(cwd)) {
            this.cwds.push(cwd);
        }
    }

    /**
     * Dispose comment controller
     */
    public dispose() {
        this.commentController.dispose();
    }

    /**
     * Adds comment to file
     * @param reply Comment reply to add (given by vscode and passed to this method)
     * @param fileId file to add comment to
     * @param errorCallback callback to call in case of backend API error
     */
    public async addComment(reply: vscode.CommentReply, fileId: number) {
        const thread = reply.thread;
        const markdownText = new vscode.MarkdownString(reply.text);
        const textDoc = await vscode.workspace.openTextDocument(reply.thread.uri);
        // Get text line that is being commented on
        const lineText = textDoc.lineAt(thread.range.start.line).text;
        // Create the new comment and add it to the thread
        const newComment = new NoteComment(markdownText, vscode.CommentMode.Preview, { name: this.author }, lineText);
        thread.comments = [...thread.comments, newComment];
        // Setup for sending the comment to the backend
        const serverCommentThread: ServerCommentThread = {
            line: thread.range.start.line,
            lineText,
            comments: thread.comments.map((comment) => {
                const body = comment.body;
                let bodyText = "";
                if (typeof body === "string") {
                    bodyText = body;
                } else {
                    bodyText = body.value;
                }
                const serverComment: ServerComment = {
                    author: comment.author.name,
                    body: bodyText,
                };
                return serverComment;
            }),
        };
        const response = await APIClient.saveComment(fileId, serverCommentThread);
        console.debug(response);
        // If saved correctly then add thread to the map
        if (response.data.id) {
            this.threads.set(response.data.id, thread);
        }
    }

    /**
     * Get comments assigned to a user for an exercise from server
     * @param exerciseId exercise
     * @param username user
     * @param cwd workspace directory of the files
     * @param errorCallback error callback if API request fails
     */
    public async getThreads(exerciseId: number, username: string, cwd: vscode.WorkspaceFolder, errorCallback: (err: any) => void) {
        try {
            const response = await APIClient.getAllComments(username, exerciseId);
            console.debug(response);
            if (response.data) {
                const fileInfoArray = response.data;
                for (const fileInfo of fileInfoArray) {
                    if (fileInfo.comments) {
                        const uri = vscode.Uri.file(path.resolve(cwd.uri.fsPath, fileInfo.path));
                        // if document exists and can be opened then add thread
                        const textDoc = await vscode.workspace.openTextDocument(uri);
                        for (const commentThread of fileInfo.comments) {
                            this.createThreadFromServer(commentThread, textDoc);
                        }
                    }
                }
            }
        } catch (err) {
            errorCallback(err);
        }
    }

    /**
     * Get all comment threads from a file
     * @param uri file uri
     */
    public getFileCommentThreads(uri: vscode.Uri) {
        const fileThreads: Array<[number, vscode.CommentThread]> = [];
        for (const thread of this.threads) {
            if (uri.fsPath === thread[1].uri.fsPath) {
                fileThreads.push(thread);
            }
        }
        return fileThreads;
    }

    /**
     * Update the line information of a comment thread
     * @param threadId thread
     * @param line line location
     * @param lineText text of the line
     * @param errorCallback error callback if request fails
     */
    public async updateThreadLine(threadId: number, line: number, lineText: string) {
        const response = await APIClient.updateCommentThreadLine(threadId, line, lineText);
        console.debug(response);
        const commentThread = response.data;
        const oldThread = this.threads.get(threadId);
        if (oldThread) {
            oldThread.range = new vscode.Range(commentThread.line, 0, commentThread.line, 0);
        }
    }

    public setThread(id: number, thread: vscode.CommentThread) {
        this.threads.set(id, thread);
    }

    /**
     * A document is valid for comments if its in a current workspace, isn't a template file and isn't a v4t internal file
     * @param document document to check
     */
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

    /**
     * Creates comment thread from API response
     * @param commentThread comment thread
     * @param textDoc document to add thread
     */
    private createThreadFromServer(commentThread: ServerCommentThread, textDoc: vscode.TextDocument) {
        const lineText = textDoc.lineAt(commentThread.line).text;
        // If line is found add thread
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
