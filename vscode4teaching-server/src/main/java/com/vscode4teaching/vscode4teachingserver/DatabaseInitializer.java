package com.vscode4teaching.vscode4teachingserver;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.RoleRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
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
    private ExerciseFileRepository fileRepository;

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

        String studentPassword = "studentpassword";
        User teacher = new User("johndoe@teacher.com", "johndoe", passwordEncoder.encode("teacherpassword"), "John",
                "Doe");
        User student1 = new User("johndoejr@student.com", "johndoejr", passwordEncoder.encode(studentPassword),
                "John", "Doe Jr 1");
        User student2 = new User("johndoejr2@student.com", "johndoejr2", passwordEncoder.encode(studentPassword),
                "John", "Doe Jr 2");
        User student3 = new User("johndoejr3@student.com", "johndoejr3", passwordEncoder.encode(studentPassword),
                "John", "Doe Jr 3");
        List<User> users = new ArrayList<>();
        users.add(saveUser(teacher, true));
        users.add(saveUser(student1, false));
        users.add(saveUser(student2, false));
        users.add(saveUser(student3, false));

        List<Course> courses = new ArrayList<>();

        courses.add(courseRepository.save(new Course("Spring Boot Course")));
        courses.add(courseRepository.save(new Course("Angular Course")));
        courses.add(courseRepository.save(new Course("VSCode Extension API Course")));

        for (Course course : courses) {
            for (User user : users) {
                course.addUserInCourse(user);
            }
        }

        for (Course course : courses) {
            for (int j = 1; j < 6; j++) {
                String path = fileDirectory + "/" + course.getName().toLowerCase().replace(' ', '_') + "_"
                        + course.getId() + "/template/ej.html";
                File file = new File(path);
                file.getParentFile().mkdirs();
                FileWriter templateFileWriter = new FileWriter(file, false);
                try {
                    templateFileWriter.write("<html>template</html>");
                } finally {
                    templateFileWriter.close();
                }
                ExerciseFile template = new ExerciseFile(path);
                Exercise exercise = new Exercise("Exercise " + j, course, template);
                fileRepository.save(template);
                course.addExercise(exercise);
                exerciseRepository.save(exercise);
            }
            courseRepository.save(course);
        }
        String path = fileDirectory + "/" + courses.get(0).getName().toLowerCase().replace(' ', '_') + "_"
                + courses.get(0).getId() + "/johndoejr/ej.html";
        File file = new File(path);
        file.getParentFile().mkdirs();
        FileWriter c1e1s1FileWriter = new FileWriter(file, false);
        try {
            c1e1s1FileWriter.write("<html>ex done</html>");
        } finally {
            c1e1s1FileWriter.close();
        }
        c1e1s1FileWriter.close();
        ExerciseFile c1e1s1File = new ExerciseFile(path, student1);
        Exercise c1e1 = courses.get(0).getExercises().get(0);
        c1e1.addUserFile(c1e1s1File);
        fileRepository.save(c1e1s1File);
        exerciseRepository.save(c1e1);
    }
}