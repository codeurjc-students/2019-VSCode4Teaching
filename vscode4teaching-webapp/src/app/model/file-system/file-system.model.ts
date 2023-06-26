/**
 * File system model.
 *
 * The local file system can be represented as an N-ary tree of nodes. These nodes can be of two types:
 * - Files ({@link FileNode}). They are always leaf nodes and always have at least one ancestor node of type directory.
 * - Directories ({@link DirectoryNode}). They do not have to have ancestor nodes (they can be root), and contain from 0 to N file or directory nodes.
 */

/**
 * Node interface.
 *
 * All nodes, whether files or directories, have a name and can have a parent node (which is always a {@link DirectoryNode}).
 */
export interface Node {
    name: string;
    parentDirectoryNode?: DirectoryNode;

    get relativePath(): string;
}


/**
 * Class to represent file type nodes.
 *
 * In addition to the name and its parent directory (which is mandatory in this case), the last modification date and the Blob representing the file content are added.
 */
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


/**
 * Class to represent directory type nodes.
 *
 * In addition to the name and its parent directory (which is mandatory in this case), a list of child nodes (which can be files or other directories) is stored.
 */
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
        return (this.parentDirectoryNode === undefined) ? "" : this.parentDirectoryNode.relativePath + "/" + this.name;
    }

    /** Method that returns, given a directory node, all the {@link FileNode} that it contains;
     *  i.e., it traverses the boundary of the tree that represents the directory. */
    public getAllFileNodes(): FileNode[] {
        const output: FileNode[] = [];
        for (let child of this.children) {
            // Base case: node is a file
            if (child instanceof FileNode) {
                output.push(child);
            }
            // Recursive case: node is a directory
            else if (child instanceof DirectoryNode) {
                output.push(...child.getAllFileNodes());
            }
        }
        return output;
    }
}


/**
 * Class to represent the comparison between two tree structures of the file system
 * as a 3-tuple of new files or directories, deleted files or directories and modified files.
 */
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
