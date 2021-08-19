package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

public class UserRequest {

    private Long[] ids;

    public UserRequest() {
        // Empty constructor for DTO
    }

    public Long[] getIds() {
        return ids;
    }

    public void setIds(Long[] ids) {
        this.ids = ids;
    }

}