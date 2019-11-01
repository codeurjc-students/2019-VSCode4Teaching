# VS Code 4 Teaching Server

## Table of Contents

- [REST API Documentation](README.md#rest-api-documentation)
- [Database Initializer](README.md#database-initializer)
- [Installing](README.md#installing)
  - [Arguments/Environment variables](README.md#argumentsenvironment-variables)
- [Development](README.md#development)
  - [Prerequisites](README.md#prerequisites)
  - [Compiling](README.md#compiling)
  - [Running tests](README.md#running-tests)
- [Docker](README.md#docker)

## REST API Documentation

Click [HERE](API.md) for the documentation on the REST API running on the server.  

## Database Initializer  

The data.sql file in resources will initialize some data to the database. These include:  

- Users:
  - Teacher:  
    - username: `johndoe`  
    - password: `teacherpassword`  
  - Students:  
    - Student 1:  
      - username: `johndoejr`  
      - password: `studentpassword`  
    - Student 2:  
      - username: `johndoejr2`  
      - password: `studentpassword`  
    - Student 3:  
      - username: `johndoejr3`  
      - password: `studentpassword`  
- Courses: Spring Boot Course, Angular Course, VSCode Extension API Course. Each course has every user above as a participant or teacher.  
- Exercises: each course has 5 exercises: Exercise 1, Exercise 2 and so on.  
File data is not included (see below).  

Also, if the directory specified in the `v4t.filedirectory` property exists, the server will try to initialize the files' data in the database, along with everything it needs.
First, it will search for the ids of the courses (eg.: if there is a folder spring_boot_course_11 it will try to find course with id 11). Then, it will try to find the exercises ids inside that course. Last, for the template and each user in that folder it will try to find all files and save all information needed in the database.
If at any point an element does not exist, it will be ignored (eg.: a course has not been found).  

All of this is configurable (See [Arguments/Environment variables](README.md#argumentsenvironment-variables)).

## Installing

The server needs a directory with read and write permissions to save exercises' files.  
It is recommended to use docker-compose to run the server. [Link to the section about Docker](README.md#Docker).  
If you want to run the application standalone, check below for information:  
Important: the server needs a MySQL database running. Check below for possible arguments for configuring database host, user, password, etc.  
No installation required, just run the JAR file as follows.  
`java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar`  
Where `vscode4teaching-server-0.0.1-SNAPSHOT.jar` is the route of the JAR file in you file system.  
Note that the name of the .jar file can change depending on the version of the server you're running.  

### Arguments/Environment variables

You can pass arguments to the command to change default configurations. You can also have environment variables set for the configurations to apply.
List of allowed arguments:

- --server.port=[number]
  Set the port the server will run in.
  Default: 8080  
  Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --server.port=9090`
- --spring.datasource.url=[jdbc:mysql://url]  
  Database host url.  
  Default: jdbc:mysql://localhost:3306/vsc4teach  
  Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --spring.datasource.url=jdbc:mysql://localhost:3306/vsc4teach`
- --spring.datasource.username=[username]  
  Database username.  
  Default: root  
  Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --spring.datasource.username=root`
- --spring.datasource.password=[password]  
  Database password.  
  Default: [Empty]  
  Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --spring.datasource.password=root`
- --jwt.secret=[key]  
   Secret key for JWT. IMPORTANT TO CHANGE IN PRODUCTION ENVIRONMENT.  
   Default: vscode4teaching  
   Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --jwt.secret=vscode4teaching`
- --v4t.filedirectory=[directory]
    Directory where the exercises' files will be saved.
    Default: v4t-course  
    Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --v4t.filedirectory=C:\v4tfiles`
- --file.initialization=[true|false]
    Indicates whether to initialize file information in the database or not.
    Default: true
    Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --file.initialization=false`
- --spring.datasource.initialization-mode=[always|none]
    Indicates whether to initialize demo database information or not.
    Default: always
    Example: `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --spring.datasource.initialization-mode=none`
  Example with all arguments:  
  `java -jar vscode4teaching-server-0.0.1-SNAPSHOT.jar --server.port=9090 --spring.datasource.url=jdbc:mysql://localhost:3306/vsc4teach --spring.datasource.username=root --spring.datasource.password=root --jwt.secret=vscode4teaching --v4t.filedirectory=courses --file.initialization=false --spring.datasource.initialization-mode=none`

  For environment variables, just choose an argument above, put it in all caps and change the . (dots) into \_ (underscores) eg.: SPRING_DATASOURCE_URL
  and set the value to the value desired (see the examples above for guidance).

## Development

### Prerequisites

- JDK (Version 8 or higher): <https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html>
- Recommended: Maven: <https://maven.apache.org/download.cgi>
- Recommended: Spring Tools: <https://spring.io/tools>
- Recommended: Docker: <https://www.docker.com/>

### Compiling

Note: If you don't have maven installed there is a maven wrapper inside the **server** directory, instead of running maven as **mvn** you can run it as **./mvnw**. This needs execute permissions.  
In a terminal, inside the server directory (there should be the pom.xml file in there) run the following command:  
`mvn clean install`  
You can run the server with the following command:  
`java -jar ./target/vscode4teaching-server-0.0.1-SNAPSHOT.jar`  
Note that the name of the .jar file can change depending on the version of the server you're running.

### Running tests

You can run the tests with the following command in a terminal inside the **server** directory.  
`mvn test`

## Docker

You can build the server image with the command:  
`docker build .`  
Also you can download the image from Docker Hub:  
`docker pull ivchicano/vscode4teaching-server`  
Link to Docker Hub: (<https://cloud.docker.com/u/ivchicano/repository/docker/ivchicano/vscode4teaching-server)>
You can run a docker compose with the image and a mysql database by going to the **docker** directory inside the server directory and running the following command:  
`docker-compose up`
The server will run in port 8080.
