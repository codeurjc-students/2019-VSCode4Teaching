package com.vscode4teaching.vscode4teachingserver.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.validators.ValidationGroupInterfaces.OnCreate;
import com.vscode4teaching.vscode4teachingserver.model.validators.ValidationGroupInterfaces.OnUpdate;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;

@Entity
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(ExerciseViews.GeneralView.class)
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    private Long id;

    @JsonView(ExerciseViews.GeneralView.class)
    @NotNull(groups = OnCreate.class)
    private String name;

    @ManyToOne
    @JsonView(ExerciseViews.CourseView.class)
    private Course course;

    // TODO add files relationship

    public Exercise() {
    }

    public Exercise(String name, Course course) {
        this.name = name;
        this.course = course;
    }

    public Exercise(String name) {
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

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

}