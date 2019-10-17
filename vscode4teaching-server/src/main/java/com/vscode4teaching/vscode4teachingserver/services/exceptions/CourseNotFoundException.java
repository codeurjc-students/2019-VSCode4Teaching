package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class CourseNotFoundException extends NotFoundException {
    private static final long serialVersionUID = 984981314488442L;

    public CourseNotFoundException(Long courseId) {
        super("Course not found: " + courseId);
    }
}