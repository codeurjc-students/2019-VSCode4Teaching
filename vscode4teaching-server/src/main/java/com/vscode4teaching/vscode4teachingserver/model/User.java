package com.vscode4teaching.vscode4teachingserver.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.UserViews;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.Length;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(UserViews.GeneralView.class)
    private Long id;

    @Email(message = "Please provide a valid email")
    @NotEmpty(message = "Please provide an email")
    @JsonView(UserViews.EmailView.class)
    @Column(unique = true)
    private String email;

    @Length(min = 4, max = 50, message = "Your username must have between 4 and 50 characters")
    @Pattern(regexp = "^(?:(?!template).)+$", message = "Username is not valid")
    @JsonView(UserViews.GeneralView.class)
    @Column(unique = true)
    private String username;

    @NotEmpty(message = "Please provide a password")
    @Length(min = 8, message = "Your password must have at least 8 characters")
    @JsonIgnore
    private String password;

    @NotEmpty(message = "Please provide your name")
    @JsonView(UserViews.GeneralView.class)
    private String name;

    @NotEmpty(message = "Please provide your last name")
    @JsonView(UserViews.GeneralView.class)
    private String lastName;

    @ManyToMany(fetch = FetchType.EAGER)
    @JsonView(UserViews.GeneralView.class)
    private List<Role> roles = new ArrayList<>();

    @ManyToMany(mappedBy = "usersInCourse")
    @JsonView(UserViews.CourseView.class)
    private List<Course> courses = new ArrayList<>();

    @CreationTimestamp
    @JsonView(UserViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(UserViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public User() {
    }

    public User(
            @Email(message = "Please provide a valid email") @NotEmpty(message = "Please provide an email") String email,
            @Length(min = 4, max = 50, message = "Your username must have between 4 and 50 characters") String username,
            @NotEmpty(message = "Please provide a password") String password,
            @NotEmpty(message = "Please provide your name") String name,
            @NotEmpty(message = "Please provide your last name") String lastName, Role... roles) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.name = name;
        this.lastName = lastName;
        this.roles.addAll(Arrays.asList(roles));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }

    public void addCourse(Course course) {
        this.courses.add(course);
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public boolean isTeacher() {
        for (Role role : this.roles) {
            if (role.getRoleName().equals("ROLE_TEACHER")) {
                return true;
            }
        }
        return false;
    }
}