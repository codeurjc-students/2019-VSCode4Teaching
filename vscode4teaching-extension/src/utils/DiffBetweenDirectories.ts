import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

type BasicNode = {
    fileName: string;
    children: BasicNode[];
}

type MergedTreeNode = {
    value: string;
    children: MergedTreeNode[];
    originalNodes: {
        left?: BasicNode,
        right?: BasicNode
    };
    source: -1 | 0 | 1;
}

class QuickPickTreeNode implements vscode.QuickPickItem {
    constructor(
        public label: string,
        public children: QuickPickTreeNode[],
        public source: -1 | 0 | 1,
        public relativePath: string,
        public parent?: QuickPickTreeNode,

        public kind?: vscode.QuickPickItemKind,
        public description?: string,
        public detail?: string,
        public picked?: boolean,
        public alwaysShow?: boolean,
        public buttons?: vscode.QuickInputButton[],
    ) { }
}

export class DiffBetweenDirectories {

    /**
     * Method used to recursively traverse a directory, looking for all the files included.
     * In addition, the contents of each directory filtered.
     * 
     * Due to implementation, it is known that children arrays will be alphabetically sorted.
     * 
     * @param absolutePath Absolute path to the directory (grows when entering in recursive calls)
     * @param regexFilters (Optional) Regular expressions used to filter and eliminate the desired results of the directory scan.
     * @returns Tree-shaped structure (nodes with parent and children) representing the contents of the directory provided.
     */
    public static deepFilteredDirectoryTraversal = (absolutePath: string, regexFilters?: RegExp[]): BasicNode => {
        // Scan contents of provided directory
        let directoryContents: fs.Dirent[] = fs.readdirSync(absolutePath, { withFileTypes: true });
        // Regex filters applied (if included) to the results of the previous scanning process
        if (regexFilters) directoryContents = directoryContents.filter(elem => regexFilters.every(regex => !regex.test(elem.name)));

        const nodeList: BasicNode[] = [];
        directoryContents.forEach(child => {
            nodeList.push(
                (fs.statSync(path.join(absolutePath, child.name)).isDirectory())
                    // Recursive case: directories have to be recursively scanned in depth
                    ? DiffBetweenDirectories.deepFilteredDirectoryTraversal(path.join(absolutePath, child.name), regexFilters)
                    // Base case: node is a file, so it does not have associated children
                    : { fileName: child.name, children: [] }
            );
        });

        // File name is obtained from the absolute path
        // (the last part of the name after dividing the path by the defined path separator)
        const fileName = absolutePath.split(path.sep).slice(-1)[0];

        // Node is returned (made by its file name and the node list associated to its contents)
        return { fileName, children: nodeList };
    }

