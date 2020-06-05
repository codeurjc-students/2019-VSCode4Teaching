package com.vscode4teaching.vscode4teachingserver.model.views;

public class CommentThreadViews {
    private CommentThreadViews() {
    }

    public static interface GeneralView {
    }

    public static interface FileView extends FileViews.GeneralView, GeneralView {
    }

    public static interface CommentView extends CommentViews.GeneralView, GeneralView {
    }
}