package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

public class ExerciseUserInfoDTO {
    private int status;
    private String lastModifiedFile;

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

    public String getLastModifiedFile() {
        return lastModifiedFile;
    }

    public void setLastModifiedFile(String lastModifiedFile) {
        this.lastModifiedFile = lastModifiedFile;
    }
}