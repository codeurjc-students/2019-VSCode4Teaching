export interface ServerCommentThread {
    comments?: ServerComment[];
    line: number;
}

export interface ServerComment {
    author: string;
    body: string;
}