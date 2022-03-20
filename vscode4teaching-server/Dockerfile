# Step 1: Compilation of Maven project (generation of JAR)
FROM maven:3.8.2 AS builder
COPY . /data
WORKDIR /data
RUN ["mvn", "clean", "package"]

# Step 2: Generation of Docker image using the JAR previously built
FROM adoptopenjdk/openjdk11:latest
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*
COPY --from=builder /data/target/vscode4teaching-server-*.jar ./app/vscode4teaching-server-*.jar
COPY ./docker/waitDB.sh ./app/waitDB.sh
EXPOSE 8080
RUN ["chmod", "+x", "./app/waitDB.sh"]
CMD ["./app/waitDB.sh"]