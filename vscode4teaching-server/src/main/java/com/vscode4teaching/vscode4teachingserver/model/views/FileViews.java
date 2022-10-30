package com.vscode4teaching.vscode4teachingserver.model.views;

public class FileViews {
    private FileViews() {
    }

    public interface GeneralView {
    }

    public interface OwnerView extends GeneralView {

    }

    public interface CommentView extends GeneralView, CommentThreadViews.CommentView {
    }
}