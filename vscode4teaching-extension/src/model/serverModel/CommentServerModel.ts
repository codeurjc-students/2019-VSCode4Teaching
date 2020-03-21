export interface ServerCommentThread {
    id?: number;
    comments?: ServerComment[];
    line: number;
    lineText: string;
}

export interface ServerComment {
    author: string;
    body: string;
}
