package com.vscode4teaching.vscode4teachingserver.model.views;

public class ExerciseViews {
    private ExerciseViews() {
    }

    public static interface GeneralView {
    }

    public static interface CourseView extends GeneralView, CourseViews.CreatorView {
    }

    public static interface FileView extends GeneralView, FileViews.GeneralView {
    }
}