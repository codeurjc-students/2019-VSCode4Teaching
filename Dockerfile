# Step 1: Compilation of Angular frontend
# It will be embedded as a static resource into Spring Boot backend
FROM node:18 AS angular
COPY vscode4teaching-webapp /usr/src/app
WORKDIR /usr/src/app
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

# Step 2: Compilation of Maven project (generation of JAR)
FROM maven:3.9.7-eclipse-temurin-11 AS builder
COPY vscode4teaching-server /data
COPY --from=angular /usr/src/app/dist/vscode4teaching /data/src/main/resources/static/
WORKDIR /data
RUN ["mvn", "clean", "package"]

# Step 3: Generation of Docker image using the JAR previously built
FROM eclipse-temurin:11
COPY --from=builder /data/target/vscode4teaching-server-*.jar ./app/vscode4teaching-server.jar
EXPOSE 8080
ENTRYPOINT [ "java", "-jar", "./app/vscode4teaching-server.jar" ]