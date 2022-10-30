<!-- Note: this README is exposed as description of extension in Visual Studio Code Marketplace -->

# VSCode4Teaching - Extension

The Visual Studio Code extension is one of the components of *VSCode4Teaching*, which is a educational application that brings the programming exercises of a course directly to the student’s editor, so that the teacher of that course can check the progress of the students and help them.

This document introduces a user's guide to the application and a developer's guide to the technical issues of the extension. The complete documentation of the application can be found in the [README of its repository](https://github.com/codeurjc-students/2019-VSCode4Teaching/blob/master/README.md).

## Table of contents
- [User guide](#user-guide)
  - [How to use VSCode4Teaching: user roles and functionalities](#how-to-use-vscode4teaching-user-roles-and-functionalities)
    - [Teachers](#teachers)
    - [Students](#students)
  - [Download and installation](#download-and-installation)
  - [Typical use cases](#typical-use-cases)
- [Developer guide](#developer-guide)
  - [Development](#development)
    - [Involved technologies](#involved-technologies)
  - [Build](#build)
  - [Execution](#execution)

## User guide

**Sections**
- [How to use VSCode4Teaching: user roles and functionalities](#how-to-use-vscode4teaching-user-roles-and-functionalities)
  - [Teachers](#teachers)
  - [Students](#students)
- [Download and installation](#download-and-installation)
- [Typical use cases](#typical-use-cases)

### How to use VSCode4Teaching: user roles and functionalities
VSCode4Teaching users can be either [teachers](#teachers) or [students](#students).

#### Teachers
**Teachers** can create, modify and delete courses on the platform, and each course can contain several exercises. In this way, teachers can add exercises (one at a time or in bulk) based on pre-existing code templates, proposing students to work on these templates. In addition, they can provide solution proposals for the exercises so that students can compare them with their own proposals when they finish their own exercises.

- Teachers can either manually enroll students in their courses using the buttons provided in each course or generate a sharing link to send to their students, who will open it in a browser where they will see a help screen explaining how to enroll in the course.
[![Image showing all the possibilities to register users](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/SharingAddRemoveUsers.png)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/SharingAddRemoveUsers.png)
- Teachers can create, modify and delete exercises in their courses. To create them, they can do it one at a time or in bulk, for which they have two different buttons. They must provide a directory containing, in the first case, all the files that will be linked to the exercise created and, in the second case, a subdirectory for each of the exercises to be created.
[![Image showing all the possibilities to add new exercises](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/AddSingleMultipleExercises.png)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/AddSingleMultipleExercises.png)
- Teachers can include a predefined solution proposal in the exercises when uploading them. To do this, the directory of each exercise (regardless of the uploading procedure executed) should contain only two subdirectories: ``template`` (containing the exercise template) and ``solution`` (containing the teacher's solution proposal).
[![Animated image of the simultaneous uploading of several exercises with solution included](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/AddMultipleExercisesWithSolution.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/AddMultipleExercisesWithSolution.gif)
- Teachers can display a _dashboard_ for each exercise, which is a screen that allows them to get a real-time view of the students' progress and to modify some exercise settings. It contains three sections:
  - The "General statistics" section, where an overall progress graph and numerical values on how many students have completed, are in progress, or have not started an exercise, as well as how many have modified their exercise in the last 5 minutes, 30 minutes, 1 hour, and 2 hours, can be seen.
  - The "Exercise configuration" section, which includes a dropdown panel with a quick guide to the exercise controls included in the _dashboard_ and, if the exercise includes a solution, two controls to modify the availability of the solution to students and to determine whether editing of the exercise is allowed once the solution is downloaded.
  - The "Student's progress" section, which includes a table that allows to visualize the individual data of each student, displaying the status of the exercise for each of them, which files have been created, modified or deleted and, in addition, to see graphically the differences between the students' files and the template originally added by the teacher.

  [![Animated image of the teacher's dashboard of an exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherLightDashboardHideButton.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherLightDashboardHideButton.gif)
- Teachers can visualize in their file system the students' exercises saved in an anonymized way, which will be synchronized in real time as they are completed by the students. To find out which directory corresponds to which student, the teacher will have to use the _dashboard_.
[![Animated image of the download of an exercise by a teacher, including template, solution and all student proposals](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherDownloadsExercise.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherDownloadsExercise.gif)
- Specifically for exercises with solution, teachers can make it available by using the checkboxes introduced for this purpose in the _dashboard_. There are two controls: "allow editing after downloading solution", which allows teachers to determine whether students can continue to modify an exercise once the solution has been downloaded; and "publish solution", which allows teachers to choose when the proposed solution is published to students, this being an irreversible change.
[![Animated image showing modifications to the controls](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherChangesExerciseSettings.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherChangesExerciseSettings.gif)

#### Students
**Students**, on the other hand, can join courses and complete the exercises proposed by their teachers.
- To join courses, students must wait for a teacher to register them manually or they can receive an invitation link from the teacher. When opening the link in a web browser, students can view a help page that explains textually and graphically how to register for courses and how to use the extension in detail.
[![Animated image of the process to get the link to share courses and enroll from the help page](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/SharingLinkGetCourseCode.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/SharingLinkGetCourseCode.gif)
- When students start a new exercise, the template proposed by the teacher is downloaded to their local file system to be filled in.
[![Animated image of a student downloading and activating an exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentDownloadsExercise.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentDownloadsExercise.gif)
- Once an exercise has been completed, students have a button to indicate to the teacher that the exercise has been completed and, from that moment on, it will not be possible to edit the proposed submission.
[![Animated image showing the process of completion of an exercise](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentFinishingExercise.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentFinishingExercise.gif)
- In case a student is performing an exercise and the teacher communicates that his or her solution is already available, he or she can download it by reloading and using the button at the bottom. As determined by the teacher, this action may imply the completion of the exercise (the student is informed in a warning before downloading).
[![Animated image of the extension reloading and downloading of the active exercise solution](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentRefreshDownloadSolution.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentRefreshDownloadSolution.gif)
- Once the solution is downloaded, students can use the "Diff with teacher's solution" button to check the differences between their proposal and the exercise solution created by the teacher.
[![Imagen animada de la visualización de diferencias entre la propuesta del estudiante y la solución del profesor](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentChecksDiffWithSolution.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentChecksDiffWithSolution.gif)

### Download and installation
To start using VSCode4Teaching as a user in your local Visual Studio Code installation, you need to:
- Access the Visual Studio Code *Marketplace* by clicking on the corresponding icon in the sidebar.
- Search for the extension using the top bar ("VSCode4Teaching").
- Install the latest available version and all required dependencies (like, for example, the *LiveShare* extension). A prompt will be displayed when installing in the IDE so as to install the associated dependencies.
  [![Animated image showing the installation process of the extension from the Marketplace](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/InstallExtension.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/InstallExtension.gif)

- When the extension is installed, it could be necessary to change its own settings to modify the local directory used or the URL of the server. These preferences can be set in the IDE preferences within the extension's specific section.
  [![Imagen mostrando las preferencias específicas de la extensión en Visual Studio Code](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/VSCodeSettingsView.png)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/VSCodeSettingsView.png)

### Typical use cases
Some of the main use cases of user-system and user-to-user interaction in VSCode4Teaching are introduced below in textual and graphical sequence format.

Note: it is possible to enlarge the inserted images and GIFs by clicking on them.

#### Teacher invitation and registration
For this case two users are assumed: Teacher 1 (previously registered teacher) and Teacher 2 (new teacher), so that Teacher 1 invites Teacher 2 to register as a new teacher on the platform.

| Teacher 1 | Teacher 2 |
| :-------: | :-------: |
| **1**. The user logs in. [![Animated image showing the login of a previously registered teacher](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherLogsIn.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherLogsIn.gif) | |
| **2**. The user fills in the invitation for the new teacher using the button and the form provided for this purpose. You must enter: name and surname, e-mail and user name of the new teacher. | |
| **3**. An invitation link is generated. It has to be sent to the new teacher. [![Animated image showing the process for inviting a new teacher to the extension](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherInvitingTeacher.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherInvitingTeacher.gif) | |
| | **4**. The new teacher will open the link received in a browser to complete the registration process. To do so, they enter their user name (for identity verification) and choose their new password. [![Animated image showing the process for changing the password of a new teacher](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherChangingPassword.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherChangingPassword.gif) |
| | **5**. Done! The new teacher can now log in to VSCode4Teaching successfully. [![Animated image showing the login of a previously registered teacher](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/NewTeacherLogsIn.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/NewTeacherLogsIn.gif) |

#### Course creation and student participation
In this case, a teacher logs in, creates a subject, adds exercises and invites students who, once enrolled, proceed to fill in the exercises and send them to the teacher.

| Teacher | Student |
| :-----: | :-----: |
| **1**. The user logs in. [![Animated image showing teacher login](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/NewTeacherLogsIn.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/NewTeacherLogsIn.gif) | |
| **2**. The user creates a new course. [![Animated image showing the process of creating a new course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherCreatesCourse.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherCreatesCourse.gif) | |
| **3**. The user adds some new exercises in bulk. [![Animated image showing the process of simultaneous exercise uploading](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherBulkAddsExercises.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherBulkAddsExercises.gif) | |
| **4**. The user generates the course invitation link and sends it to one (or more) students. [![Animated image showing how a teacher generates a link to share a course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherGeneratesSharingLink.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/TeacherGeneratesSharingLink.gif) | |
| | **5**. The student accesses the link in a web browser, where they can view a help page and copy a specific code to join the course. [![Animated image showing the help page for enrolling in a course](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentChecksHelpPage.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentChecksHelpPage.gif) |
| | **6**. The student uses the code copied in the extension to join the course shared by their teacher. [![Animated image showing how the student registers for a course by entering the code obtained](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentJoinsCourse.gif)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/StudentJoinsCourse.gif) |


## Developer guide

This developer guide covers only the contents related to the Visual Studio Code extension component. For more information on the development of the other components, please refer to the [main README](https://github.com/codeurjc-students/2019-VSCode4Teaching/blob/master/README.md#developer-guide) of the application.

### Development
The Visual Studio Code extension *VSCode4Teaching* is based on the Node.js platform and acts as a *frontend*, being the component that is installed in the IDE and allows users to use an intuitive and friendly GUI to interact with the backend and thus be able to access all the functionality of the application. Although it is server-independent in terms of code, it is necessary to configure a connection to a VSCode4Teaching server to be able to use the functionality of this extension.

#### Involved technologies
The extensions for Visual Studio Code are based on Node.js, the main associated technologies being the following:
- [Visual Studio Code](https://code.visualstudio.com). It is the integrated development environment for which the extension is developed. It is *open source* and is indispensable to be able to execute the extension.
- [Node.js](https://nodejs.org). It is a JavaScript-based applications execution engine.
- [npm](https://www.npmjs.com). It is the dependency manager used by default in Node.js applications.
- [TypeScript](https://www.typescriptlang.org). It is a programming language that compiles to JavaScript and allows using strong typing to implement JavaScript and Node.js applications.

### Build
It is necessary to use Visual Studio Code as IDE to implement and test the extension. Some of the most used commands and functionalities for building the extension are:
- Press ``F5`` to run the extension in a new test window, allowing to debug its operation in the IDE.
- Execute the ``npm run vscode:prepublish`` command to compile a minified version of the extension in VSIX format. Alternatively, you can also compile the extension in the same format by entering the sourcemaps with the ``npm run build`` command.
- To run tests of the extension (based on Jest), the ``npm test`` command can be launched. Information about the test coverage can be obtained with the ``npm run coverage`` command.

### Execution
The extension starts automatically when Visual Studio Code is opened if it is installed. It can be installed in two ways:
- Using the Marketplace, where several versions of the extension are available.
- Building the source code provided as indicated and installing the extension in VSIX format using the "Install from VSIX" option available in the context menu of the Extensions panel.

Once installed, it may be necessary to modify the server and download directory settings. To do this, in the IDE preferences, it is necessary to look for the VSCode4Teaching preferences, which look as follows:
[![Extension Settings in Visual Studio Code](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/VSCodeSettingsView.png)](https://github.com/codeurjc-students/2019-VSCode4Teaching/raw/master/docs-resources/VSCodeSettingsView.png)
