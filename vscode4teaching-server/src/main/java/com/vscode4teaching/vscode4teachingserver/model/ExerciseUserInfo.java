package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseUserInfoViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name="user_info")
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
    private int status = 0;

    @CreationTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private String lastModifiedFile;

    public ExerciseUserInfo() {

    }

    public ExerciseUserInfo(Exercise exercise, User user) {
        this.exercise = exercise;
        this.user = user;
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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
        this.updateDateTime = LocalDateTime.now(ZoneOffset.UTC);
    }

    public String getLastModifiedFile() {
        return lastModifiedFile;
    }

    public void setLastModifiedFile(String lastModifiedFile) {
        if (lastModifiedFile != null) {
            this.lastModifiedFile = lastModifiedFile;
        }
    }
}