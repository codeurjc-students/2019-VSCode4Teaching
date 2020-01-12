import * as vscode from 'vscode';
import * as path from 'path';

let commentId = 1;

export class TeacherCommentProvider {
    readonly commentController: vscode.CommentController;
    private cwds: vscode.WorkspaceFolder[] = [];
    constructor (private author: string) {
        this.commentController = vscode.comments.createCommentController("teacherComments", "Teacher comments");
        this.commentController.commentingRangeProvider = {
            provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
                let relPath: string = "";
                for (let cwd of this.cwds) {
                    relPath = path.relative(cwd.uri.fsPath, document.uri.fsPath);
                    console.log(cwd.uri.fsPath);
                    console.log(document.uri.fsPath);
                    console.log(relPath);
                    if (relPath.length !== 0) {
                        break;
                    }
                }
                // If document isn't in workspace don't allow comments let rangeElements = 
                return relPath.length > 0 ? [new vscode.Range(0, 0, document.lineCount - 1, 0)] : [];
            }
        };
    }

    addCwd(cwd: vscode.WorkspaceFolder) {
        if (!this.cwds.includes(cwd)) {
            this.cwds.push(cwd);
        }
    }

    dispose() {
        this.commentController.dispose();
    }

    replyNote(reply: vscode.CommentReply) {
        let thread = reply.thread;
        let newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: this.author }, thread, thread.comments.length ? 'canDelete' : undefined);
        thread.comments = [...thread.comments, newComment];
        // TODO send comment to server
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