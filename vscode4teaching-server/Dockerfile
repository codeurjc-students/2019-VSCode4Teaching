FROM openjdk:8-jdk-alpine
COPY ./target/vscode4teaching-server-0.1.0.jar /app/vscode4teaching-server-0.1.0.jar
COPY ./docker/waitDB.sh /app/waitDB.sh
EXPOSE 8080
RUN ["chmod", "+x", "/app/waitDB.sh"]
CMD ["/app/waitDB.sh"]