    /**
     * Algorithm that combines two trees of directories and files obtained by the {@link deepFilteredDirectoryTraversal()} method.
     * 
     * It introduces in each of them a source attribute:
     * -1 if the file exists only on the left.
     *  1 if the file exists only on the right.
     *  0 if it exists in both trees.
     * 
     * It also keeps the pointers to the nodes of the original trees.
     * 
     * @param leftTree Left tree.
     * @param rightTree Right tree.
     * @returns Merged tree root.
     */
    public static mergeDirectoryTrees = (leftTree: BasicNode, rightTree: BasicNode): MergedTreeNode => {
        // New node is generated with default values: name of file, empty list of children, source 0 and pointers to original nodes
        const newMergedTreeNode: MergedTreeNode = {
            value: leftTree.fileName,
            children: [],
            source: 0,
            originalNodes: { left: leftTree, right: rightTree }
        };

        // The nodes associated with the children of both the left tree and the right tree are converted to the node type of the combined tree
        // The necessary provenance is entered (-1 for those coming from the left, 1 for those coming from the right) and the pointers to the original nodes are stored
        const leftTreeChildren = leftTree.children.map<MergedTreeNode>(elem => ({ value: elem.fileName, source: -1, children: [], originalNodes: { left: elem } }));
        const rightTreeChildren = rightTree.children.map<MergedTreeNode>(elem => ({ value: elem.fileName, source: 1, children: [], originalNodes: { right: elem } }));

        // Both lists are traversed with incrementing numeric iterates until both are fully explored
        let i = 0; // Iterator for the position of the elements in the list leftTreeChildren
        let j = 0; // Iterator for the position of the elements in the list rightTreeChildren
        while (i < leftTreeChildren.length || j < rightTreeChildren.length) {
            // If elements still exist in both lists and a match is found between them, a new common element has been found.
            if (i < leftTreeChildren.length && j < rightTreeChildren.length && leftTreeChildren[i].value === rightTreeChildren[j].value) {
                // A new child of the explored node common to both trees is generated (it will have source 0)
                const newChild: MergedTreeNode = {
                    value: leftTreeChildren[i].value,
                    children: leftTreeChildren[i].children,
                    source: 0,
                    originalNodes: {
                        left: leftTreeChildren[i].originalNodes.left,
                        right: rightTreeChildren[j].originalNodes.right
                    }
                }
                newMergedTreeNode.children.push(newChild);

                // Exploration continues on both lists
                i++;
                j++;
            }
            // The item pointed to in both lists is not the same
            else {
                // There are no more children left to explore from the left tree
                if (i >= leftTreeChildren.length) {
                    // The exploration continues in the list of children coming from the right tree
                    newMergedTreeNode.children.push(rightTreeChildren[j]);
                    j++;
                }
                // There are no more children left to explore from the right tree  
                else if (j >= rightTreeChildren.length) {
                    // The exploration continues in the list of children coming from the left tree
                    newMergedTreeNode.children.push(leftTreeChildren[i]);
                    i++;
                }
                // There are still items to be scanned in both lists of children nodes
                else {
                    // The values are compared and it is determined which one should be entered first to preserve order
                    // The item on the left must be entered first
                    if (leftTreeChildren[i].value.localeCompare(rightTreeChildren[j].value) < 0) {
                        newMergedTreeNode.children.push(leftTreeChildren[i]);
                        i++;
                    }
                    // The item on the right must be entered first
                    else {
                        newMergedTreeNode.children.push(rightTreeChildren[j]);
                        j++;
                    }
                }
            }
        }

        // For children with common provenance to both trees, it is necessary to recursively call the function to continue exploring towards their descendants
        newMergedTreeNode.children.forEach(child => {
            // Recursive case: this child is of common descent and has descendants on both sides
            // The children of this child are reanalyzed with the algorithm described above
            if (child.source === 0 && child.originalNodes.left !== undefined && child.originalNodes.right !== undefined)
                child.children = DiffBetweenDirectories.mergeDirectoryTrees(child.originalNodes.left, child.originalNodes.right).children;

            // Base case: this child comes from a single tree or has no descendants from both trees
            // The children of this child are automatically assigned the given provenance and all its children are copied recursively with the same source
            else
                child.children = DiffBetweenDirectories.deepCopyWithSource(child).children;
        });

        // Analysis is finished and merged tree node is returned with its attributes completely fulfilled
        return newMergedTreeNode;
    }

    /**
     * mergedTreeToQuickPickTree()
     * 
     * Method applied to convert the previously generated tree (with {@link mergeDirectoryTrees()}) to a tree with nodes prepared for vscode.QuickPick (to interact with user).
     * 
     * Returns a tree structure with the same content as the merged tree but made of {@link QuickPickTreeNode} instances which are ready to be displayed in the Quick Pick
     * that will be shown to the user to choose the file from which he or she wants to view diff.
     * 
     * @param mergedTreeNodeRoot Merged tree root node.
     * @param relativePath Relative path.
     * @param parent (Optional) Parent of current node. Undefined only at root.
     * @returns Pointer to root of new Quick Pick tree.
     */
    public static mergedTreeToQuickPickTree = (mergedTreeNodeRoot: MergedTreeNode, relativePath: string, parent?: QuickPickTreeNode): QuickPickTreeNode => {
        // A new Quick Pick node is generated, including required info to show Quick Pick item (label), to locate node in tree (parent, children and source) and to locate file in filesystem (relativePath).
        const newQuickPickTreeNode: QuickPickTreeNode = {
            label: mergedTreeNodeRoot.value,
            children: [],
            source: mergedTreeNodeRoot.source,
            relativePath,
            parent
        };

        // Children nodes are generated
        for (const child of mergedTreeNodeRoot.children) {
            // Label includes a icon (either a folder or a file) depending on whether it has children or not
            let label = `$(${(child.children.length > 0) ? "folder" : "file"}) ${child.value}`;

            // Description shows user the source of the Quick Pick item
            let description;
            if (child.source === -1)
                description = "Only available in left folder";
            else if (child.source === 0)
                description = "Available in both left and right folder";
            else
                description = "Only available in right folder";

            // With the information obtained, the new node is formed and a recursive call is introduced to continue investigating the successive descendants
            newQuickPickTreeNode.children.push({
                label,
                source: child.source,
                description,
                parent: newQuickPickTreeNode,
                children: DiffBetweenDirectories.mergedTreeToQuickPickTree(child, path.join(relativePath, child.value), newQuickPickTreeNode).children,
                relativePath: path.join(relativePath, child.value)
            });
        }

        // Analysis is finished and merged tree node is returned with its attributes completely fulfilled
        return newQuickPickTreeNode;
    }


