# 2019-VSCode4Teaching

[![Build Status](https://travis-ci.org/codeurjc-students/2019-VSCode4Teaching.svg?branch=master)](https://travis-ci.org/codeurjc-students/2019-VSCode4Teaching)  
VSCode extension for teaching.  
Bring the programming exercises of a course directly to the student’s editor, so that the teacher of that course can check the progress of the students and help them.  
Visit this [Medium blog](https://medium.com/@ivchicano) for updates on the development of this project.  

## Table of Contents

- [Introduction](README.md#introduction)
- [General Roadmap](README.md#general-roadmap)
- [Running, installing and development](README.md#running-installing-and-development)

## Introduction

Current version includes the following functionality:

- Teachers can create courses and exercises for the students.
- Students can download these exercises and upload their updated files.
- Teachers can download the students’ exercises to see their progress.  

The release comes with 2 artifacts: a server and the extension.
In the centralized server all the information is saved: courses, exercises, files… . The server is implemented as a REST API.

The extension is a frontend to interact with the server API.

The model of the application can be described as follows:
There are 2 user roles: Teacher and Student.

- Teachers are capable of creating, editing, deleting, adding and removing users from courses. These courses have exercises, which have an associated template (files that serve as the base of the exercise) and each student’s files. Teachers can also download the students’ files to review them.
- Students can see these courses and exercises, download the templates and automatically upload their files to the server so that the teachers can see them.  

Animations showing the features:
In the first animation we see the teacher creating a course and then creating an exercise (and selecting the files that will be set as the template of the exercise)
![Teacher creates exercise](readme_resources/teacher1.gif)
In the next animation, we see the student downloading this new exercise:
![Student downloads exercise](readme_resources/student1.gif)
On the next animation the student edits one of the files and saves it, triggering the automatic file upload so that the teacher can see it (notice the lower part of the screen how a message pops up indicating this upload).
![Student edits files](readme_resources/student2.gif)
On the next animation, we can see how the teacher selects the exercise previously created and downloads the edited files of the student that previously modified them.
![Teacher sees student files](readme_resources/teacher2.gif)
A teacher can check differences between a students exercise and the original template
![Teacher sees differences](readme_resources/diff.gif)
A teacher puts a comment in a student file
![Teacher puts comment](readme_resources/teachercomment.gif)
The student sees the comment and responds.
![Student sees comment and responds](readme_resources/studentcomment.gif)

## General Roadmap

- [x] Students can download course exercises and upload his files to the server.
- [X] Teachers can see a student's exercise.
- [X] Teachers can see the differences between student files and the original templates.
- [X] File uploads and downloads should account for .gitignore rules.  
- [X] Teachers can comment on a student's exercise.  
- [ ] Make easier for students to access exercises (No need to log in or have a user).
- [ ] Students can mark exercises as finished.  

Note: This roadmap is subject to changes as requirements change.  
Check [Issues](https://github.com/codeurjc-students/2019-VSCode4Teaching/issues) and [Project](https://github.com/codeurjc-students/2019-VSCode4Teaching/projects) for more specific information about development of these milestones.

## Running, installing and development

For information about the server click [HERE](/vscode4teaching-server/README.md).  
For information about the extension click [HERE](/vscode4teaching-extension/README.md).
