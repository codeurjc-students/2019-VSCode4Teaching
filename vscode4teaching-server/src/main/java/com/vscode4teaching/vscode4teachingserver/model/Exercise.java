package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
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

    @OneToMany(cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<ExerciseFile> template = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<ExerciseFile> userFiles = new ArrayList<>();

    @JsonView(ExerciseViews.CodeView.class)
    private String uuid = UUID.randomUUID().toString();

    @CreationTimestamp
    @JsonView(ExerciseViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(ExerciseViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters") String name) {
        this.name = name;
    }

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters") String name,
            @Valid Course course, @Valid List<ExerciseFile> template) {
        this.name = name;
        this.course = course;
        this.template = template;
    }

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 10, max = 100, message = "Exercise name should be between 10 and 100 characters") String name,
            @Valid Course course, @Valid ExerciseFile... template) {
        this.name = name;
        this.course = course;
        this.template = Arrays.asList(template);
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

    public void setCourse(@Valid Course course) {
        this.course = course;
    }

    public List<ExerciseFile> getUserFiles() {
        return userFiles;
    }

    public void setUserFiles(@Valid List<ExerciseFile> userFiles) {
        this.userFiles = userFiles;
    }

    public void addUserFile(@Valid ExerciseFile userFile) {
        this.userFiles.add(userFile);
    }

    public List<ExerciseFile> getTemplate() {
        return template;
    }

    public void setTemplate(@Valid List<ExerciseFile> template) {
        this.template = template;
    }

    public void addFileToTemplate(@Valid ExerciseFile templateFile) {
        this.template.add(templateFile);
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public List<ExerciseFile> getFilesByOwner(String username) {
        return userFiles.stream()
                .filter(file -> file.getOwner() != null && file.getOwner().getUsername().equals(username))
                .collect(Collectors.toList());
    }

    public List<ExerciseFile> getFilesByOwner(Long userId) {
        return userFiles.stream().filter(file -> file.getOwner() != null && file.getOwner().getId().equals(userId))
                .collect(Collectors.toList());
    }

    public List<ExerciseFile> getStudentOnlyFiles() {
        return userFiles.stream()
                .filter(file -> file.getOwner() != null && file.getOwner().getRoles().size() == 1 && file.getOwner()
                        .getRoles().stream().filter(role -> role.getRoleName().equals("ROLE_STUDENT")).count() == 1)
                .collect(Collectors.toList());
    }

    public String getUuid() {
        return uuid;
    }
}