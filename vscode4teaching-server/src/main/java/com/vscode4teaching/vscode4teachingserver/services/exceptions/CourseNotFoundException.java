package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class CourseNotFoundException extends Exception {
    private static final long serialVersionUID = 1L;

    public CourseNotFoundException(String message) {
        super(message);
    }
}