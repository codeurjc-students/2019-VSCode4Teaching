import { FileNode } from "./file-system.model";

/** Synchronization jobs can be file creation, modification or deletion. */
export type SyncJobType = 'CREATION' | 'MODIFICATION' | 'DELETION';


/**
 * Representative class of synchronization jobs.
 *
 * They include a reference to a FileNode representing the file to be synchronized, the type of job to be executed and
 * specific information about the upload, including the progress of the process as a percentage and the status of the synchronization.
 */
export class SyncJob {
    // Information about synchronization job
    node: FileNode;
    type: SyncJobType;

    // Information about synchronization progress (value and status)
    progress: number;
    syncStatus: 'PENDING' | 'STARTED' | 'IN_PROGRESS' | 'FINISHED';

    constructor(node: FileNode, type: SyncJobType) {
        this.node = node;
        this.type = type;

        this.progress = 0;
        this.syncStatus = 'PENDING';
    }
}
