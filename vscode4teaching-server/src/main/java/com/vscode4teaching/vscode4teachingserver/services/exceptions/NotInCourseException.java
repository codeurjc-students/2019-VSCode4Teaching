package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class NotInCourseException extends Exception {

	private static final long serialVersionUID = 456748914891L;

    public NotInCourseException(String string) {
        super(string);
	}
}