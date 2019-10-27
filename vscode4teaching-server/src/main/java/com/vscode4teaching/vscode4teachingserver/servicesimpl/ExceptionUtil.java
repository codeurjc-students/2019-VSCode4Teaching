package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

public class ExceptionUtil {
    private ExceptionUtil() {
    }

    public static void throwExceptionIfNotInCourse(Course course, String requestUsername, boolean hasToBeTeacher)
            throws NotInCourseException {
        for (User user : course.getUsersInCourse()) {
            if (user.getUsername().equals(requestUsername)) {
                if (hasToBeTeacher) {
                    for (Role role : user.getRoles()) {
                        if (role.getRoleName().equals("ROLE_TEACHER")) {
                            return;
                        }
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
}