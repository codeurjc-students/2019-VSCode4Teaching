package es.codeurjc.vscode4teaching.services.exceptions;

public class NotFoundException extends Exception {
    private static final long serialVersionUID = 6460984619840561L;

    public NotFoundException(String message) {
        super(message);
    }
}