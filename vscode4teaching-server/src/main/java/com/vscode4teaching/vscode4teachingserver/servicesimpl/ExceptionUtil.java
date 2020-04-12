package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

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