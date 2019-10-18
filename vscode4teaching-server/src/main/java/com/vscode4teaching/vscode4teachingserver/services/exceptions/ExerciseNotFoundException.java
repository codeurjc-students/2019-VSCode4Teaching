package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class ExerciseNotFoundException extends NotFoundException {
    private static final long serialVersionUID = 984981314488442L;

    public ExerciseNotFoundException(Long exerciseId) {
        super("Exercise not found: " + exerciseId);
    }
}