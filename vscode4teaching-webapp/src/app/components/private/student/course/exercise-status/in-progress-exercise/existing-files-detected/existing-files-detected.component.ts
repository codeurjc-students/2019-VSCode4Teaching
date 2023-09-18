import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-student-exercise-existing-files',
  templateUrl: './existing-files-detected.component.html',
  styleUrls: ['../in-progress-exercise.component.scss']
})
export class ExistingFilesDetectedComponent {

    @Output("userSelected") userSelectedEmitter: EventEmitter<boolean>;

    constructor() {
        this.userSelectedEmitter = new EventEmitter();
    }

    startSync() {
        this.userSelectedEmitter.emit(true);
    }

    downloadFiles() {
        this.userSelectedEmitter.emit(false);
    }
}
