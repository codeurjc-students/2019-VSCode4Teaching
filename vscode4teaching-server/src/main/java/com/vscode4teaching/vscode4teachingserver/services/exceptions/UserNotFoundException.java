package com.vscode4teaching.vscode4teachingserver.services.exceptions;

public class UserNotFoundException extends NotFoundException {
    private static final long serialVersionUID = 541211575242442L;

    public UserNotFoundException(String username) {
        super("User not found:" + username);
    }
}