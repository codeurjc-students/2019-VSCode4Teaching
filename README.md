# 2019-VSCode4Teaching
VSCode extension for teaching.  
Bring the programming exercises of a course directly to the student’s editor, so that the teacher of that course can check the progress of the students and help them.  
Visit this [Medium blog](https://medium.com/@ivchicano) for updates on the development of this project.  
## General Roadmap
- [ ] Students can download course exercises.
- [ ] Teachers can see a student's exercise.
- [ ] Teachers can place requisites on each exercise for the student to accomplish.
- [ ] Teachers can comment on a student's exercise.  
Note: This roadmap is subject to changes as requirements change.  
Check [Issues](https://github.com/codeurjc-students/2019-VSCode4Teaching/issues) and [Project](https://github.com/codeurjc-students/2019-VSCode4Teaching/projects) for more specific information about development of these milestones.
## Installing
TODO: When the first release is made this will be updated.
## Getting started on development
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites (server)
* JDK (Version 8 or higher): [Link](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* Recommended: Maven: [Link](https://maven.apache.org/download.cgi)
* Recommended: Spring Tools: [Link](https://spring.io/tools)
* Optional: Docker: [Link](https://www.docker.com/)
### Compiling (server)
Note: If you don't have maven installed there is a maven wrapper inside the __server__ directory, instead of running maven as __mvn__ you can run it as __./mvnw__. This needs execute permissions.  
In a terminal, inside the server directory (there should be the pom.xml file in there) run the following command:  
`mvn install`  
You can run the server with the following command:  
`java -jar ./target/vscode4teaching-server-0.0.1-SNAPSHOT.jar`  
Note that the name of the .jar file can change depending on the version of the server you're running.  
### Running tests
You can run the tests with the following command in a terminal inside the __server__ directory.  
`mvn test`  
### Docker (server)
You can build the server image with the command:  
`docker build .`  
Also you can download the image from Docker Hub:  
`docker pull ivchicano/vscode4teaching-server`  
You can run a docker compose with the image and a mysql database by going to the __docker__ directory inside the server directory and running the following command:  
`docker-compose up`