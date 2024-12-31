package es.codeurjc.vscode4teaching.services.exceptions;

public class ExerciseNotFoundException extends NotFoundException {
    private static final long serialVersionUID = 984981314488442L;

    public ExerciseNotFoundException(Long exerciseId) {
        super("Exercise not found: " + exerciseId);
    }
}