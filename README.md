# 2019-VSCode4Teaching

[![Build Status](https://travis-ci.org/codeurjc-students/2019-VSCode4Teaching.svg?branch=master)](https://travis-ci.org/codeurjc-students/2019-VSCode4Teaching)
[![Extension version](https://vsmarketplacebadge.apphb.com/version-short/VSCode4Teaching.vscode4teaching.svg)](https://marketplace.visualstudio.com/items?itemName=VSCode4Teaching.vscode4teaching)
[![Extension installs](https://vsmarketplacebadge.apphb.com/installs/VSCode4Teaching.vscode4teaching.svg)](https://marketplace.visualstudio.com/items?itemName=VSCode4Teaching.vscode4teaching)  
VSCode extension for teaching.  
Bring the programming exercises of a course directly to the student’s editor, so that the teacher of that course can check the progress of the students and help them.  
Visit this [Medium blog](https://medium.com/@ivchicano) for updates on the development of this project.  

## Table of Contents

- [Common use case](README.md#common-use-case)
- [Introduction](README.md#introduction)
- [Running, installing and development](README.md#running-installing-and-development)
- [General Roadmap](README.md#general-roadmap)

## Common use case

1. Teacher runs the server, learning how to do it from [this link](/vscode4teaching-server/README.md)
2. Teacher installs the VSCode 4 Teaching extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=VSCode4Teaching.vscode4teaching):  
    ![Teacher downloads extension from Marketplace](readme_resources/marketplace_v4t.png)
3. Teacher signs up from superuser account and logs in:  
    ![Teacher signs up using superuser account](readme_resources/superuser_teacher_signup.gif)
4. Teacher creates a course and an exercise in that course:  
    ![Teacher creates course and exercise](readme_resources/teacher_creates_exercise.gif)
5. Teachers gets the code for sharing that course to his/her students:  
    ![Teacher gets sharing code for course](readme_resources/teacher_sharing_code.gif)
6. Students install the extension and sign up:  
    ![Student signs up](readme_resources/student_signs_up.gif)
7. Students use the code from the teacher to access the course:
    ![Student downloads course and exercise](readme_resources/student_gets_course.gif)  
8. Students start solving the exercise:  
    ![Students solving exercise](readme_resources/student_solving_exercise.gif)
9. Meanwhile the teacher checks the students' progress:  
    ![Teacher checks progress](readme_resources/teacher_checks_progress.gif)
10. When they finish the exercise, they mark it as finished:  
    ![Student marks exercise as finished](readme_resources/student_finish_exercise.gif)
11. Teacher starts checking on the students' solutions and adding comments:  
    ![Teacher checks student solution and adds comment](readme_resources/teacher_creates_comment.gif)
12. Student checks the comments and responds to them:  
    ![Student replies to comment](readme_resources/student_replies_comment.gif)

## Introduction

The main features are:

- Teachers can create courses and exercises for the students.
- Students can download these exercises and upload their updated files.
- Teachers can download the students’ exercises to see their progress.  

The release comes with 2 artifacts: a server backend and the extension.
In the backend all the information is saved: courses, exercises, files… . The server is implemented as a REST API.

The extension is a frontend to interact with the server API.

There are 2 user roles: Teacher and Student.

- Teachers are capable of creating, editing, deleting, adding and removing users from courses. These courses have exercises, which have an associated template (files that serve as the base of the exercise) and each student’s files. Teachers can also download the students’ files to review them.
- Students can see these courses and exercises, download the templates and automatically upload their files to the server so that the teachers can see them.  

Animations showing the features:
In the first animation we see the teacher creating a course and then creating an exercise (and selecting the files that will be set as the template of the exercise):  
![Teacher creates exercise](readme_resources/teacher1.gif)
In the next animation, we see the student downloading this new exercise:  
![Student downloads exercise](readme_resources/student1.gif)
On the next animation the student edits one of the files and saves it, triggering the automatic file upload so that the teacher can see it (notice the lower part of the screen how a message pops up indicating this upload):  
![Student edits files](readme_resources/student2.gif)
On the next animation, we can see how the teacher selects the exercise previously created and downloads the edited files of the student that previously modified them:  
![Teacher sees student files](readme_resources/teacher2.gif)
A teacher can check differences between a students exercise and the original template:  
![Teacher sees differences](readme_resources/diff.gif)
A teacher puts a comment in a student file:  
![Teacher puts comment](readme_resources/teachercomment.gif)
The student sees the comment and responds:  
![Student sees comment and responds](readme_resources/studentcomment.gif)
Student finishes his exercise:
![Student finishes exercise](readme_resources/finishexercise.gif)
Teacher checks progress of all students in his dashboard:
![Teacher checks his dashboard](readme_resources/dashboard.png)

## Running, installing and development

For information about the server click [HERE](/vscode4teaching-server/README.md).  
For information about the extension click [HERE](/vscode4teaching-extension/README.md).

## General Roadmap

- [x] Students can download course exercises and upload his files to the server.
- [X] Teachers can see a student's exercise.
- [X] Teachers can see the differences between student files and the original templates.
- [X] File uploads and downloads should account for .gitignore rules.  
- [X] Teachers can comment on a student's exercise.  
- [X] Make easier for students to access exercises (No need to log in or have a user).
- [X] Students can mark exercises as finished.  
- [X] Teachers have a dashboard to check students progress

Note: This roadmap is subject to changes as requirements change.  
Check [Issues](https://github.com/codeurjc-students/2019-VSCode4Teaching/issues) and [Project](https://github.com/codeurjc-students/2019-VSCode4Teaching/projects) for more specific information about development of these milestones.
