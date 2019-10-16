package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class NotSameTeacherException extends Exception {

	private static final long serialVersionUID = 456748914891L;

    public NotSameTeacherException(String string) {
        super(string);
	}
}