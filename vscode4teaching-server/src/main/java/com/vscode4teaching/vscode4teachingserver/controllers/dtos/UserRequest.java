package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import javax.validation.constraints.Min;

public class UserRequest {
    
    @Min(1)
    private long id;

    public UserRequest() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

}