package es.codeurjc.vscode4teaching.services.exceptions;

public class NotCreatorException extends Exception {
    private static final long serialVersionUID = 7424646476876367675L;

    public NotCreatorException() {
        super("User is not the creator of this course.");
    }
}