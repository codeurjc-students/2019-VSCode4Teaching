package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import java.util.List;

public class ExerciseUserInfoDTO {
    private int status;
    private List<String> modifiedFiles;

    public boolean isFinished() {
        return status == 1;
    }

    public boolean isStarted() {
        return status > 0;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public List<String> getModifiedFiles() {
        return modifiedFiles;
    }

    public void setModifiedFiles(List<String> modifiedFiles) {
        this.modifiedFiles = modifiedFiles;
    }

}