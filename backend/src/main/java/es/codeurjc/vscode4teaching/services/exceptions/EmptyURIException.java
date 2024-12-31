package es.codeurjc.vscode4teaching.services.exceptions;

public class EmptyURIException extends Exception {
    private static final long serialVersionUID = 645131681961L;

    public EmptyURIException() {
        super("Sent URI is empty.");
    }
}
