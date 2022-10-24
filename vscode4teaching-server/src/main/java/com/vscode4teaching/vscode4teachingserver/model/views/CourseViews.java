package com.vscode4teaching.vscode4teachingserver.model.views;

public class CourseViews {
    private CourseViews() {
    }

    public interface GeneralView extends UserViews.GeneralView {
    }

    public interface ExercisesView extends GeneralView, ExerciseViews.GeneralView {
    }

    public interface UsersView extends GeneralView {
    }

    public interface CreatorView extends GeneralView {
    }

    public interface CodeView extends GeneralView {
    }
}
