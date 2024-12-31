package es.codeurjc.vscode4teaching.controllers.dtos;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotEmpty;

public class CourseDTO {
    @NotEmpty
    @Length(min = 10, max = 100, message = "Course name should be between 10 and 100 characters")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


}