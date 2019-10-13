package com.vscode4teaching.vscode4teachingserver.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.validators.ValidationGroupInterfaces.OnCreate;
import com.vscode4teaching.vscode4teachingserver.model.validators.ValidationGroupInterfaces.OnUpdate;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(CourseViews.GeneralView.class)
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    private Long id;

    @JsonView(CourseViews.GeneralView.class)
    @NotNull(groups = OnCreate.class)
    private String name;

    @OneToMany(mappedBy = "course")
    @JsonView(CourseViews.ExercisesView.class)
    private List<Exercise> exercises = new ArrayList<>();

    // TODO add user relationship

    public Course() {
    }

    public Course(@NotNull String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }

    public void addExercise(Exercise exercise) {
        this.exercises.add(exercise);
    }
}