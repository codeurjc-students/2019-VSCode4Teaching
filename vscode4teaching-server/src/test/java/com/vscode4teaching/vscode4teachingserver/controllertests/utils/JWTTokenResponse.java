package com.vscode4teaching.vscode4teachingserver.controllertests.utils;

public class JWTTokenResponse {
    private String jwtToken;

    public JWTTokenResponse() {
    }

    public JWTTokenResponse(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

}