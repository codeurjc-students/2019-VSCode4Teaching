package es.codeurjc.vscode4teaching.servicesimpl;

import es.codeurjc.vscode4teaching.model.Course;
import es.codeurjc.vscode4teaching.model.User;
import es.codeurjc.vscode4teaching.services.exceptions.NotCreatorException;
import es.codeurjc.vscode4teaching.services.exceptions.NotInCourseException;

public class ExceptionUtil {
    private ExceptionUtil() {
    }

    public static void throwExceptionIfNotInCourse(Course course, String requestUsername, boolean hasToBeTeacher)
            throws NotInCourseException {
        for (User user : course.getUsersInCourse()) {
            if (user.getUsername().equals(requestUsername)) {
                if (hasToBeTeacher) {
                    if (user.isTeacher()) {
                        return;
                    }
                } else {
                    return;
                }
            }
        }
        String exceptionMessage = hasToBeTeacher ? "User is not in course or teacher is not in this course."
                : "User is not in course.";
        throw new NotInCourseException(exceptionMessage);
    }

    public static void throwIfNotCreator(Course course, String requestUsername) throws NotCreatorException {
        if (!course.getCreator().getUsername().equals(requestUsername)) {
            throw new NotCreatorException();
        }
    }
}