import { DirectoryNode, FileNode, TreeDiffResult } from "./file-system.model";
import { SyncJob } from "./sync-job.model";

/**
 * Priority queue used to store pending synchronization jobs.
 *
 * This abstract data structure (ADT) is organized by a system of N priorities (set to 2 for the current case) the pending jobs,
 * allowing to enqueue jobs with an adjusted priority and to dequeue them in order of priority and arrival (First In, First Out).
 *
 * Although no use is made of generic methods, the generic data structure can be easily generated, since enqueueByPriority, dequeue, pendingElements and getNElements are generic.
 * In addition, this implementation incorporates a specific method to easily queue all the jobs included in a TreeDiffResult instance; that is, in a 3-tuple of created files or directories, deleted files or directories and modified files.
 */
export class SyncJobPriorityQueue {
    /** List of sorted lists for entering pending jobs by priority */
    private jobListByPriority: SyncJob[][];
    /** Number of priorities to distinguish */
    private readonly priorities: number = 2;


    constructor(priorities: number) {
        this.jobListByPriority = [];
        this.priorities = priorities;
        for (let i = 0; i < this.priorities; i++)
            this.jobListByPriority.push([]);
    }


    // GENERIC METHODS
    /** Given a synchronization job and a priority, the new job is queued at the end of the specified job list according to the priority level. */
    public enqueueByPriority(syncWork: SyncJob, priority: number) {
        this.jobListByPriority[priority].push(syncWork);
    }

    /** It returns the highest priority synchronization job, for which it searches in the first positions of the different existing lists by priority. */
    public dequeue(): SyncJob | undefined {
        for (let i = 0; i < this.priorities; i++)
            if (this.jobListByPriority[i].length > 0) return this.jobListByPriority[i].shift();
        return undefined;
    }

    /** Returns the number of pending synchronization jobs at any priority included in queue. */
    public pendingElements(): number {
        let pendingElements = 0;
        for (let i = 0; i < this.priorities; i++) {
            pendingElements += this.jobListByPriority[i].length;
        }
        return pendingElements;
    }

    /** Returns the first N elements included in queue WITHOUT DEQUEUING THEM. */
    public getNElements(n: number): SyncJob[] {
        let outputSyncWorkList: SyncJob[] = [];
        let currentPriority = 0;
        let currentElement = 0;

        while (outputSyncWorkList.length < n) {
            if (currentElement < this.jobListByPriority[currentPriority].length) {
                outputSyncWorkList.push(this.jobListByPriority[currentPriority][currentElement]);
                currentElement++;
            } else {
                currentPriority++;
                currentElement = 0;
                if (currentPriority >= this.priorities) return outputSyncWorkList;
            }
        }
        return outputSyncWorkList;
    }


    // SPECIFIC SYNCHRONIZATION WORK METHODS
    /** Given a 3-tuple of created and deleted files or directories and modified files, it generates a synchronization job for each job recursively
     * for directory creations and deletions and queues them with their stipulated priorities in the priority queue. */
    public enqueueFromTreeDiffResult(treeDiff: TreeDiffResult) {
        // 1. Deletion jobs
        // These enter with the highest priority (0) and are enqueued recursively in they are directory nodes.
        const enqueueDeleted = (deletedFileNode: FileNode) => this.enqueueByPriority(new SyncJob(deletedFileNode, 'DELETION'), 0);
        treeDiff.deleted.forEach((deleted) => {
            if (deleted instanceof FileNode)
                enqueueDeleted(deleted);
            else if (deleted instanceof DirectoryNode)
                deleted.getAllFileNodes().forEach((deletedFileNode: FileNode) => enqueueDeleted(deletedFileNode));
        });

        // 2. Creation jobs
        // These enter with a lower priority (1) and are enqueued recursively in they are directory nodes.
        const enqueueCreated = (createdFileNode: FileNode) => this.enqueueByPriority(new SyncJob(createdFileNode, 'CREATION'), 1);
        treeDiff.created.forEach((created) => {
            if (created instanceof FileNode)
                enqueueCreated(created);
            else if (created instanceof DirectoryNode)
                created.getAllFileNodes().forEach((createdFileNode: FileNode) => enqueueCreated(createdFileNode));
        });

        // 3. Modification jobs
        // These enter with a lower priority (1) and can only be related to file nodes.
        treeDiff.modified.forEach((modifiedFileNode: FileNode) => {
            this.enqueueByPriority(new SyncJob(modifiedFileNode, 'MODIFICATION'), 1)
        });
    }
}
