package com.vscode4teaching.vscode4teachingserver.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@CrossOrigin
public class ViewController {
    @GetMapping({"", "/"})
    public String redirect() {
        return "forward:/app";
    }

    @GetMapping({"/app/**/{path:[^\\.]*}", "/{path:app[^\\.]*}"})
    public String serveAngularWebapp() {
        return "forward:/index.html";
    }
}
