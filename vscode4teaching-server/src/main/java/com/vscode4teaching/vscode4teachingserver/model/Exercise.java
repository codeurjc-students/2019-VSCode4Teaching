package com.vscode4teaching.vscode4teachingserver.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.Length;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "exercise")
public class Exercise {
    @JsonView(ExerciseViews.CodeView.class)
    private final String uuid = UUID.randomUUID().toString();
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(ExerciseViews.GeneralView.class)
    private Long id;
    @JsonView(ExerciseViews.GeneralView.class)
    @NotEmpty(message = "Name cannot be empty")
    @Length(min = 3, max = 100, message = "Exercise name should contain between 3 and 100 characters")
    private String name;
    @ManyToOne
    @JsonView(ExerciseViews.CourseView.class)
    private Course course;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ExerciseFile> template = new ArrayList<>();
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ExerciseFile> solution = new ArrayList<>();
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ExerciseFile> userFiles = new ArrayList<>();
    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ExerciseUserInfo> userInfo = new ArrayList<>();
    @JsonView(ExerciseViews.GeneralView.class)
    private boolean includesTeacherSolution;

    @JsonView(ExerciseViews.GeneralView.class)
    private boolean solutionIsPublic;

    @JsonView(ExerciseViews.GeneralView.class)
    private boolean allowEditionAfterSolutionDownloaded;

    @CreationTimestamp
    @JsonView(ExerciseViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(ExerciseViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public Exercise(
            @NotEmpty(message = "Name cannot be empty") @Length(min = 3, max = 100, message = "Exercise name should contain between 3 and 100 characters") String name,
            @Valid ExerciseFile... template) {
        this.name = name;
        this.solutionIsPublic = false;
        this.includesTeacherSolution = false;
        this.allowEditionAfterSolutionDownloaded = false;
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

    public List<ExerciseFile> getSolution() {
        return solution;
    }

    public void setSolution(@Valid List<ExerciseFile> solution) {
        this.solution = solution;
    }

    public void addFileToSolution(@Valid ExerciseFile solutionFile) {
        this.solution.add(solutionFile);
    }

    public boolean includesTeacherSolution() {
        return includesTeacherSolution;
    }

    public void setIncludesTeacherSolution(boolean includesTeacherSolution) {
        this.includesTeacherSolution = includesTeacherSolution;
    }

    public boolean solutionIsPublic() {
        return solutionIsPublic;
    }

    public void setSolutionIsPublic(boolean solutionIsPublic) {
        this.solutionIsPublic = solutionIsPublic;
    }

    public boolean isEditionAfterSolutionDownloadedAllowed() {
        return allowEditionAfterSolutionDownloaded;
    }

    public void setAllowEditionAfterSolutionDownloaded(boolean allowEditionAfterSolutionDownloaded) {
        this.allowEditionAfterSolutionDownloaded = allowEditionAfterSolutionDownloaded;
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
        return userFiles.stream().filter(file -> file.getOwner() != null && !file.getOwner().isTeacher())
                .collect(Collectors.toList());
    }

    public String getUuid() {
        return uuid;
    }

    public List<ExerciseUserInfo> getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(List<ExerciseUserInfo> userInfo) {
        this.userInfo = userInfo;
    }

}
