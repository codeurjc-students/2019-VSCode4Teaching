package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import javax.validation.constraints.NotEmpty;

import org.hibernate.validator.constraints.Length;

public class ExerciseDTO {
    @NotEmpty(message = "Name cannot be empty")
    @Length(min = 3, max = 100, message = "Exercise name should contain between 3 and 100 characters")
    public String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
