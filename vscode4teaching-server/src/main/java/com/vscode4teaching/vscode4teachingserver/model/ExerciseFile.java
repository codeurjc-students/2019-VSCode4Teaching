package com.vscode4teaching.vscode4teachingserver.model;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "file")
public class ExerciseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(FileViews.GeneralView.class)
    private Long id;

    @JsonView(FileViews.GeneralView.class)
    @Column(unique = true)
    private String path;

    // If null the file is a template
    @ManyToOne
    @JsonView(FileViews.OwnerView.class)
    private User owner;

    @OneToMany(mappedBy = "file", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonView(FileViews.CommentView.class)
    private List<CommentThread> comments = new ArrayList<>();

    @CreationTimestamp
    @JsonView(FileViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(FileViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public ExerciseFile(String path) {
        this.path = path;
    }

    public ExerciseFile(String path, User owner) {
        this.path = path;
        this.owner = owner;
    }

    public ExerciseFile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public List<CommentThread> getComments() {
        return comments;
    }

    public void setComments(List<CommentThread> comments) {
        this.comments = comments;
    }

    public void addCommentThread(CommentThread commentThread) {
        for (CommentThread fileCommentThread : this.getComments()) {
            if (fileCommentThread.getLine().equals(commentThread.getLine())) {
                this.getComments().remove(fileCommentThread);
                break;
            }
        }
        this.comments.add(commentThread);
    }
}