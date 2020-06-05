package com.vscode4teaching.vscode4teachingserver.model.views;

public class CourseViews {
    private CourseViews() {
    }

    public static interface GeneralView extends UserViews.GeneralView {
    }

    public static interface ExercisesView extends GeneralView, ExerciseViews.GeneralView {
    }

    public static interface UsersView extends GeneralView {
    }

    public static interface CreatorView extends GeneralView {
    }

    public static interface CodeView extends GeneralView {
    }
}