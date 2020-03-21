import { ServerCommentThread } from "../comment/ServerCommentThread";

export interface FileInfo {
    id: number;
    path: string;
    comments?: ServerCommentThread[];
}
