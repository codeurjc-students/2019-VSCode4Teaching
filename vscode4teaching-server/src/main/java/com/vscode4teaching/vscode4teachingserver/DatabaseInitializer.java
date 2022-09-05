package com.vscode4teaching.vscode4teachingserver;

import java.util.ArrayList;
import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.RoleRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "data.initialization", havingValue = "true", matchIfMissing = false)
@Order(0)
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ExerciseUserInfoRepository exerciseUserInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Value in application.properties
    @Value("${v4t.filedirectory}")
    private String fileDirectory;

    private void addRole(User user, String roleName) {
        Role role = roleRepository.findByRoleName(roleName);
        if (role == null) {
            role = roleRepository.save(new Role(roleName));
        }
        user.addRole(role);
    }

    private User saveUser(User user, boolean isTeacher) {
        addRole(user, "ROLE_STUDENT");
        if (isTeacher) {
            addRole(user, "ROLE_TEACHER");
        }
        return userRepository.save(user);
    }

    @Override
    public void run(String... args) throws Exception {

        User teacher = new User("johndoe@teacher.com", "johndoe", passwordEncoder.encode("teacherpassword"), "John",
                "Doe");
        User student1 = new User("johndoejr@student.com", "johndoejr", passwordEncoder.encode("studentpassword"),
                "John", "Doe Jr 1");
        User student2 = new User("johndoejr2@student.com", "johndoejr2", passwordEncoder.encode("studentpassword2"),
                "John", "Doe Jr 2");
        User student3 = new User("johndoejr3@student.com", "johndoejr3", passwordEncoder.encode("studentpassword3"),
                "John", "Doe Jr 3");
        User student4 = new User("emptyjoe@student.com", "emptyjoe", passwordEncoder.encode("emptyjoe"), "Empty",
                "Joe");
        List<User> users = new ArrayList<>();
        users.add(saveUser(teacher, true));
        users.add(saveUser(student1, false));
        users.add(saveUser(student2, false));
        users.add(saveUser(student3, false));
        saveUser(student4, false);

        List<Course> courses = new ArrayList<>();

        courses.add(courseRepository.save(new Course("Spring Boot Course")));
        courses.add(courseRepository.save(new Course("Angular Course")));
        courses.add(courseRepository.save(new Course("VSCode Extension API Course")));

        for (Course course : courses) {
            course.setCreator(teacher);
            for (User user : users) {
                course.addUserInCourse(user);
            }
        }

        for (Course course : courses) {
            for (int j = 1; j < 6; j++) {
                Exercise exercise = new Exercise("Exercise " + j);
                exercise.setCourse(course);
                course.addExercise(exercise);
                Exercise savedExercise = exerciseRepository.save(exercise);
                for (User user : users) {
                    ExerciseUserInfo eui = new ExerciseUserInfo(savedExercise, user);
                    if (course.equals(courses.get(0)) && savedExercise.getName().equals("Exercise 1")
                            && (user.equals(users.get(2)) || user.equals(users.get(3)))) {
                        eui.setStatus(1);
                    }
                    exerciseUserInfoRepository.save(eui);
                }
            }
            courseRepository.save(course);
        }
    }
}
