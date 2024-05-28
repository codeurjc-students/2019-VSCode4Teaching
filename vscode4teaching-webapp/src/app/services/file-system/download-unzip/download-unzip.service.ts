import { HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { Observable } from "rxjs";

/**
 * DownloadUnzipDTO
 * Interface that defines the structure of the DTO object that is used to report the progress of the download and unzip operations when performed combined.
 */
export interface DownloadUnzipDTO {
    inProgress: boolean;
    operation: "Downloading…" | "Unzipping…";
    percentage: number;
}

/**
 * Download & Unzip service
 *
 * This service is responsible for downloading a file from a server and unzipping it into a given folder.
 *
 * In most cases, these operations are performed in a single step.
 * This algorithm intends to provide a way to report the progress of both operations during its execution.
 */
@Injectable({
    providedIn: 'root'
})
export class DownloadUnzipService {

    constructor() {
    }

    /**
     * Main method that performs both download and unzip operations.
     * It is an asynchronous method that reports the progress of both operations by returning a {@link DownloadUnzipDTO} object through an Observable,
     * which can be subscribed by the caller to get the progress updates during the execution.
     *
     * @param httpRequest The HTTP request that will download the ZIP file from the server.
     * @param destinationFolder The folder where the ZIP file will be unzipped.
     */
    public downloadAndUnzip(httpRequest: Observable<HttpEvent<Blob>>, destinationFolder: FileSystemDirectoryHandle): Observable<DownloadUnzipDTO> {
        return new Observable<DownloadUnzipDTO>(subscriber => {
            // Initial state is reported: download operation is about to be started and the progress is 0%
            const dto: DownloadUnzipDTO = { inProgress: false, operation: "Downloading…", percentage: 0 };
            subscriber.next(dto);

            // Download the file and observe the progress of the operation
            this.downloadExercise(httpRequest).subscribe({
                // Observable reports two types of values: download progress and the downloaded file (when finished)
                next: downloadDto => {
                    // Case 1: download is finished and a Blob is received
                    if (downloadDto instanceof Blob) {
                        // Update the DTO object to report that the download is finished and the unzip operation is about to start
                        dto.operation = "Unzipping…";
                        subscriber.next(dto);

                        // Unzip the downloaded file and forward the progress to the caller
                        // When the operation is finished, the returned observable is closed
                        this.extractZip(downloadDto, destinationFolder).subscribe({
                            next: unzipDto => {
                                subscriber.next(unzipDto);
                            },
                            error: error => {
                                subscriber.error(error);
                            },
                            complete: () => {
                                subscriber.complete();
                            }
                        })
                    }
                    // Case 2: download is in progress and a DownloadUnzipDTO is received and forwarded to the caller
                    else {
                        subscriber.next(downloadDto);
                    }
                },
                error: error => {
                    subscriber.error(error);
                },
            })
        });
    }

    /**
     * Method that performs the download operation.
     *
     * Receives an Observable that represents the HTTP request that will download the ZIP file from the server.
     * It returns an Observable that reports the progress of the download operation and, when finished, returns the downloaded file as a Blob.
     *
     * @param httpRequest The HTTP request that will download the ZIP file from the server.
     */
    private downloadExercise(httpRequest: Observable<HttpEvent<Blob>>): Observable<DownloadUnzipDTO | Blob> {
        return new Observable(subscriber => {
            httpRequest.subscribe({
                next: async (value: HttpEvent<Blob>) => {
                    // Case 1: request has just been sent, download is about to start
                    if (value.type === HttpEventType.Sent) {
                        subscriber.next({ inProgress: true, operation: "Downloading…", percentage: 0 });
                    }
                    // Case 2: download is in progress, server periodically reports progress
                    else if (value.type === HttpEventType.DownloadProgress && value.total) {
                        subscriber.next({ inProgress: true, operation: "Downloading…", percentage: 100 * value.loaded / value.total });
                    }
                    // Case 3: download has just finished
                    else if (value.type === HttpEventType.Response) {
                        subscriber.next({ inProgress: true, operation: "Downloading…", percentage: 100 });
                        if (value.body instanceof Blob) {
                            subscriber.next(value.body);
                        } else {
                            subscriber.error("Downloaded file is not a Blob");
                        }
                        subscriber.complete();
                    }
                }
            });
        });
    }

    /**
     * Method that performs the unzip operation.
     *
     * Receives a Blob containing the ZIP file that will be unzipped in the target folder.
     * It returns an Observable that reports the progress of the unzip operation.
     *
     * @param blob The Blob containing the ZIP file that will be unzipped.
     * @param targetFolder The folder where the ZIP file will be unzipped (previously authorized to be written).
     */
    private extractZip(blob: Blob, targetFolder: FileSystemDirectoryHandle): Observable<DownloadUnzipDTO> {
        return new Observable(subscriber => {
            (async () => {
                // Initial state is reported: unzip operation is about to be started and the progress is 0%
                subscriber.next({ inProgress: true, operation: "Unzipping…", percentage: 0 });

                // ZIP file is read and its entries are extracted
                const entries = await (new ZipReader(new BlobReader(blob))).getEntries();

                let currentEntry = 0;
                let totalEntries = entries.length;
                for (const entry of entries) {
                    if (!entry.directory) {
                        // Create the folder structure (if needed) for current entry
                        const pathSegments = entry.filename.split(/[\/\\]/);
                        let currentFolder = targetFolder;
                        for (let i = 0; i < pathSegments.length - 1; i++) {
                            const segment = pathSegments[i];
                            currentFolder = await currentFolder.getDirectoryHandle(segment, { create: true });
                        }

                        // Write the file in the target folder
                        const fileHandle = await currentFolder.getFileHandle(pathSegments[pathSegments.length - 1], { create: true });
                        const writable = await fileHandle.createWritable();
                        const data = entry.getData && await entry.getData(new BlobWriter());
                        if (data !== undefined) {
                            await writable.write(data);
                        }
                        await writable.close();
                    }

                    // Report the progress of the unzip operation
                    subscriber.next({ inProgress: true, operation: "Unzipping…", percentage: 100 * ++currentEntry / totalEntries });
                }

                // When all entries are extracted, the unzip operation is finished
                subscriber.complete();
            })();
        });
    }
}
