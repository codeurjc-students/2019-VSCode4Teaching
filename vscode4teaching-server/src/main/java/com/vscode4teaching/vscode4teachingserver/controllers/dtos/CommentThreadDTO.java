package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.Min;

public class CommentThreadDTO {
    private List<CommentDTO> comments = new ArrayList<>();

    @Min(0)
    private Long line;

    public List<CommentDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentDTO> comments) {
        this.comments = comments;
    }

    public Long getLine() {
        return line;
    }

    public void setLine(Long line) {
        this.line = line;
    }

    
}