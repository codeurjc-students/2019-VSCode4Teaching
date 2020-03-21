import { ServerComment } from "./ServerComment";

export interface ServerCommentThread {
    id?: number;
    comments?: ServerComment[];
    line: number;
    lineText: string;
}
