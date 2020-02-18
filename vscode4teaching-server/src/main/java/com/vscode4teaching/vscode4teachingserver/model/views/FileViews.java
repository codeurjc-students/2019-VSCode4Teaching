package com.vscode4teaching.vscode4teachingserver.model.views;

public class FileViews {
    private FileViews() {
    }

    public static interface GeneralView {
    }

    public static interface OwnerView extends GeneralView {

    }
    
    public static interface CommentView extends GeneralView, CommentThreadViews.CommentView {
    }
}