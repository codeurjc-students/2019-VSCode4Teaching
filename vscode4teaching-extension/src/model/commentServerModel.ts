export interface ServerCommentThread {
    comments?: ServerComment[];
    file: string;
    line: number;
}

export interface ServerComment {
    author: string;
    body: string;
    parent: ServerCommentThread;
}