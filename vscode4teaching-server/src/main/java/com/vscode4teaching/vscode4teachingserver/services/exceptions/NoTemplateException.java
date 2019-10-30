package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class NoTemplateException extends Exception {
    private static final long serialVersionUID = 7424646476876367675L;

    public NoTemplateException(Long exerciseId) {
        super("No template found for exercise: " + exerciseId);
    }
}