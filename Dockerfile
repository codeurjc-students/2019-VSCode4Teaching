# Step 1: Compilation of Angular frontend
# It will be embedded as a static resource into Spring Boot backend
FROM node:22 AS angular
COPY frontend /usr/src/app
WORKDIR /usr/src/app
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

# Step 2: Compilation of Maven project (generation of JAR)
FROM maven:3.9.9-eclipse-temurin-21 AS builder
COPY backend /data
COPY --from=angular /usr/src/app/dist/vscode4teaching/browser /data/src/main/resources/static/
WORKDIR /data
RUN ["mvn", "clean", "package"]

# Step 3: Generation of Docker image using the JAR previously built
FROM eclipse-temurin:21.0.5_11-jre
COPY --from=builder /data/target/vscode4teaching-*.jar ./app/vscode4teaching-server.jar
EXPOSE 8080
ENTRYPOINT [ "java", "-jar", "./app/vscode4teaching-server.jar" ]