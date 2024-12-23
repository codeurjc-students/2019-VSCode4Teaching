import { HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { Observable } from "rxjs";

/**
 * ZipUploadDTO
 * Interface that defines the structure of the DTO object that is used to report the progress of the zip and upload operations when performed combined.
 */
export interface ZipUploadDTO {
    inProgress: boolean;
    operation: "Zipping…" | "Uploading…";
    percentage: number;
}

/**
 * Zip & Upload service
 *
 * This service is responsible for zipping a folder and uploading it (sending it as part of an HTTP request) to a server.
 *
 * In most cases, these operations are performed in a single step.
 * This algorithm intends to provide a way to report the progress of both operations during its execution.
 */
@Injectable({
    providedIn: 'root'
})
export class ZipUploadService {

    constructor() {
    }

    /**
     * Main method that performs both zip and upload operations.
     * It is an asynchronous method that reports the progress of both operations by returning a {@link ZipUploadDTO} object through an Observable,
     * which can be subscribed by the caller to get the progress updates during the execution.
     *
     * @param originFolder The folder that will be compressed to a ZIP file (recursively).
     * @param httpRequest The HTTP request that will upload the ZIP file to the server (receiving the ZIP file as a Blob parameter).
     */
    public zipAndUpload(originFolder: FileSystemDirectoryHandle, httpRequest: (blob: Blob) => Observable<HttpEvent<any>>): Observable<ZipUploadDTO> {
        return new Observable<ZipUploadDTO>(subscriber => {
            // Initial state is reported: zip operation is about to be started and the progress is 0%
            const dto: ZipUploadDTO = { inProgress: false, operation: "Zipping…", percentage: 0 };
            subscriber.next(dto);

            // Compress contents from origin folder and observe the progress of the operation
            this.zipDirectory(originFolder).subscribe({
                // Observable reports two types of values: download progress and the downloaded file (when finished)
                next: (zipDTO: ZipUploadDTO | Blob) => {
                    // Case 1: download is finished and a Blob is received
                    if (zipDTO instanceof Blob) {
                        // Update the DTO object to report that the download is finished and the unzip operation is about to start
                        dto.operation = "Uploading…";
                        subscriber.next(dto);

                        // Send the zipped folder as a Blob to the server using the provided HTTP request
                        // When the operation is finished, the returned observable is closed
                        this.upload(httpRequest(zipDTO)).subscribe({
                            next: (unzipDto: ZipUploadDTO) => {
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
                    // Case 2: compressing is in progress and a ZipUploadDTO is received and forwarded to the caller
                    else {
                        subscriber.next(zipDTO);
                    }
                },
                error: error => {
                    subscriber.error(error);
                },
            })
        });
    }

    /**
     * Method that performs the zip operation.
     *
     * Receives a folder in local file system (as a {@link FileSystemDirectoryHandle}) and compresses it to a ZIP file recursively.
     * It returns an Observable that reports the progress of the zip operation.
     *
     * @param originFolder The folder to be compressed to a ZIP file.
     */
    private zipDirectory(originFolder: FileSystemDirectoryHandle): Observable<ZipUploadDTO | Blob> {
        return new Observable(subscriber => {
            (async () => {
                // Initial state is reported: zip operation is about to be started and the progress is 0%
                subscriber.next({ inProgress: true, operation: "Zipping…", percentage: 0 });

                // Get the total number of entries in the origin folder to report the progress
                const totalEntries = await this.getNumberOfEntriesRecursiveInFileSystemDirectoryHandle(originFolder);

                // Create a new ZipWriter and start adding entries to it
                const zipWriter: ZipWriter<Blob> = new ZipWriter(new BlobWriter("application/zip"));

                // Process is done recursively to add all entries to the ZIP file
                // This method is called for each folder in the origin folder (and its subfolders recursively)
                let currentEntry = 0;
                const recursiveAddEntries = async (directory: FileSystemDirectoryHandle, parentPath = "") => {
                    for await (const entry of directory.values()) {
                        // If the entry is a file, add it to the ZIP file
                        if (entry instanceof FileSystemFileHandle) {
                            const file = await entry.getFile();
                            await zipWriter.add(parentPath + file.name, new BlobReader(file));
                        }
                        // If the entry is a directory, call the method recursively to add its contents
                        else if (entry instanceof FileSystemDirectoryHandle) {
                            await recursiveAddEntries(entry, parentPath + entry.name + "/");
                        }

                        // Every time an entry is added, report the progress to the subscriber
                        subscriber.next({ inProgress: true, operation: "Zipping…", percentage: 100 * ++currentEntry / totalEntries });
                    }
                }

                // Base case: start the recursive process with the origin folder (root of the ZIP file)
                await recursiveAddEntries(originFolder);

                subscriber.next({ inProgress: true, operation: "Zipping…", percentage: 100 });
                const zipBlob: Blob = await zipWriter.close();
                subscriber.next(zipBlob);

                // When all entries are extracted, the zip operation is finished
                subscriber.complete();
            })();
        });
    }

    /**
     * Method that performs the upload operation.
     *
     * Receives an HTTP request that will send an HTTP request to the server that will contain the ZIP file as a Blob.
     * It returns an Observable that reports the progress of the upload operation.
     *
     * @param httpRequest The HTTP request that will upload the ZIP file to the server.
     */
    private upload(httpRequest: Observable<HttpEvent<any>>): Observable<ZipUploadDTO> {
        return new Observable(subscriber => {
            httpRequest.subscribe({
                next: async (value: HttpEvent<any>) => {
                    // Case 1: request has just been sent, upload is about to start
                    if (value.type === HttpEventType.Sent) {
                        subscriber.next({ inProgress: true, operation: "Uploading…", percentage: 0 });
                    }
                    // Case 2: upload is in progress, server periodically reports progress
                    else if (value.type === HttpEventType.UploadProgress && value.total) {
                        subscriber.next({ inProgress: true, operation: "Uploading…", percentage: 100 * value.loaded / value.total - 1 });
                    }
                    // Case 3: upload has just finished
                    else if (value.type === HttpEventType.Response) {
                        subscriber.next({ inProgress: true, operation: "Uploading…", percentage: 100 });
                        subscriber.complete();
                    }
                }
            });
        });
    }


    /**
     * Auxiliary method that counts the number of entries in a directory (files and subdirectories) recursively.
     *
     * It is used in the zip operation to report the progress of the operation.
     *
     * @param directory The directory to count the entries.
     */
    private getNumberOfEntriesRecursiveInFileSystemDirectoryHandle(directory: FileSystemDirectoryHandle): Promise<number> {
        return new Promise(async (res) => {
            let count = 0;
            for await (const entry of directory.values()) {
                if (entry.kind === "file") {
                    count++;
                } else if (entry.kind === "directory") {
                    // Directory is counted as an entry and the method is called recursively to count its contents
                    count += await this.getNumberOfEntriesRecursiveInFileSystemDirectoryHandle(entry as FileSystemDirectoryHandle) + 1;
                }
            }

            // When all entries are counted, the total number is returned and the promise is resolved
            res(count);
        });
    }
}
