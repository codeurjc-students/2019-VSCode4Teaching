package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

public class UserRequest {

    private long[] ids;

    public UserRequest() {
        // Empty constructor for DTO
    }

    public long[] getIds() {
        return ids;
    }

    public void setIds(long[] ids) {
        this.ids = ids;
    }

}