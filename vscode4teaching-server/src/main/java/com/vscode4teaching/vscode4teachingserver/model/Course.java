package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.Length;

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(CourseViews.GeneralView.class)
    private Long id;

    @JsonView(CourseViews.GeneralView.class)
    @NotEmpty(message = "Name cannot be null")
    @Length(min = 10, max = 100, message = "Course name should be between 10 and 100 characters")
    private String name;

    @JsonView(CourseViews.CodeView.class)
    private String uuid = UUID.randomUUID().toString();

    @OneToMany(mappedBy = "course", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonView(CourseViews.ExercisesView.class)
    private List<Exercise> exercises = new ArrayList<>();

    @ManyToMany
    @JsonView(CourseViews.UsersView.class)
    private Set<User> usersInCourse = new HashSet<>(); // Includes teachers and students

    @ManyToOne
    @JsonView(CourseViews.CreatorView.class)
    private User creator;

    @CreationTimestamp
    @JsonView(CourseViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(CourseViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public Course() {
    }

    public Course(
            @NotEmpty(message = "Name cannot be null") @Length(min = 10, max = 100, message = "Course name should be between 10 and 100 characters") String name) {
        this.name = name;
    }

    public Course(
            @NotEmpty(message = "Name cannot be null") @Length(min = 10, max = 100, message = "Course name should be between 10 and 100 characters") String name,
            List<Exercise> exercises) {
        this.name = name;
        this.exercises = exercises;
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

    public Set<User> getUsersInCourse() {
        return usersInCourse;
    }

    public void setUsersInCourse(Set<User> usersInCourse) {
        this.usersInCourse = usersInCourse;
    }

    public void addUserInCourse(User user) {
        this.usersInCourse.add(user);
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public void removeUserFromCourse(User user) {
        this.usersInCourse.remove(user);
    }

    public User getCreator() {
        return this.creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public String getUuid() {
        return uuid;
    }
}