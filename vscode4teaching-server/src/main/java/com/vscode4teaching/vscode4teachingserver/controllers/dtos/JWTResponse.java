package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import java.io.Serializable;

public class JWTResponse implements Serializable {

    private static final long serialVersionUID = -89479191651681891L;

    private String jwtToken;

    private String encryptedJwtToken;

    public JWTResponse() {
    }

    public JWTResponse(String jwtToken, String encryptedJwtToken) {
        this.jwtToken = jwtToken;
        this.encryptedJwtToken = encryptedJwtToken;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public String getEncryptedJwtToken() {
        return encryptedJwtToken;
    }
}