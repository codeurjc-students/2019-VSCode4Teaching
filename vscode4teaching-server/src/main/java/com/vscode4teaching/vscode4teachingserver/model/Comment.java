package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(CommentViews.GeneralView.class)
    private Long id;

    @ManyToOne
    @JsonView(CommentViews.ThreadView.class)
    private CommentThread thread;

    @JsonView(CommentViews.GeneralView.class)
    private String body;

    @JsonView(CommentViews.GeneralView.class)
    private String author;

    @CreationTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime updateDateTime;
    
    public Comment(CommentThread thread, String body, String author) {
        this.thread = thread;
        this.body = body;
        this.author = author;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CommentThread getThread() {
        return thread;
    }

    public void setThread(CommentThread thread) {
        this.thread = thread;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public void setCreateDateTime(LocalDateTime createDateTime) {
        this.createDateTime = createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public void setUpdateDateTime(LocalDateTime updateDateTime) {
        this.updateDateTime = updateDateTime;
    }

    
}