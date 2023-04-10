export interface Node {
    name: string;
    parentDirectoryNode?: DirectoryNode;

    get relativePath(): string;
}

export class FileNode implements Node {
    name: string;
    parentDirectoryNode: DirectoryNode;

    lastModifiedTime: number;
    fileBlob: Blob;

    constructor(name: string, lastModifiedTime: number, fileBlob: Blob, parentDirectoryNode: DirectoryNode) {
        this.name = name;
        this.lastModifiedTime = lastModifiedTime;
        this.fileBlob = fileBlob;
        this.parentDirectoryNode = parentDirectoryNode;
    }

    get relativePath(): string {
        return (this.parentDirectoryNode === undefined) ? "" : this.parentDirectoryNode.relativePath + "/" + this.name;
    }
}

export class DirectoryNode implements Node {
    name: string;
    parentDirectoryNode?: DirectoryNode;

    children: Node[];

    constructor(name: string, children: Node[], parentDirectoryNode?: DirectoryNode) {
        this.name = name;
        this.children = children;
        this.parentDirectoryNode = parentDirectoryNode ?? undefined;
    }

    get relativePath(): string {
        return (this.parentDirectoryNode === undefined) ? this.name : this.parentDirectoryNode.relativePath + "/" + this.name;
    }
}

export class TreeDiffResult {
    created: Node[];
    deleted: Node[];
    modified: FileNode[];

    constructor() {
        this.created = [];
        this.deleted = [];
        this.modified = [];
    }

    addCreated(...nodes: Node[]): void {
        this.created = this.created.concat(nodes);
    }

    addDeleted(...nodes: Node[]): void {
        this.deleted = this.deleted.concat(nodes);
    }

    addModified(...nodes: FileNode[]): void {
        this.modified = this.modified.concat(nodes);
    }
}
