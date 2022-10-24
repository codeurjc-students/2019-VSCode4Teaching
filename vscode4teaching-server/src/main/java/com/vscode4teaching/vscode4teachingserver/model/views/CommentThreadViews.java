package com.vscode4teaching.vscode4teachingserver.model.views;

public class CommentThreadViews {
    private CommentThreadViews() {
    }

    public interface GeneralView {
    }

    public interface FileView extends FileViews.GeneralView, GeneralView {
    }

    public interface CommentView extends CommentViews.GeneralView, GeneralView {
    }
}
