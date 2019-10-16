package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class NotFoundException extends Exception {
    private static final long serialVersionUID = 6460984619840561L;

    public NotFoundException(String message) {
        super(message);
    }
}