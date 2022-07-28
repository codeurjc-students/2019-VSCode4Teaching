# Step 1: Compilation of Angular frontend
# It will be embedded as a static resource into Spring Boot backend
FROM node:16.13.2 AS angular
COPY vscode4teaching-webapp /usr/src/app
WORKDIR /usr/src/app
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

# Step 2: Compilation of Maven project (generation of JAR)
FROM maven:3.8.4-jdk-11 AS builder
COPY vscode4teaching-server /data
COPY --from=angular /usr/src/app/dist /data/src/main/resources/static
WORKDIR /data
RUN ["mvn", "clean", "package"]

# Step 3: Generation of Docker image using the JAR previously built
FROM adoptopenjdk/openjdk11:latest
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*
COPY --from=builder /data/target/vscode4teaching-server-*.jar ./app/vscode4teaching-server-*.jar
COPY vscode4teaching-server/docker/waitDB.sh ./app/waitDB.sh
EXPOSE 8080
RUN ["chmod", "+x", "./app/waitDB.sh"]
CMD ["./app/waitDB.sh"]
