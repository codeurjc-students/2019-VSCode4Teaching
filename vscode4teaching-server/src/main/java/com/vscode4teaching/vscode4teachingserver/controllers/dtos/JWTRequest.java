package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import java.io.Serializable;

public class JWTRequest implements Serializable {

    private static final long serialVersionUID = 45654645884777L;

    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}