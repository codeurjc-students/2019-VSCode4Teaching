import * as fs from "fs";
import { mocked } from "ts-jest/utils";
import { BasicNode, DiffBetweenDirectories, MergedTreeNode, QuickPickTreeNode } from "../../src/utils/DiffBetweenDirectories";
import { mockFsDirent, mockFsStatus } from "./__mocks__/mockFsUtils";

jest.mock("fs");
const mockedFs = mocked(fs, true);

describe("Diff between directories Utilities", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Definiciones de datos iniciales
    /**
     * Tree 1: BasicNode example tree
     * Graphic representation:
     * 
     * A         
     * ├─ B      
     * │  ├─ F   
     * │  ├─ G   
     * │  ├─ H   
     * ├─ C      
     * │  ├─ I   
     * ├─ D      
     * ├─ E      
     * │  ├─ J   
     * │  │  ├─ L
     * │  │  ├─ M
     * │  ├─ K   
     * │  │  ├─ N
     */
    // Level 4 nodes
    const tree1NodeL: BasicNode = { fileName: "L", children: [] };
    const tree1NodeM: BasicNode = { fileName: "M", children: [] };
    const tree1NodeN: BasicNode = { fileName: "N", children: [] };
    // Level 3 nodes
    const tree1NodeF: BasicNode = { fileName: "F", children: [] };
    const tree1NodeG: BasicNode = { fileName: "G", children: [] };
    const tree1NodeH: BasicNode = { fileName: "H", children: [] };
    const tree1NodeI: BasicNode = { fileName: "I", children: [] };
    const tree1NodeJ: BasicNode = { fileName: "J", children: [tree1NodeL, tree1NodeM] };
    const tree1NodeK: BasicNode = { fileName: "K", children: [tree1NodeN] };
    // Level 2 nodes
    const tree1NodeB: BasicNode = { fileName: "B", children: [tree1NodeF, tree1NodeG, tree1NodeH] };
    const tree1NodeC: BasicNode = { fileName: "C", children: [tree1NodeI] };
    const tree1NodeD: BasicNode = { fileName: "D", children: [] };
    const tree1NodeE: BasicNode = { fileName: "E", children: [tree1NodeJ, tree1NodeK] };
    // Level 1: root node
    const tree1RootNode: BasicNode = { fileName: "A", children: [tree1NodeB, tree1NodeC, tree1NodeD, tree1NodeE] };

    /**
     * Tree 2: BasicNode example tree
     * Graphic representation:
     * 
     * Z
     * ├─ B
     * │  ├─ G
     * │  ├─ H
     * │  ├─ T
     * ├─ C
     * │  ├─ I
     * ├─ E
     * │  ├─ K
     * │  │  ├─ N
     * ├─ X
     * │  ├─ S
     * │  │  ├─ R
     * ├─ Y
     * │  ├─ U
     * │  ├─ V
     * │  ├─ W
     */
    // Level 4 nodes
    const tree2NodeN: BasicNode = { fileName: "N", children: [] };
    const tree2NodeR: BasicNode = { fileName: "R", children: [] };
    // Level 3 nodes
    const tree2NodeG: BasicNode = { fileName: "G", children: [] };
    const tree2NodeH: BasicNode = { fileName: "H", children: [] };
    const tree2NodeT: BasicNode = { fileName: "T", children: [] };
    const tree2NodeI: BasicNode = { fileName: "I", children: [] };
    const tree2NodeK: BasicNode = { fileName: "K", children: [tree2NodeN] };
    const tree2NodeS: BasicNode = { fileName: "S", children: [tree2NodeR] };
    const tree2NodeU: BasicNode = { fileName: "U", children: [] };
    const tree2NodeV: BasicNode = { fileName: "V", children: [] };
    const tree2NodeW: BasicNode = { fileName: "W", children: [] };
    // Level 2 nodes
    const tree2NodeB: BasicNode = { fileName: "B", children: [tree2NodeG, tree2NodeH, tree2NodeT] };
    const tree2NodeC: BasicNode = { fileName: "C", children: [tree2NodeI] };
    const tree2NodeE: BasicNode = { fileName: "E", children: [tree2NodeK] };
    const tree2NodeX: BasicNode = { fileName: "X", children: [tree2NodeS] };
    const tree2NodeY: BasicNode = { fileName: "Y", children: [tree2NodeU, tree2NodeV, tree2NodeW] };
    // Level 1: root node
    const tree2RootNode: BasicNode = { fileName: "Z", children: [tree2NodeB, tree2NodeC, tree2NodeE, tree2NodeX, tree2NodeY] };

    /**
     * Tree 3: MergedTreeNode example tree (result of merging tree 1 as left and tree 2 as right)
     * Graphic representation (with sources in parentheses):
     * 
     * A (0)
     * ├─ B (0)
     * │  ├─ F (-1)
     * │  ├─ G (0)
     * │  ├─ H (0)
     * │  ├─ T (1)
     * ├─ C (0)
     * │  ├─ I (0)
     * ├─ D (-1)
     * ├─ E (0)
     * │  ├─ J (-1)
     * │  │  ├─ L (-1)
     * │  │  ├─ M (-1)
     * │  ├─ K (0)
     * │  │  ├─ N (0)
     * ├─ X (1)
     * │  ├─ S (1)
     * │  │  ├─ R (1)
     * ├─ Y (1)
     * │  ├─ U (1)
     * │  ├─ V (1)
     * │  ├─ W (1)
     */
    // Level 4 nodes
    const tree3NodeL: MergedTreeNode = { value: "L", source: -1, children: [], originalNodes: { left: tree1NodeL } };
    const tree3NodeM: MergedTreeNode = { value: "M", source: -1, children: [], originalNodes: { left: tree1NodeM } };
    const tree3NodeN: MergedTreeNode = { value: "N", source: 0, children: [], originalNodes: { left: tree1NodeN, right: tree2NodeN } };
    const tree3NodeR: MergedTreeNode = { value: "R", source: 1, children: [], originalNodes: { right: tree2NodeR } };
    // Level 3 nodes
    const tree3NodeF: MergedTreeNode = { value: "F", source: -1, children: [], originalNodes: { left: tree1NodeF } };
    const tree3NodeG: MergedTreeNode = { value: "G", source: 0, children: [], originalNodes: { left: tree1NodeG, right: tree2NodeG } };
    const tree3NodeH: MergedTreeNode = { value: "H", source: 0, children: [], originalNodes: { left: tree1NodeH, right: tree2NodeH } };
    const tree3NodeT: MergedTreeNode = { value: "T", source: 1, children: [], originalNodes: { right: tree2NodeT } };
    const tree3NodeI: MergedTreeNode = { value: "I", source: 0, children: [], originalNodes: { left: tree1NodeI, right: tree2NodeI } };
    const tree3NodeJ: MergedTreeNode = { value: "J", source: -1, children: [tree3NodeL, tree3NodeM], originalNodes: { left: tree1NodeJ } };
    const tree3NodeK: MergedTreeNode = { value: "K", source: 0, children: [tree3NodeN], originalNodes: { left: tree1NodeK, right: tree2NodeK } };
    const tree3NodeS: MergedTreeNode = { value: "S", source: 1, children: [tree3NodeR], originalNodes: { right: tree2NodeS } };
    const tree3NodeU: MergedTreeNode = { value: "U", source: 1, children: [], originalNodes: { right: tree2NodeU } };
    const tree3NodeV: MergedTreeNode = { value: "V", source: 1, children: [], originalNodes: { right: tree2NodeV } };
    const tree3NodeW: MergedTreeNode = { value: "W", source: 1, children: [], originalNodes: { right: tree2NodeW } };
    // Level 2 nodes
    const tree3NodeB: MergedTreeNode = { value: "B", source: 0, children: [tree3NodeF, tree3NodeG, tree3NodeH, tree3NodeT], originalNodes: { left: tree1NodeB, right: tree2NodeB } };
    const tree3NodeC: MergedTreeNode = { value: "C", source: 0, children: [tree3NodeI], originalNodes: { left: tree1NodeC, right: tree2NodeC } };
    const tree3NodeD: MergedTreeNode = { value: "D", source: -1, children: [], originalNodes: { left: tree1NodeD } };
    const tree3NodeE: MergedTreeNode = { value: "E", source: 0, children: [tree3NodeJ, tree3NodeK], originalNodes: { left: tree1NodeE, right: tree2NodeE } };
    const tree3NodeX: MergedTreeNode = { value: "X", source: 1, children: [tree3NodeS], originalNodes: { right: tree2NodeX } };
    const tree3NodeY: MergedTreeNode = { value: "Y", source: 1, children: [tree3NodeU, tree3NodeV, tree3NodeW], originalNodes: { right: tree2NodeY } };
    // Level 1: root node
    const tree3RootNode: MergedTreeNode = { value: "A", source: 0, children: [tree3NodeB, tree3NodeC, tree3NodeD, tree3NodeE, tree3NodeX, tree3NodeY], originalNodes: { left: tree1RootNode, right: tree2RootNode } }

    it("should deeply traverse a directory (recursively) and return a tree", () => {
        /**
         * A directory structure is simulated as shown below:
         * A
         * ├─ B
         * │  ├─ F
         * ├─ C
         * │  ├─ G
         * │  │  ├─ J
         * │  │  ├─ K
         * │  ├─ H
         * ├─ D
         * ├─ E
         * │  ├─ I
         * │  │  ├─ L
         * ├─ M <- (filtered using regex)
         */
        const expectedResult: BasicNode = {
            fileName: "A",
            children: [
                {
                    fileName: "B",
                    children: [
                        {
                            fileName: "F",
                            children: []
                        }
                    ]
                },
                {
                    fileName: "C",
                    children: [
                        {
                            fileName: "G",
                            children: [
                                {
                                    fileName: "J",
                                    children: []
                                },
                                {
                                    fileName: "K",
                                    children: []
                                },
                            ]
                        },
                        {
                            fileName: "H",
                            children: []
                        },
                    ]
                },
                {
                    fileName: "D",
                    children: []
                },
                {
                    fileName: "E",
                    children: [
                        {
                            fileName: "I",
                            children: [
                                {
                                    fileName: "L",
                                    children: []
                                },
                            ]
                        },
                    ]
                }
            ]
        };

        // Calls to fs library methods must be mocked according to the parameters that they receive
        // For this purpose, implementations for readdirSync() and statSync() are being replaced as follows:
        mockedFs.readdirSync.mockImplementation((absolutePath, _) => {
            if (absolutePath === "A")
                return [
                    { name: "B", isDirectory: true },
                    { name: "C", isDirectory: true },
                    { name: "D", isDirectory: false },
                    { name: "E", isDirectory: true },
                    { name: "M", isDirectory: false }
                ].map(elem => mockFsDirent(elem.name, elem.isDirectory));
            else if (absolutePath === "A/B")
                return [mockFsDirent("F", false)];
            else if (absolutePath === "A/C")
                return [
                    { name: "G", isDirectory: true },
                    { name: "H", isDirectory: false }
                ].map(elem => mockFsDirent(elem.name, elem.isDirectory));
            else if (absolutePath === "A/C/G")
                return [
                    { name: "J", isDirectory: false },
                    { name: "K", isDirectory: false }
                ].map(elem => mockFsDirent(elem.name, elem.isDirectory));
            else if (absolutePath === "A/E")
                return [mockFsDirent("I", true)];
            else if (absolutePath === "A/E/I")
                return [mockFsDirent("L", false)];
            else return [];
        });

        mockedFs.statSync.mockImplementation((path) => {
            return mockFsStatus([
                "A",
                "A/B",
                "A/C",
                "A/C/G",
                "A/E",
                "A/E/I"
            ].some(elem => elem === path));
        });


        // The method to be tested is called
        // Absolute path is root directory of simulated file structure and "M" is going to be filtered
        const actualResult = DiffBetweenDirectories.deepFilteredDirectoryTraversal("A", [/M/]);


        expect(mockedFs.readdirSync).toHaveBeenCalledTimes(6);
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(1, "A", { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(2, "A/B", { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(3, "A/C", { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(4, "A/C/G", { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(5, "A/E", { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(6, "A/E/I", { withFileTypes: true });

        expect(mockedFs.statSync).toHaveBeenCalledTimes(11);
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(1, "A/B");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(2, "A/B/F");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(3, "A/C");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(4, "A/C/G");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(5, "A/C/G/J");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(6, "A/C/G/K");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(7, "A/C/H");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(8, "A/D");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(9, "A/E");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(10, "A/E/I");
        expect(mockedFs.statSync).toHaveBeenNthCalledWith(11, "A/E/I/L");

        expect(actualResult).toStrictEqual(expectedResult);
    });

    it("should correctly merge two trees (case 1)", () => {
        // Trees 1 and 2 are going to be merged
        // This test takes tree 1 as left one and tree 2 as right one

        // The method to be tested is called
        const actualResult = DiffBetweenDirectories.mergeDirectoryTrees(tree1RootNode, tree2RootNode);


        // Expected result is tree 3
        expect(actualResult).toStrictEqual(tree3RootNode);
    });

    it("should correctly merge two trees (case 2)", () => {
        // Trees 1 and 2 are going to be merged
        // This test takes tree 2 as left one and tree 3 as right one

        // Expected result is tree 3 changing the sign of sources and originalNodes (left by right and vice versa)
        // Level 4 nodes
        const tree3InverseNodeL = { value: "L", source: 1, children: [], originalNodes: { right: tree1NodeL } };
        const tree3InverseNodeM = { value: "M", source: 1, children: [], originalNodes: { right: tree1NodeM } };
        const tree3InverseNodeN = { value: "N", source: 0, children: [], originalNodes: { right: tree1NodeN, left: tree2NodeN } };
        const tree3InverseNodeR = { value: "R", source: -1, children: [], originalNodes: { left: tree2NodeR } };
        // Level 3 nodes
        const tree3InverseNodeF = { value: "F", source: 1, children: [], originalNodes: { right: tree1NodeF } };
        const tree3InverseNodeG = { value: "G", source: 0, children: [], originalNodes: { right: tree1NodeG, left: tree2NodeG } };
        const tree3InverseNodeH = { value: "H", source: 0, children: [], originalNodes: { right: tree1NodeH, left: tree2NodeH } };
        const tree3InverseNodeT = { value: "T", source: -1, children: [], originalNodes: { left: tree2NodeT } };
        const tree3InverseNodeI = { value: "I", source: 0, children: [], originalNodes: { right: tree1NodeI, left: tree2NodeI } };
        const tree3InverseNodeJ = { value: "J", source: 1, children: [tree3InverseNodeL, tree3InverseNodeM], originalNodes: { right: tree1NodeJ } };
        const tree3InverseNodeK = { value: "K", source: 0, children: [tree3InverseNodeN], originalNodes: { right: tree1NodeK, left: tree2NodeK } };
        const tree3InverseNodeS = { value: "S", source: -1, children: [tree3InverseNodeR], originalNodes: { left: tree2NodeS } };
        const tree3InverseNodeU = { value: "U", source: -1, children: [], originalNodes: { left: tree2NodeU } };
        const tree3InverseNodeV = { value: "V", source: -1, children: [], originalNodes: { left: tree2NodeV } };
        const tree3InverseNodeW = { value: "W", source: -1, children: [], originalNodes: { left: tree2NodeW } };
        // Level 2 nodes
        const tree3InverseNodeB = { value: "B", source: 0, children: [tree3InverseNodeF, tree3InverseNodeG, tree3InverseNodeH, tree3InverseNodeT], originalNodes: { right: tree1NodeB, left: tree2NodeB } };
        const tree3InverseNodeC = { value: "C", source: 0, children: [tree3InverseNodeI], originalNodes: { right: tree1NodeC, left: tree2NodeC } };
        const tree3InverseNodeD = { value: "D", source: 1, children: [], originalNodes: { right: tree1NodeD } };
        const tree3InverseNodeE = { value: "E", source: 0, children: [tree3InverseNodeJ, tree3InverseNodeK], originalNodes: { right: tree1NodeE, left: tree2NodeE } };
        const tree3InverseNodeX = { value: "X", source: -1, children: [tree3InverseNodeS], originalNodes: { left: tree2NodeX } };
        const tree3InverseNodeY = { value: "Y", source: -1, children: [tree3InverseNodeU, tree3InverseNodeV, tree3InverseNodeW], originalNodes: { left: tree2NodeY } };
        // Level 1: root node
        const tree3InverseRootNode = { value: "Z", source: 0, children: [tree3InverseNodeB, tree3InverseNodeC, tree3InverseNodeD, tree3InverseNodeE, tree3InverseNodeX, tree3InverseNodeY], originalNodes: { right: tree1RootNode, left: tree2RootNode } }


        // The method to be tested is called
        const actualResult = DiffBetweenDirectories.mergeDirectoryTrees(tree2RootNode, tree1RootNode);


        // Expected result is inverse of tree 3
        expect(actualResult).toStrictEqual(tree3InverseRootNode);
    });

    it("should correctly generate a Quick Pick-specific tree from a merged tree", () => {
        // Expected result is detailed below
        // Level 1: root node
        const quickPickTreeRootNode: QuickPickTreeNode = { label: "$(folder) A", source: 0, description: "Available in both left and right folder", children: [], relativePath: "", parent: undefined };
        // Level 2
        const quickPickTreeNodeB: QuickPickTreeNode = { label: "$(folder) B", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B", parent: quickPickTreeRootNode };
        const quickPickTreeNodeC: QuickPickTreeNode = { label: "$(folder) C", source: 0, description: "Available in both left and right folder", children: [], relativePath: "C", parent: quickPickTreeRootNode };
        const quickPickTreeNodeD: QuickPickTreeNode = { label: "$(file) D", source: -1, description: "Only available in left folder", children: [], relativePath: "D", parent: quickPickTreeRootNode };
        const quickPickTreeNodeE: QuickPickTreeNode = { label: "$(folder) E", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E", parent: quickPickTreeRootNode };
        const quickPickTreeNodeX: QuickPickTreeNode = { label: "$(folder) X", source: 1, description: "Only available in right folder", children: [], relativePath: "X", parent: quickPickTreeRootNode };
        const quickPickTreeNodeY: QuickPickTreeNode = { label: "$(folder) Y", source: 1, description: "Only available in right folder", children: [], relativePath: "Y", parent: quickPickTreeRootNode };
        // Level 3 nodes
        const quickPickTreeNodeF: QuickPickTreeNode = { label: "$(file) F", source: -1, description: "Only available in left folder", children: [], relativePath: "B/F", parent: quickPickTreeNodeB };
        const quickPickTreeNodeG: QuickPickTreeNode = { label: "$(file) G", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B/G", parent: quickPickTreeNodeB };
        const quickPickTreeNodeH: QuickPickTreeNode = { label: "$(file) H", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B/H", parent: quickPickTreeNodeB };
        const quickPickTreeNodeT: QuickPickTreeNode = { label: "$(file) T", source: 1, description: "Only available in right folder", children: [], relativePath: "B/T", parent: quickPickTreeNodeB };
        const quickPickTreeNodeI: QuickPickTreeNode = { label: "$(file) I", source: 0, description: "Available in both left and right folder", children: [], relativePath: "C/I", parent: quickPickTreeNodeC };
        const quickPickTreeNodeJ: QuickPickTreeNode = { label: "$(folder) J", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J", parent: quickPickTreeNodeE };
        const quickPickTreeNodeK: QuickPickTreeNode = { label: "$(folder) K", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E/K", parent: quickPickTreeNodeE };
        const quickPickTreeNodeS: QuickPickTreeNode = { label: "$(folder) S", source: 1, description: "Only available in right folder", children: [], relativePath: "X/S", parent: quickPickTreeNodeX };
        const quickPickTreeNodeU: QuickPickTreeNode = { label: "$(file) U", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/U", parent: quickPickTreeNodeY };
        const quickPickTreeNodeV: QuickPickTreeNode = { label: "$(file) V", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/V", parent: quickPickTreeNodeY };
        const quickPickTreeNodeW: QuickPickTreeNode = { label: "$(file) W", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/W", parent: quickPickTreeNodeY };
        // Level 4 nodes
        const quickPickTreeNodeL: QuickPickTreeNode = { label: "$(file) L", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J/L", parent: quickPickTreeNodeJ };
        const quickPickTreeNodeM: QuickPickTreeNode = { label: "$(file) M", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J/M", parent: quickPickTreeNodeJ };
        const quickPickTreeNodeN: QuickPickTreeNode = { label: "$(file) N", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E/K/N", parent: quickPickTreeNodeK };
        const quickPickTreeNodeR: QuickPickTreeNode = { label: "$(file) R", source: 1, description: "Only available in right folder", children: [], relativePath: "X/S/R", parent: quickPickTreeNodeS };

        // Definition of children lists
        // Level 1: root node
        quickPickTreeRootNode.children = [quickPickTreeNodeB, quickPickTreeNodeC, quickPickTreeNodeD, quickPickTreeNodeE, quickPickTreeNodeX, quickPickTreeNodeY];
        // Level 2
        quickPickTreeNodeB.children = [quickPickTreeNodeF, quickPickTreeNodeG, quickPickTreeNodeH, quickPickTreeNodeT];
        quickPickTreeNodeC.children = [quickPickTreeNodeI];
        quickPickTreeNodeE.children = [quickPickTreeNodeJ, quickPickTreeNodeK];
        quickPickTreeNodeX.children = [quickPickTreeNodeS];
        quickPickTreeNodeY.children = [quickPickTreeNodeU, quickPickTreeNodeV, quickPickTreeNodeW];
        // Level 3
        quickPickTreeNodeJ.children = [quickPickTreeNodeL, quickPickTreeNodeM];
        quickPickTreeNodeK.children = [quickPickTreeNodeN];
        quickPickTreeNodeS.children = [quickPickTreeNodeR];


        // The method to be tested is called
        const actualResult = DiffBetweenDirectories.mergedTreeToQuickPickTree(tree3RootNode, "");


        // Expected result is the previously simulated tree
        expect(actualResult).toEqual(quickPickTreeRootNode);
    });
});
