package com.vscode4teaching.vscode4teachingserver.controllers;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ViewController {

    private final CourseService courseService;

    public ViewController(CourseService courseService){
        this.courseService = courseService;
    }

    @RequestMapping("/")
    public String loadHome(@RequestParam(required = false) String code, Model model) {
        if (code != null) {
            Course course;
            try{
                course = courseService.getCourseInformationWithSharingCode(code);
            } catch (CourseNotFoundException cnfe){
                course = null;
                code = null;
            }
            model.addAttribute("code", code);
            model.addAttribute("course", course);
        }
        return "index";
    }
}