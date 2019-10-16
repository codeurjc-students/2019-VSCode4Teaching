package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepo;
    private final ExerciseRepository exerciseRepo;

    public CourseServiceImpl(CourseRepository courseRepo, ExerciseRepository exerciseRepo) {
        this.courseRepo = courseRepo;
        this.exerciseRepo = exerciseRepo;
    }

    @Override
    public List<Course> getAllCourses() {
        return this.courseRepo.findAll();
    }

    @Override
    public Course registerNewCourse(Course course) {
        return this.courseRepo.save(course);
    }

    @Override
    public Course addExerciseToCourse(Long courseId, Exercise exercise) throws CourseNotFoundException {
        Course course = this.courseRepo.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found."));
        exercise.setCourse(course);
        // Fetching exercises of course (Lazy initialization)
        course.getExercises();
        course.addExercise(exercise);
        exerciseRepo.save(exercise);
        return courseRepo.save(course);
    }

}