package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import java.io.Serializable;

public class JWTResponse implements Serializable {

	private static final long serialVersionUID = -89479191651681891L;

	private String jwtToken;

	public JWTResponse() {
	}

	public JWTResponse(String jwtToken) {
		this.jwtToken = jwtToken;
	}

	public String getJwtToken() {
		return jwtToken;
	}

	public void setJwtToken(String jwtToken) {
		this.jwtToken = jwtToken;
	}
}