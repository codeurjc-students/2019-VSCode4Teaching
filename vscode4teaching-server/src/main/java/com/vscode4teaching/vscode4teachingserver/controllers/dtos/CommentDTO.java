package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import javax.validation.constraints.NotEmpty;

import org.hibernate.validator.constraints.Length;

public class CommentDTO {
    
    @NotEmpty(message = "Comment author should not be empty")
    @Length(min = 1, message = "Comment author should not be empty")
    private String author;

    @NotEmpty(message = "Comment body should not be empty")
    @Length(min = 1, message = "Comment body should not be empty")
    private String body;

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
    
}