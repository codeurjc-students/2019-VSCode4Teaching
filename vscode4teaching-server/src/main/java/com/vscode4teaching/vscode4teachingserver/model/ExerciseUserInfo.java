package com.vscode4teaching.vscode4teachingserver.model;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseUserInfoViews;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_info")
public class ExerciseUserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private Long id;

    @ManyToOne
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private Exercise exercise;

    @ManyToOne
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private User user;

    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private ExerciseStatus status = ExerciseStatus.NOT_STARTED;

    @CreationTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    @ElementCollection
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private Set<String> modifiedFiles = new HashSet<>();

    public ExerciseUserInfo() {

    }

    public ExerciseUserInfo(Exercise exercise, User user) {
        this.exercise = exercise;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
        this.updateDateTime = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
        this.updateDateTime = LocalDateTime.now(ZoneOffset.UTC);
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.updateDateTime = LocalDateTime.now(ZoneOffset.UTC);
    }

    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
        this.updateDateTime = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Set<String> getModifiedFiles() {
        return modifiedFiles;
    }

    public void setModifiedFiles(Set<String> modifiedFiles) {
        this.modifiedFiles = modifiedFiles;
    }

    public void addModifiedFiles(Collection<String> modifiedFiles) {
        if (modifiedFiles != null) {
            this.modifiedFiles.addAll(modifiedFiles);
        }
    }
}
