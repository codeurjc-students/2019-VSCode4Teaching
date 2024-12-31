package es.codeurjc.vscode4teaching.services.exceptions;

public class NotInCourseException extends Exception {

    private static final long serialVersionUID = 456748914891L;

    public NotInCourseException(String string) {
        super(string);
    }
}