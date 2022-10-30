package com.vscode4teaching.vscode4teachingserver.model;

public enum ExerciseStatus {
    NOT_STARTED(0, "Not started"),
    IN_PROGRESS(2, "In progress"),
    FINISHED(1, "Finished");

    private final int code;
    private final String asString;

    ExerciseStatus(int code, String asString) {
        this.code = code;
        this.asString = asString;
    }

    public int getCode() {
        return code;
    }

    @Override
    public String toString() {
        return asString;
    }
}
