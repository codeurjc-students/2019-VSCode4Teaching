package com.vscode4teaching.vscode4teachingserver.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;

import org.hibernate.validator.constraints.Length;

@Entity
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(ExerciseViews.GeneralView.class)
    private Long id;

    @JsonView(ExerciseViews.GeneralView.class)
    @NotEmpty(message = "Name cannot be empty")
    @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters")
    private String name;

    @ManyToOne
    @JsonView(ExerciseViews.CourseView.class)
    private Course course;

    // TODO add files relationship

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters") String name) {
        this.name = name;
    }

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters") String name,
            Course course) {
        this.name = name;
        this.course = course;
    }

    public Exercise() {
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