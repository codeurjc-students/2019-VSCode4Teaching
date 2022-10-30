package com.vscode4teaching.vscode4teachingserver.model.views;

public class UserViews {
    private UserViews() {
    }

    public interface GeneralView extends RoleViews.GeneralView {
    }

    public interface CourseView extends CourseViews.GeneralView {

    }

    public interface EmailView extends GeneralView {

    }
}