package es.codeurjc.vscode4teaching.services.exceptions;

public class EmptyJSONObjectException extends Exception {
    private static final long serialVersionUID = 13198497635156L;

    public EmptyJSONObjectException() {
        super("JSON Object is empty");
    }
}
