import { Comment, CommentAuthorInformation, CommentMode, MarkdownString } from "vscode";

let commentId = 1;

export class NoteComment implements Comment {
    public id: number;
    public label: string | undefined;
    constructor(
        public body: string | MarkdownString,
        public mode: CommentMode,
        public author: CommentAuthorInformation,
        public lineText: string,
    ) {
        this.id = ++commentId;
    }
}
