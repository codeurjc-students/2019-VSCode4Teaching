package es.codeurjc.vscode4teaching.services.exceptions;

public class CourseNotFoundException extends NotFoundException {
    private static final long serialVersionUID = 984981314488442L;

    public CourseNotFoundException(Long courseId) {
        super("Course not found: " + courseId);
    }

    public CourseNotFoundException(String courseId) {
        super("Course not found: " + courseId);
    }
}