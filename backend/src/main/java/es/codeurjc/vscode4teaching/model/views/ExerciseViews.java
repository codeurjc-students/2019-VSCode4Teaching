package es.codeurjc.vscode4teaching.model.views;

public class ExerciseViews {
    private ExerciseViews() {
    }

    public interface GeneralView {
    }

    public interface CourseView extends GeneralView, CourseViews.CreatorView {
    }

    public interface FileView extends GeneralView, FileViews.GeneralView {
    }

    public interface CodeView extends GeneralView {
    }
}