package es.codeurjc.vscode4teaching.services.exceptions;

public class NoSolutionException extends Exception {
    private static final long serialVersionUID = 7424646476876367677L;

    public NoSolutionException(Long exerciseId) {
        super("No solution found for exercise: " + exerciseId);
    }
}