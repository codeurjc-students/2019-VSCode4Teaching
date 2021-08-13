package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class EmptyURIException extends Exception {
    private static final long serialVersionUID = 645131681961L;

    public EmptyURIException() {
        super("Sent URI is empty.");
    }
}
