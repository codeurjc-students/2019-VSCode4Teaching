package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import javax.validation.constraints.NotEmpty;

import org.hibernate.validator.constraints.Length;

public class CourseDTO {
    @NotEmpty(message = "Name cannot be null")
    @Length(min = 10, max = 100, message = "Course name should be between 10 and 100 characters")
    public String name;
}