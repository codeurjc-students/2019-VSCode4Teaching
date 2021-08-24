# VS Code 4 Teaching Server

## Table of Contents

- [API Documentation](README.md#api-documentation)
- [Docker](README.md#docker)
- [Database Initializer](README.md#database-initializer)
- [Installing](README.md#installing)
  - [Arguments/Environment variables](README.md#argumentsenvironment-variables)
- [Development](README.md#development)
  - [Prerequisites](README.md#prerequisites)
  - [Compiling](README.md#compiling)
  - [Running tests](README.md#running-tests)

## API Documentation

Click [HERE](API.md) for the documentation on the REST API running on the server.  
Click [HERE](WSAPI.md) for the documentation on the WebSocket API running on the server.  

## Docker

You can build the server image with the command:  
`docker build .`  
Also you can download the image from Docker Hub:  
`docker pull ivchicano/vscode4teaching-server`  
Link to Docker Hub: (<https://cloud.docker.com/u/ivchicano/repository/docker/ivchicano/vscode4teaching-server)>
You can run a docker compose with the image and a mysql database by going to the **docker** directory inside the server directory and running the following command:  
`docker-compose up`
The server will run in port 8080.
You should check the section [Arguments/Environment variables](README.md#argumentsenvironment-variables) for more info about configuration of the server (important in production environments), and modify the .env file according to your needs.

## Database Initializer  

The data.sql file in resources will initialize some demo data to the database. These include:  

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
      - password: `studentpassword2`  
    - Student 3:  
      - username: `johndoejr3`  
      - password: `studentpassword3`  
    - Student 4:
      - username: `emptyjoe`
      - password: `emptyjoe`
- Courses: Spring Boot Course, Angular Course, VSCode Extension API Course. Each course has every user above (except Student 4 who has no courses assigned to) as a student (Student 1, Student 2 and Student 3) or teacher (Teacher).  
- Exercises: each course has 5 exercises: Exercise 1, Exercise 2 and so on.  
File data is not included (see below).  

Also, if the directory specified in the `v4t.filedirectory` property exists, the server will try to initialize the files' data in the database, along with everything it needs.
First, it will search for the ids of the courses (eg.: if there is a folder spring_boot_course_11 it will try to find course with id 11). If not found, it will try searching by name, and if found by name it will rename de directory to the same id. Then, it will try to find the exercises ids or name inside that course (name search and renaming same as with courses). Last, for the template and each user in that folder it will try to find all files and save all information needed in the database.
If at any point an element does not exist, it will be ignored (eg.: a course has not been found).  
In the `v4t-course` directory in the repository there are demo files, each exercise has a template with a single demo html file, and student `johndoejr` has a Spring + Angular project  in `Spring Boot Course, Exercise 1`.

All of this is configurable (See [Arguments/Environment variables](README.md#argumentsenvironment-variables)).

## Installing

The server needs a directory with read and write permissions to save exercises' files.  
It is recommended to use docker-compose to run the server. [Link to the section about Docker](README.md#Docker).  
If you want to run the application standalone, check below for information:  
Important: the server needs a MySQL database running. Check below for possible arguments for configuring database host, user, password, etc.  
No installation required, just download and run the JAR file as follows (download from [Releases](https://github.com/codeurjc-students/2019-VSCode4Teaching/releases/latest)).  
`java -jar vscode4teaching-server-1.0.0.jar`  
Where `vscode4teaching-server-1.0.0.jar` is the route of the JAR file in you file system.  
Note that the name of the .jar file can change depending on the version of the server you're running.  

### Arguments/Environment variables

You can pass arguments to the command to change default configurations. You can also have environment variables set for the configurations to apply.
List of allowed arguments:

- --server.port=[number]  
  Set the port the server will run in.  
  Default: 8080  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --server.port=9090`  
- --spring.datasource.url=[jdbc:mysql://url]  
  Database host url.  
  Default: jdbc:mysql://localhost:3306/vsc4teach  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --spring.datasource.url=jdbc:mysql://localhost:3306/vsc4teach`  
- --spring.datasource.username=[username]  
  Database username.  
  Default: root  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --spring.datasource.username=root`  
- --spring.datasource.password=[password]  
  Database password.  
  Default: [Empty]  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --spring.datasource.password=root`  
- --jwt.secret=[key]  
   Secret key for JWT. IMPORTANT TO CHANGE IN PRODUCTION ENVIRONMENT.  
   Default: vscode4teaching  
   Example: `java -jar vscode4teaching-server-1.0.0.jar --jwt.secret=vscode4teaching`  
- --v4t.filedirectory=[directory]  
    Directory where the exercises' files will be saved.  
    Default: v4t-course  
    Example: `java -jar vscode4teaching-server-1.0.0.jar --v4t.filedirectory=C:\v4tfiles`  
- --file.initialization=[true|false]  
    Indicates whether to initialize file information in the database or not.  
    Default: true  
    Example: `java -jar vscode4teaching-server-1.0.0.jar --file.initialization=false`  
- --data.initialization=[true|false]  
    Indicates whether to initialize demo database information or not.  
    Default: true  
    Example: `java -jar vscode4teaching-server-1.0.0.jar --data.initialization=false`  
- --spring.jpa.hibernate.ddl-auto=[validate|update|create|create-drop|none]  
    Indicates what will the server do with the database. Recommended to change in production environments.  
  - validate: validate the schema, makes no changes to the database.  
  - update: update the schema.  
  - create: creates the schema, destroying previous data.  
  - create-drop: drop the schema the application is stopped.  
  - none: does nothing with the schema, makes no changes to the database.  
    Default: create-drop  
    Example: `java -jar vscode4teaching-server-1.0.0.jar --spring.jpa.hibernate.ddl-auto=validate`  
- --superuser.username=[string]  
  Superuser username.  
  Default: admin  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --superuser.username=v4tsuperuser`  
- --superuser.password=[string]  
  Superuser password. IMPORTANT TO CHANGE IN PRODUCTION ENVIRONMENT.  
  Default: admin  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --superuser.password=v4tpassword`  
- --superuser.email=[string]  
  Superuser email.  
  Default: admin@admin.com  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --superuser.email=v4tadmin@gmail.com`  
- --superuser.name=[string]  
  Superuser name.  
  Default: Admin  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --superuser.name=John`  
- --superuser.lastname=[string]  
  Superuser lastname.  
  Default: Admin  
  Example: `java -jar vscode4teaching-server-1.0.0.jar --superuser.lastname=Doe`  
  Example with all arguments:  
  `java -jar vscode4teaching-server-1.0.0.jar --server.port=9090 --spring.datasource.url=jdbc:mysql://localhost:3306/vsc4teach --spring.datasource.username=root --spring.datasource.password=root --jwt.secret=vscode4teaching --v4t.filedirectory=courses --file.initialization=false --data.initialization=true --spring.jpa.hibernate.ddl-auto=create --superuser.username=v4tsuperuser --superuser.password=v4tpassword --superuser.email=v4tadmin@gmail.com --superuser.name=John --superuser.lastname=Doe`

  For environment variables, just choose an argument above, put it in all caps and change the . (dots) into \_ (underscores) eg.: SPRING_DATASOURCE_URL
  and set the value to the value desired (see the examples above for guidance).

## Development

### Prerequisites

- JDK (Version 11 or higher): <https://www.oracle.com/es/java/technologies/javase-jdk11-downloads.html>
- Recommended: Maven: <https://maven.apache.org/download.cgi>
- Recommended: Spring Tools: <https://spring.io/tools>
- Recommended: Docker: <https://www.docker.com/>

### Compiling

Note: If you don't have maven installed there is a maven wrapper inside the **server** directory, instead of running maven as **mvn** you can run it as **./mvnw**. This needs execute permissions.  
In a terminal, inside the server directory (there should be the pom.xml file in there) run the following command:  
`mvn clean package`  
You can run the server with the following command:  
`java -jar ./target/vscode4teaching-server-1.0.0.jar`  
Note that the name of the .jar file can change depending on the version of the server you're running.

### Running tests

You can run the tests with the following command in a terminal inside the **server** directory.  
`mvn test`
