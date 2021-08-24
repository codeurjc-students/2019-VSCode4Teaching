FROM adoptopenjdk/openjdk11:latest
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*
COPY ./target/vscode4teaching-server-*.jar ./app/vscode4teaching-server-*.jar
COPY ./docker/waitDB.sh ./app/waitDB.sh
EXPOSE 8080
RUN ["chmod", "+x", "./app/waitDB.sh"]
CMD ["./app/waitDB.sh"]