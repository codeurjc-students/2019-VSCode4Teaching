package com.vscode4teaching.vscode4teachingserver.services.exceptions;

import java.util.Arrays;

public class MissingPropertyException extends Exception {
    private static final long serialVersionUID = 765434846831L;

    public MissingPropertyException(String... missingProperties) {
        super("The following keys are missing: " + Arrays.toString(missingProperties));
    }
    
}
