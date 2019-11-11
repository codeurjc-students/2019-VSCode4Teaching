package com.vscode4teaching.vscode4teachingserver.model.views;

public class UserViews {
    private UserViews() {
    }

    public static interface GeneralView extends RoleViews.GeneralView {
    }

    public static interface CourseView extends GeneralView, CourseViews.GeneralView {
        
    }

    public static interface EmailView extends GeneralView {
        
    }
}