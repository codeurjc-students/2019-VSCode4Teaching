import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExerciseUserInfo } from "../../../../../../../model/exercise-user-info.model";
import { FileExchangeService } from "../../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";

@Component({
  selector: 'app-student-exercise-download-unzip',
  templateUrl: './download-unzip-files.component.html',
  styleUrls: ['../in-progress-exercise.component.scss']
})
export class DownloadUnzipFilesComponent {
    @Input("exerciseDirectoryHandle") exerciseDirectoryHandle!: FileSystemDirectoryHandle | undefined;
    @Input("eui") eui!: ExerciseUserInfo;

    @Output("exercisePrepared") exercisePreparedEmitter: EventEmitter<boolean>;

    showStepperProgress: boolean;
    progressBar: { current: number, total: number, process: string, visible: boolean };
    stepperStatus: { download: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED", unzip: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" };


    constructor(private fileExchangeService: FileExchangeService) {
        this.exercisePreparedEmitter = new EventEmitter();

        this.showStepperProgress = false;
        this.progressBar = { current: 0, total: 0, process: "", visible: true };
        this.stepperStatus = { download: "NOT_STARTED", unzip: "NOT_STARTED" };
    }

    private async extractZip(blob: Blob, targetFolder: FileSystemDirectoryHandle) {
        const entries = await (new ZipReader(new BlobReader(blob))).getEntries();
        this.progressBar.process = "Unzipping...";
        this.progressBar.current = 0;
        this.progressBar.total = entries.length;
        this.stepperStatus.unzip = "IN_PROGRESS";
        for (const entry of entries) {
            if (!entry.directory) {
                const pathSegments = entry.filename.split(/[\/\\]/);
                let currentFolder = targetFolder;

                // Crear subdirectorios si es necesario
                for (let i = 0; i < pathSegments.length - 1; i++) {
                    const segment = pathSegments[i];
                    currentFolder = await currentFolder.getDirectoryHandle(segment, { create: true });
                }

                // Crear y escribir el archivo
                const fileHandle = await currentFolder.getFileHandle(pathSegments[pathSegments.length - 1], { create: true });
                const writable = await fileHandle.createWritable();
                const data = entry.getData && await entry.getData(new BlobWriter());
                if (data !== undefined) {
                    await writable.write(data);
                }
                await writable.close();
            }
            this.progressBar.current++;
        }
        this.stepperStatus.unzip = "FINISHED";
        this.progressBar.visible = false;
        this.exercisePreparedEmitter.emit(true);
    }


    async downloadExercise() {
        this.showStepperProgress = true;

        try {
            this.fileExchangeService.getExerciseFilesByExerciseId(this.eui.exercise.id)
                .subscribe({
                    next: async (value: HttpEvent<Blob>) => {
                        // Case 1: TODO DOCUEMNTAR
                        if (value.type === HttpEventType.Sent) {
                            // TODO ¿qué hago aquí?
                            this.stepperStatus.download = "IN_PROGRESS";
                            this.progressBar.visible = true;
                            this.progressBar.total = 100;
                            this.progressBar.process = "Downloading...";
                        }
                        // Case 2: download is in progress, server periodically reports progress
                        else if (value.type === HttpEventType.DownloadProgress) {
                            if (value.total) this.progressBar.current = Math.round(100 * value.loaded / value.total);
                        }
                        // Case 3: download has just finished
                        else if (value.type === HttpEventType.Response) {
                            this.progressBar.current = 100;
                            this.stepperStatus.download = "FINISHED";

                            const blob = value.body;
                            if (blob == null || this.exerciseDirectoryHandle == undefined) return;

                            await this.extractZip(blob, this.exerciseDirectoryHandle);
                        }
                    }
                });
        } catch (e) {
            // TODO IMPLEMENTAR CATCH
        }
    }
}
