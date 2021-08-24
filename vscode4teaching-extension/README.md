# VS Code 4 Teaching Extension

## Table of Contents

- [Features](README.md#features)
  - [General features](README.md#general-features)
    - [Log in](README.md#log-in)
    - [Download exercises](README.md#download-exercises)
    - [Commenting](README.md#commenting)
  - [Student features](README.md#student-features)
    - [Sign up](README.md#sign-up)
    - [Get course with code](README.md#get-course-with-code)
    - [Finish exercise](README.md#finish-exercise)
  - [Teacher features](README.md#teacher-features)
    - [Add courses](README.md#add-course)
    - [Edit course](README.md#edit-course)
    - [Delete course](README.md#delete-course)
    - [Add exercise](README.md#add-exercise)
    - [Edit exercise](README.md#edit-exercise)
    - [Delete exercise](README.md#delete-exercise)
    - [Share course with code](README.md#share-course-with-code)
    - [Add users to course](README.md#add-users-to-course)
    - [Remove users from course](README.md#remove-users-from-course)
    - [Difference between template and student file](README.md#difference-between-template-and-student-file)
    - [Sign up teacher](README.md#sign-up-teacher)
    - [Dashboard](README.md#dashboard)
    - [LiveShare](README.md#liveshare)
- [Installing](README.md#installing)
- [Development](README.md#development)
  - [Prerequisites](README.md#prerequisites)
  - [Compiling](README.md#compiling)
  - [Running tests](README.md#running-tests)
  - [Other options](README.md#other-options)

## Features

VS Code 4 Teaching extension features a new view accessible from the V4T icon in the activity bar.

### General features

#### Log in

You will need to log in to the server first to do anything. Session is stored until it expires or user logs out.  
![Login](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/Login.gif)

#### Download exercises

You can get the exercise template or your own files by clicking on an exercise.  
For students: editing files will trigger an automatic upload of new changes.  
Files in .gitignore will be ignored on automatic uploads.  
![Download exercises](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/DownloadExercise.gif)

#### Commenting

Students and teachers can comment on files and respond to comments.  
![Commenting](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/readme_resources/studentcomment.gif)

### Student features

### Sign up

You have to sign up if you are a student and already don't have an account.  
![Student signing up](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/SignupStudent.gif)

#### Get course with code

Students can get access to a course if they have the sharing code. You will be given this code from a teacher.  
![Student gets course with code](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/ShareCourseStudent.gif)

#### Finish exercise

Students can mark their exercises as finished to help the teacher check on their progress. This will make it so any changes to the exercise won't be uploaded.  
![Student finishes exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/readme_resources/finishexercise.gif)

### Teacher features

#### Get student files

If you are a teacher, clicking on an exercise will instead download the files of all students so that you can see their progress.  
![Get student files](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/GetStudentFiles.gif)

#### Add Course

A teacher can create new courses. Courses contain exercises that can be shared together.  
![Add courses](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/AddCourse.gif)

#### Edit course

The creator of a course can edit his/her courses.  
![Edit course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/EditCourse.gif)

#### Delete course

The creator of a course can delete his/her courses.  
![Delete course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/DeleteCourse.gif)

#### Add exercise

The teachers of a course can add exercises to that course. It will ask for a name and files to upload as a template. An exercise i a set of template files that the students will download, making modifications over them. This modifications will be saved as another folder when the teachers download the exercise.  
Files in .gitignore will be ignored.  
![Add exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/AddExercise.gif)

#### Edit exercise

The teacher of a course can edit the exercises's name.  
![Edit exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/EditExercise.gif)

#### Delete exercise

The teacher of a course can delete the exercises.  
![Delete exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/DeleteExercise.gif)

#### Share course with code

Teachers can share their courses with a code that students can use to retrieve said course.  
![Teacher gets code](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/ShareCourseTeacher.gif)

#### Add users to course

The teachers of a course can also manually add students and teachers to the course. This is the only way to add teachers to a course.  
![Add users to course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/AddUsersCourse.gif)

#### Remove users from course

The teachers of a course can remove students and teachers from a course.  
![Remove users from course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/RemoveUsersCourse.gif)

#### Difference between template and student file

Teachers can get the differences between a template file and its corresponding file in a students exercise.  
Beware that the files must be called the same and reside in the same directory for it to work.  
![Differences](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/readme_resources/diff.gif)

#### Sign up teacher

Teachers can sign up another teacher in the application.  
![Teacher signs up teacher](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/vscode4teaching-extension/doc_images/SignupTeacher.gif)

#### Dashboard

Teachers have a dashboard per exercise to check on their students' progress. They can also open the last modified file by a student as a quick access from dashboard, or see the difference (Diff) between the template and this file. Dashboard will be refreshed automatically every time a change is made by a student.
![Teacher dashboard](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/readme_resources/dashboard.png)

#### Liveshare

Users can start a liveshare session from a dashboard.
![Liveshare](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/HEAD/readme_resources/liveshare.gif)

## Installing

The best way to install the extension is through the Marketplace in Visual Studio Code.
Go to the Extensions on the left (Ctrl + Shift + X) and search for "VS Code 4 Teaching". It should appear the first on the list, from there you can just click Install to install it.

## Development

### Prerequisites

- Visual Studio Code: <https://code.visualstudio.com/>
- Node.js: <https://nodejs.org>
- Git: <https://git-scm.com/>

### Compiling

Open the vscode4teaching-extension folder with VS Code and press F5. This will compile and run the extension in a new Extension Development Host window.
For more information about packaging and publishing see <https://code.visualstudio.com/api/working-with-extensions/publishing-extension>

### Running tests

Use the following command to run all tests:  
`npm test`  

### Other options

You can compile the minified version running:

`npm run vscode:prepublish`

You can compile a build with sourcemaps for easier debugging with:

`npm run build`

You can compile an unbundled version (used mainly in tests) with:

`npm run test-compile`

You can pass a linter with:

`npm run lint`

You can get test coverage with:

`npm run coverage`