    /**
     * Given a Quick Pick item tree, the user is asked which file to open
     * 
     * This implementation allows the user to browse through the different directories available and shows the origin of each node through the appearance of successive VSCode Quick Pick windows
     *  
     * @param quickPickTreeNode Quick Pick tree root node
     * @returns Object with information about user's selection
     */
    public static directorySelectionQuickPick = async (quickPickTreeNode: QuickPickTreeNode): Promise<{ relativePath: string, source: -1 | 0 | 1 } | undefined> => {
        // If current level of children have a parent, a "Jump to parent" item has to be shown
        const elementList: QuickPickTreeNode[] = (quickPickTreeNode.parent)
            ? [
                // This item will allow users to go back to the parent level of currently shown children level.
                // Note: Both this item and separator include compulsory parameters relativePath, children and source, but they three are ignored.
                { label: "$(panel-maximize) Jump to parent", children: [], parent: quickPickTreeNode.parent, relativePath: "", source: 0 },
                { label: "", children: [], kind: vscode.QuickPickItemKind.Separator, relativePath: "", source: 0 },
                ...quickPickTreeNode.children
            ]
            : quickPickTreeNode.children;

        // Quick Pick element is shown and algorithm waits until user picks up an element
        const userSelection = await vscode.window.showQuickPick(elementList, {
            title: "Choose a file or navigate to another directory",
            ignoreFocusOut: false
        });

        if (userSelection) {
            // If user selection is a directory (it has children), another Quick Pick is shown with same information about its children
            if (userSelection.children.length > 0) {
                return await DiffBetweenDirectories.directorySelectionQuickPick(userSelection);
            }
            // If user has chosen to return to the parent, a Quick Pick with the information related to the parent node and its siblings will be shown instead
            else if (userSelection.label === "$(panel-maximize) Jump to parent" && quickPickTreeNode.parent) {
                return await DiffBetweenDirectories.directorySelectionQuickPick(quickPickTreeNode.parent);
            }
            // Otherwise (user selected a specific file), information about selected node is returned
            else {
                return { relativePath: userSelection.relativePath, source: userSelection.source };
            }
        } else {
            return undefined;
        }
    }

    /**
     * Private method used in {@link mergeDirectoryTrees()} to generate new nodes recursively with the desired source and source nodes.
     * It implements the base case for the mentioned algorithm.
     * 
     * @param node Root node to transform. 
     * @returns Root node transformed (with children recursively transformed).
     */
    private static deepCopyWithSource = (node: MergedTreeNode): MergedTreeNode => {
        // A new node is generated with the value of the relative path obtained, an initially empty list of children and the origin and the original nodes as they come from the original node
        const newMergedTreeNode: MergedTreeNode = {
            value: node.value,
            children: [],
            source: node.source,
            originalNodes: node.originalNodes
        };

        // If the original node has children on the left and the origin of the node is the left tree, this method is applied recursively to all the children to include them.
        if (node.originalNodes.left !== undefined && node.source === -1) {
            node.originalNodes.left.children.forEach(child =>
                newMergedTreeNode.children.push(DiffBetweenDirectories.deepCopyWithSource({ value: child.fileName, children: [], source: node.source, originalNodes: { left: child } }))
            );
        }

        // If the original node has children on the right and the origin of the node is the right tree, this method is applied recursively to all the children to include them.
        if (node.originalNodes.right !== undefined && node.source === 1) {
            node.originalNodes.right.children.forEach(child =>
                newMergedTreeNode.children.push(DiffBetweenDirectories.deepCopyWithSource({ value: child.fileName, children: [], source: node.source, originalNodes: { right: child } }))
            );
        }

        // Merged tree node is returned with its attributes completely fulfilled
        return newMergedTreeNode;
    };
}