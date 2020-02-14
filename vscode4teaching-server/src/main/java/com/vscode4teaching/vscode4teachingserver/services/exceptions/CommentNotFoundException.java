package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class CommentNotFoundException extends NotFoundException {

	private static final long serialVersionUID = 2343242342111898L;
    
    public CommentNotFoundException(String msg) {
        super(msg);
    }
}