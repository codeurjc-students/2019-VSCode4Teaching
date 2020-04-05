import { Comment, CommentAuthorInformation, CommentMode, MarkdownString } from "vscode";

let commentId = 1;

/**
 * Stores information about the comments in a comment thread
 */
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
