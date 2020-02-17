import * as vscode from 'vscode';
import * as path from 'path';
import { ServerComment, ServerCommentThread } from './model/commentServerModel';
import { RestClient } from './restclient';

let commentId = 1;

export class TeacherCommentProvider {
    readonly commentController: vscode.CommentController;
    private cwds: vscode.WorkspaceFolder[] = [];
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
            relPath = path.relative(cwd.uri.fsPath, document.uri.fsPath);
            if (relPath.length !== 0 && cwd.name !== "template") {
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
        let newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: this.author }, thread, thread.comments.length ? 'canDelete' : undefined);
        thread.comments = [...thread.comments, newComment];
        let serverCommentThread: ServerCommentThread = {
            line: thread.range.start.line,
            comments: thread.comments.map(comment => {
                let serverComment: ServerComment = {
                    author: comment.author.name,
                    body: comment.body.toString()
                };
                return serverComment;
            })
        };
        let client = RestClient.getClient();
        client.saveComment(fileId, serverCommentThread).catch((error: any) => {
            errorCallback(error);
        });
    }
}

export class NoteComment implements vscode.Comment {
    id: number;
    label: string | undefined;
    constructor(
        public body: string | vscode.MarkdownString,
        public mode: vscode.CommentMode,
        public author: vscode.CommentAuthorInformation,
        public parent?: vscode.CommentThread,
        public contextValue?: string
    ) {
        this.id = ++commentId;
    }
}