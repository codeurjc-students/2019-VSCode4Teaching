package com.vscode4teaching.vscode4teachingserver;

import java.util.ArrayList;
import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.JWTUserDetailsService;

import org.springframework.beans.factory.annotation.Autowired;
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
    private JWTUserDetailsService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        List<Course> courses = new ArrayList<>();

        courses.add(courseRepository.save(new Course("Spring Boot Course")));
        courses.add(courseRepository.save(new Course("Angular Course")));
        courses.add(courseRepository.save(new Course("VSCode Extension API Course")));

        for (int i = 0; i < 3; i++) {
            Course course = courses.get(i);
            for (int j = 1; j < 6; j++) {
                Exercise exercise = new Exercise("Exercise " + j);
                exercise.setCourse(course);
                course.addExercise(exercise);
                exerciseRepository.save(exercise);
                courseRepository.save(course);
            }
        }

        userService.save(new User("johndoe@teacher.com", "johndoe", passwordEncoder.encode("teacherpassword"), "John", "Doe"), true);
        userService.save(new User("johndoejr@student.com", "johndoejr", passwordEncoder.encode("studentpassword"), "John", "Doe Jr"), false);
    }
    
}