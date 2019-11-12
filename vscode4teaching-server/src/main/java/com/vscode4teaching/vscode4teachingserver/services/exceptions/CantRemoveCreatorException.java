package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class CantRemoveCreatorException extends Exception {
    private static final long serialVersionUID = 7424646476876367675L;

    public CantRemoveCreatorException() {
        super("Creator can't be removed from course.");
    }
}