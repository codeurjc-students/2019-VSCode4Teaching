package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseStatus;

import java.util.List;

public class ExerciseUserInfoDTO {
    private ExerciseStatus status;
    private List<String> modifiedFiles;

    public boolean isFinished() {
        return status == ExerciseStatus.FINISHED;
    }

    public boolean isStarted() {
        return status != ExerciseStatus.NOT_STARTED;
    }

    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }

    public List<String> getModifiedFiles() {
        return modifiedFiles;
    }

    public void setModifiedFiles(List<String> modifiedFiles) {
        this.modifiedFiles = modifiedFiles;
    }

}
