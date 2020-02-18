package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentThreadViews;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
@Entity
public class CommentThread {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(CommentThreadViews.GeneralView.class)
    private Long id;

    @ManyToOne
    @JsonView(CommentThreadViews.FileView.class)
    private ExerciseFile file;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonView(CommentThreadViews.CommentView.class)
    private List<Comment> comments = new ArrayList<>();

    @JsonView(CommentThreadViews.GeneralView.class)
    @Min(0)
    private Long line;

    @CreationTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public CommentThread(ExerciseFile file, Long line) {
        this.file = file;
        this.line = line;
    }

    public CommentThread(Long line) {
        this.line = line;
    }

    public CommentThread() {

    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExerciseFile getFile() {
        return file;
    }

    public void setFile(ExerciseFile file) {
        this.file = file;
    }

    public Long getLine() {
        return line;
    }

    public void setLine(Long line) {
        this.line = line;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void addComment(Comment comment) {
        this.comments.add(comment);
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