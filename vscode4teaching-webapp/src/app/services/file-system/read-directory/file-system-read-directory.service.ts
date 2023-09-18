import { Injectable } from '@angular/core';
import { supported } from "browser-fs-access";
import { DirectoryNode, FileNode, Node, TreeDiffResult } from "../../../model/file-system/file-system.model";

/**
 * File System service
 *
 * This service includes two wrappers of File System API / browser-fs-access functionality to allow browser to read contents from a directory.
 * Attending to File System API support (that can be checked using fileSystemAPISupported() method), either a method or another should be used.
 */
@Injectable({
    providedIn: 'root'
})
export class FileSystemReadDirectoryService {

    constructor() {
    }

    public fileSystemAccessAPISupported(): boolean {
        return supported && window.hasOwnProperty("showDirectoryPicker");
    }

    /**
     * Returns a DirectoryNode-based tree representing the file-and-directory structure included in directory represented by rootDirectoryHandle,
     * recursively including contents of nested directories and introducing information about files.
     *
     * Requires File System Access API to work (only File System Access API can obtain a FileSystemDirectoryHandle from user directory selection in UI).
     *
     * @param rootDirectoryHandle File System Directory Handle pointing to root (picked by user in UI at first time)
     * @param parentDirectoryNode DirectoryNode representing {@link rootDirectoryHandle}
     * @return Promise (on fulfilled includes a DirectoryNode-based tree)
     */
    public async supportedFileSystemAPI(rootDirectoryHandle: FileSystemDirectoryHandle, parentDirectoryNode?: DirectoryNode): Promise<DirectoryNode | undefined> {
        // Step 1: DirectoryNode representing current rootDirectoryHandle is initialized
        const childrenNodesList: Node[] = [];
        const directoryNode: DirectoryNode = new DirectoryNode(rootDirectoryHandle.name, childrenNodesList, parentDirectoryNode);

        // Step 2: existing entries (both files and directories) in current directory are analyzed
        for await (const entry of rootDirectoryHandle.values()) {
            // Entries can be either FileSystemFileHandle or FileSystemDirectoryHandle

            // Base case: entry is a file.
            // Browser asks for information about it and a new FileNode is generated and fulfilled.
            if (entry instanceof FileSystemFileHandle && entry.kind === "file") {
                let fileInformation = await entry.getFile();
                childrenNodesList.push(new FileNode(entry.name, fileInformation.lastModified, fileInformation, directoryNode));
            }

            // Recursive case: entry is a directory.
            // This algorithm is self-called again for subdirectory handle and its own information is appended to tree as a DirectoryNode
            if (entry instanceof FileSystemDirectoryHandle && entry.kind === "directory") {
                const subdirectoryInformation = await this.supportedFileSystemAPI(entry, directoryNode);
                if (subdirectoryInformation !== undefined) childrenNodesList.push(subdirectoryInformation);
            }
        }

        // Step 3: children nodes list is sorted (for compatibility with notSupportedFileSystemAPI and tree comparison algorithms)
        directoryNode.children = directoryNode.children.sort((x, y) => x.name.localeCompare(y.name));

        return directoryNode;
    }


    /**
     * Returns a DirectoryNode-based tree representing the file-and-directory structure included in directory picked by user in UI,
     * recursively including contents of nested directories and introducing information about files.
     *
     * This method does not require File System Access API to work, but it is recommended to use it only when File System Access API is not supported
     * (since this method is more complex in time and memory).
     *
     * @deprecated Use API only on available browsers.
     *
     * @param recursiveFileList Bulk recursive file list (including all files of picked directory and subdirectories flattened)
     * @return DirectoryNode-based tree
     */
    public notSupportedFileSystemAPI(recursiveFileList: File[]): DirectoryNode | undefined {
        // Precondition: if array is empty no information can be generated
        if (recursiveFileList.length === 0) return undefined;

        // Step 1: DirectoryNode representing current rootDirectoryHandle is initialized
        const rootDirectoryNode = new DirectoryNode(recursiveFileList[0].webkitRelativePath.split(/\/|\\/)[0], []);

        // Step 2: file list including entries from all subdirectories is traversed
        for (const handler of recursiveFileList) {
            // File instances normally include a relative path when directory is iterated
            // If it did not come, information could not be returned (since relative path is necessary to know precise file/directory location)
            if (!handler.webkitRelativePath || handler.webkitRelativePath === "") return undefined;

            // Recursive algorithm starts
            this.notSupportedRecursiveAlgorithm(handler, rootDirectoryNode);
        }

        return rootDirectoryNode;
    }

