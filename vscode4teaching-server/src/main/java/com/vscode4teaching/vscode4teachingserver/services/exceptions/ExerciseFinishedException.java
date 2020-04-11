package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class ExerciseFinishedException extends Exception {

    private static final long serialVersionUID = 49198198657358733L;

    public ExerciseFinishedException(Long exerciseId) {
        super("Exercise is marked as finished: " + exerciseId);
    }
}