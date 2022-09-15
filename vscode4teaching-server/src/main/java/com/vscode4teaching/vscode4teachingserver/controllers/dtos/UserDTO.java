package com.vscode4teaching.vscode4teachingserver.controllers.dtos;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;

import org.hibernate.validator.constraints.Length;

public class UserDTO {

    @Email(message = "Please provide a valid email")
    @NotEmpty(message = "Please provide an email")
    private String email;

    @Length(min = 4, max = 50, message = "Username must have between 4 and 50 characters")
    @Pattern(regexp = "^(?:(?!(template)|(solution)|(student)).)+$", message = "Username is not valid (cannot contain the words \"template\", \"solution\" or \"student\")")
    private String username;

    @NotEmpty(message = "Please provide a password")
    @Length(min = 8, message = "Password must have at least 8 characters")
    private String password;

    @NotEmpty(message = "Please provide your name")
    private String name;

    @NotEmpty(message = "Please provide your last name")
    private String lastName;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

}
