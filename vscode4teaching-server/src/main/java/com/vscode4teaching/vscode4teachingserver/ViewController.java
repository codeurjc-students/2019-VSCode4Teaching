package com.vscode4teaching.vscode4teachingserver;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {
    @RequestMapping("/")
    public String loadHome() {
        return "index";
    }
}
