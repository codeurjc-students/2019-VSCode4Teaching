# VSCode4Teaching - Server

## Table of contents
- [Development](#development)
  - [Involved technologies](#involved-technologies)
  - [REST API documentation](#rest-api-documentation)
- [Build](#build)
  - [Common Java application](#common-java-application)
  - [Docker](#docker)
- [Execution](#execution)
  - [Arguments and environment variables](#arguments-and-environment-variables)
  - [Demo database and file initialization](#demo-database-and-file-initialization)


## Development
The VSCode4Teaching web server is based on the Spring Boot *framework* which takes the role of *backend* in the application. It takes care of tasks such as persistence management and information interpretation, storage of the files that conform the exercises (both templates and proposed solutions) and the publication of a REST API that allows communication with the other components.

### Involved technologies
Spring Boot web applications are based on Java, being the main associated technologies the following:
- [JDK](https://www.oracle.com/es/java/technologies/javase-jdk11-downloads.html) (*Java Development Kit*, version 11 or higher). It is a tool that allows the execution of applications built with Java language on the Java Virtual Machine (JVM).
- [Maven](https://maven.apache.org/download.cgi). It is a project management software based on the concept of POM (Project Object Model).
- [MySQL](https://www.mysql.com). It is an open source licensed SQL or relational database management system used as a server persistence layer.
- [Docker](https://www.docker.com). It is a technology for running applications based on the concept of lightweight containers that is used to generate a VSCode4Teaching server image for ease of execution.

### REST API documentation
The REST API provided by the server is documented according to the OpenAPI 3.0 standard. This documentation can be read in two ways:
- In the file [``API.json``](API.json) in this directory, where it is updated when changes are made to the *endpoints* available in the API.
- This documentation can also be read and viewed through the Swagger interactive service by accessing ``{URL}/swagger-ui/index.html`` in a browser, where ``{URL}`` has to be the URL where the server was deployed (e. g., if it was deployed at ``localhost:8080``, the URL [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) can be opened).

On the other hand, documentation on the *endpoints* used for *Web Sockets* publishing is available in the file [``WSAPI.md``](WSAPI.md). 


## Build
The VSCode4Teaching server can be built in two ways: as a conventional Java application or through the provided Docker configuration.

### Common Java application
As the Spring Boot application makes use of Maven, it is possible to build the Java application in the following way:
- Build the web application and insert the result as a static resource of the *backend* (in the ``src/main/resources/static`` directory). If this process is not performed, the application will be built successfully but executing the web application's dependent features (such as the custom help page or the teacher registration by invitation) will not be possible.
- Generate a JAR executable using the following command:
  ```
  mvn package
  ```
  When the execution is finished, a JAR file can be found in the ``target`` directory.

### Docker
On the other hand, a [``Dockerfile``](Dockerfile) file is provided. It contains the necessary coding to build the webapp and insert it as a view in the server, which is built and launched in a Java container.

To build it, it is necessary to execute the following command:
```
docker build .
```

This image resulting from this building process is also published in [*Docker Hub*](https://hub.docker.com/r/vscode4teaching/vscode4teaching) each time a new version of the application is released, being publicly usable.

Note: the application is accessible through port 8080 by default. To modify this behavior, it is possible to enter an argument when executing the program (read more information in section [Arguments and environment variables](#arguments-and-environment-variables)).

On the other hand, in addition, a file [``docker-compose.yml``](vscode4teaching-server/docker/docker-compose.yml) is introduced. It allows to use Docker Compose to run two containers: one for the MySQL database used (``db``) and another for the image built from the ``Dockerfile`` file above (``app``). In addition, a third container is introduced for running a graphical database manager (``adminer``), which is optional and can be removed without affecting the operation of the server.


## Execution
Depending on the building mode of the application, it is possible to execute the application in three ways:
- In case of having an executable JAR file, the execution is performed by the following command:
  ```
  java -jar {jar}.jar
  ```
  You must replace ``{jar}`` with the path to the JAR file obtained after building the application.
- It is possible to run the application without launching an explicit build process through the following command:
  ```
  mvn spring-boot:run
  ```
- On the other hand, in case of using Docker, it is advisable to use Docker Compose to launch both the database and the application in containers. To do this, go to the directory containing the ``docker-compose.yml`` file and run the following command:
  ```
  docker-compose up -d
  ```

On the other hand, to run the tests implemented in this component, it is possible to execute the following command:
```
mvn test
```

### Arguments and environment variables
It is possible to enter some arguments in the JAR run line or as environment variables in the [``.env``](vscode4teaching-server/docker/.env) file to modify the basic application settings. They are:

- ``server.port`` (default: 8080). It is used to modify the port on which the application is served.
- ``jwt.secret`` (default: ``vscode4teaching``. Secret used to generate JWT tokens. It is **IMPORTANT** to change this value in production to ensure security.
- ``v4t.filedirectory`` (default: ``v4t-course``). This is the directory where all course and exercise files created and submitted are stored.
- Configuration of the database:
  - ``spring.datasource.url`` (default: ``jdbc:mysql://localhost:3306/vsc4teach``). It is used to change the configuration of the server and MySQL database used.  
  It is entered in the format ``jdbc:mysql://{bd-url}/{bd-name}``, where ``{bd-url}`` is the MySQL server URL and ``{bd-name}`` is the database name.
  - ``spring.datasource.username`` (default: ``root``). It is used to change the username used for database connection.
  - ``spring.datasource.password`` (default empty). It is used to change the password used for database connection.
  - ``spring.jpa.hibernate.ddl-auto`` (default: ``create-drop``). It tells ORM how to handle the start of its relationship with the database. Possible values are:
    - ``validate``: checks that the existing database schema corresponds to the one needed to host the model entities.  
    - ``update``: updates the existing schema to make it correspond to the one needed to host the model entities.
    - ``create``: creates a new schema overwriting the existing one.
    - ``create-drop``: removes the schema used when the application is closed.
    - ``none``: makes no changes to the schema.
- **Initialization with test data** (see section on [initialization](#initialization-of-database-and-test-files)):
  - ``file.initialization`` (default: ``true``). Gets a boolean value, and allows you to indicate whether you want to initialize the established test files when running the application.
  - ``data.initialization`` (default: ``true``). Gets a boolean value, and allows to indicate if you want to initialize the database information with the test values set when running the application.
- **Superuser configuration** (user with teacher role created by default as the first user):
  - ``superuser.username`` (default: ``admin``). The superuser's username.
  - ``superuser.password`` (default: ``admin``). The superuser's password.
  - ``superuser.email`` (default: ``admin@admin.com``). The superuser's email.
  - ``superuser.name`` (default: ``Admin``). The superuser's first name.
  - ``superuser.lastname`` (default: ``Admin``). The superuser's last name.

### Demo database and file initialization
VSCode4Teaching implements the possibility to initialize the application database and the course and exercise file system with some test data. In the file [``DatabaseInitializer.java``](vscode4teaching-server/src/main/java/com/vscode4teaching/vscode4teaching/DatabaseInitializer.java) the testing data is entered and, in case the ``data.initialization`` property is active (more information in the section on [arguments and environment variables](#arguments-and-environment-variables)), it is initialized with the following information:

- Users.

  | Role | User name | Password |
  | :--: | :-------: | :------: |
  | Teacher | ``johndoe`` | ``teacherpassword`` |
  | Student | ``johndoejr`` | ``studentpassword`` |
  | Student | ``johndoejr2`` | ``studentpassword2`` |
  | Student | ``johndoejr3`` | ``studentpassword3`` |
  | Student | ``emptyjoe`` | ``emptyjoe`` |

- Courses. Three courses are generated: ``Spring Boot Course``, ``Angular Course``, ``VSCode Extension API Course``. Each course contains five exercises by default (``Exercise 1``, ``Exercise 2``, ...), being ``johndoe`` teacher and having all students enrolled (except ``emptyjoe``, who is not enrolled in any course).

On the other hand, if the ``file.initialization`` property is active and the directory configured in ``v4t.filedirectory`` exists, the server will try to initialize the files associated to the database configured in the test data detailed above. This functionality is configured in the code file [``DatabaseFileInitializer.java``](vscode4teaching-server/src/main/java/com/vscode4teaching/vscode4teaching/DatabaseFileInitializer.java).