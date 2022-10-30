package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotEmpty;

public class ExerciseDTO {
    @NotEmpty(message = "Name cannot be empty")
    @Length(min = 3, max = 100, message = "Exercise name should contain between 3 and 100 characters")
    public String name;

    public boolean includesTeacherSolution;

    public boolean solutionIsPublic;

    public boolean allowEditionAfterSolutionDownloaded;
}
