package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class EmptyJSONObjectException extends Exception {
    private static final long serialVersionUID = 13198497635156L;

    public EmptyJSONObjectException() {
        super("JSON Object is empty");
    }
}