    /** @deprecated */
    private notSupportedRecursiveAlgorithm(file: File, directoryNode: DirectoryNode, relativePath?: string[]) {
        // Step 1: path parameter (an array including every part of relative path of current file) is generated
        // It can come either from method call (relativePath, when recursive calls are instantiated for subdirectories' contents)
        // or from file object relative path parameter (that has to exist because it was checked before calling this algorithm)
        let pathParameter = relativePath ?? file.webkitRelativePath.split(/\/|\\/).slice(1);

        // Base case: path parameter includes only one string (file name).
        // This file belongs to current directoryNode, it is registered and analysis has finished
        if (pathParameter.length === 1) {
            directoryNode.children.push(new FileNode(pathParameter[0], file.lastModified, file, directoryNode));

            // Children nodes list is sorted (for compatibility with supportedFileSystemAPI and tree comparison algorithms)
            directoryNode.children = directoryNode.children.sort((x, y) => x.name.localeCompare(y.name));
        }
        // Recursive case: path parameter includes N strings (N-1 directories' names and a file name)
        // This file is allocated in other directory that can either exist from previous iterations or not
        else {
            const filteredChildrenList = directoryNode.children.filter(hijo => hijo.name === pathParameter[0]);

            // Case 1: the first directory of the relative path is already registered in the list of children
            // of the current DirectoryNode, so the insertion is continued recursively
            if (filteredChildrenList.length === 1) {
                this.notSupportedRecursiveAlgorithm(file, filteredChildrenList[0] as DirectoryNode, pathParameter.slice(1));
            }
            // Case 2: the first directory of the relative path is not yet registered,
            // so a new entry is generated in the node list and the insertion is continued recursively
            else {
                const newSubdirectoryNode = new DirectoryNode(pathParameter[0], [], directoryNode);

                // Children nodes list is sorted (for compatibility with supportedFileSystemAPI and tree comparison algorithms)
                directoryNode.children.push(newSubdirectoryNode);
                directoryNode.children = directoryNode.children.sort((x, y) => x.name.localeCompare(y.name));

                this.notSupportedRecursiveAlgorithm(file, newSubdirectoryNode, pathParameter.slice(1));
            }
        }
    }

    /**
     * Algorithm that, given two DirectoryNode, examines their lists of child nodes recursively and returns
     * lists of created, deleted and modified files between the old and the new one.
     *
     * @param oldDirectoryNode Old DirectoryNode
     * @param newDirectoryNode New DirectoryNode
     */
    public directoryNodeFilesDiff(oldDirectoryNode: DirectoryNode, newDirectoryNode: DirectoryNode): TreeDiffResult {
        let treeDiffResult: TreeDiffResult = new TreeDiffResult();
        // Both lists are traversed with incrementing numeric iterators until both are fully explored
        // Note that a specific element can be in a different position in both lists
        let o: number = 0;
        let n: number = 0;
        while (o < oldDirectoryNode.children.length || n < newDirectoryNode.children.length) {
            // Case 1: there are remaining elements in both children lists and currently explored in both lists have the same name
            if (o < oldDirectoryNode.children.length && n < newDirectoryNode.children.length
                && oldDirectoryNode.children[o].name === newDirectoryNode.children[n].name) {
                // Case 1.1: both elements have same name and both are files
                if (oldDirectoryNode.children[o] instanceof FileNode && newDirectoryNode.children[n] instanceof FileNode) {
                    const oldFileNode = oldDirectoryNode.children[o] as FileNode;
                    const newFileNode = newDirectoryNode.children[n] as FileNode;

                    // If modification time is different (newer document includes a later one), file has been modified
                    if (oldFileNode.lastModifiedTime < newFileNode.lastModifiedTime)
                        treeDiffResult.addModified(newFileNode);
                }
                // Case 1.2: both elements have same name and both are directories
                // Files included in directories are recursively inspected
                else if (oldDirectoryNode.children[o] instanceof DirectoryNode && newDirectoryNode.children[n] instanceof DirectoryNode) {
                    const directorySubtreeResult = this.directoryNodeFilesDiff(<DirectoryNode>oldDirectoryNode.children[o], <DirectoryNode>newDirectoryNode.children[n]);
                    treeDiffResult.addCreated(...directorySubtreeResult.created);
                    treeDiffResult.addDeleted(...directorySubtreeResult.deleted);
                    treeDiffResult.addModified(...directorySubtreeResult.modified);
                }
                // Case 1.3: an element is a file and other one is a directory
                // It is considered as two different actions: deletion of old and creation of new
                else {
                    treeDiffResult.addDeleted(oldDirectoryNode.children[o]);
                    treeDiffResult.addCreated(newDirectoryNode.children[n]);
                }

                o++;
                n++;
            }
            // Case 2: the item pointed to in both lists is not the same or there are no more remaining elements in one of the lists
            else {
                // Case 2.1: there are no more unexplored children in old DirectoryNode's children list
                // All remanining children in new DirectoryNode's list are included as created elements
                if (o >= oldDirectoryNode.children.length) {
                    treeDiffResult.addCreated(newDirectoryNode.children[n]);
                    n++;
                }
                // Case 2.2: there are no more unexplored children in new DirectoryNode's children list
                // All remanining children in old DirectoryNode's list are included as deleted elements
                else if (n >= newDirectoryNode.children.length) {
                    treeDiffResult.addDeleted(oldDirectoryNode.children[o]);
                    o++;
                }
                // Case 2.3: there are unscanned items in both lists but the currently selected items do not have the same name
                // Any of the currently selected items could fit with another yet unexplored item, so it is necessary to "break the tie" using a strategy based on alphabetical order (since the entries are sorted alphabetically)
                else {
                    if (oldDirectoryNode.children[o].name.localeCompare(newDirectoryNode.children[n].name) > 0) {
                        treeDiffResult.addCreated(newDirectoryNode.children[n]);
                        n++;
                    } else {
                        treeDiffResult.addDeleted(oldDirectoryNode.children[o]);
                        o++;
                    }
                }
            }
        }

        // Analysis is finished and tree diff result is returned
        return treeDiffResult;
    }
}
