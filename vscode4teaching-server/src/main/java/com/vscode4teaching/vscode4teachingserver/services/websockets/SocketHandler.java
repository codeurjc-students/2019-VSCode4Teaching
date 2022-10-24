package com.vscode4teaching.vscode4teachingserver.services.websockets;

import com.google.gson.Gson;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.EmptyJSONObjectException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.EmptyURIException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.MissingPropertyException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private static final Logger logger = LoggerFactory.getLogger(SocketHandler.class);

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws EmptyURIException, EmptyJSONObjectException, MissingPropertyException {

        URI uri = session.getUri();
        if (uri == null) {
            logger.error("Empty URI received from WebSocket session: " + session.getId());
            throw new EmptyURIException();
        }
        String path = uri.getPath();
        switch (path) {
            case "/dashboard-refresh": {
                handleRefresh(message);
                break;
            }
            case "/liveshare": {
                handleLiveshare(message);
                break;
            }
        }
        deleteClosedSessions();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) {
            logger.error("Empty URI received from WebSocket session: " + session.getId());
            throw new EmptyURIException();
        }
        String path = uri.getPath();
        switch (path) {
            case "/dashboard-refresh":
            case "/liveshare": {
                sessions.add(session);
                break;
            }
        }
        if (session.getPrincipal() == null) {
            logger.info("Websocket connection with unidentified user");
        } else {
            logger.info("Websocket connection with user: " + Objects.requireNonNull(session.getPrincipal()).getName());
        }
        deleteClosedSessions();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        if (session.getPrincipal() == null) {
            logger.info("Closed Websocket connection with unidentified user");
        } else {
            logger.info("Closed Websocket connection with user: " + Objects.requireNonNull(session.getPrincipal()).getName());
        }
    }

    public void refreshExerciseDashboards(Set<User> teachers) {
        logger.info("Exercise user info updated, sending updates to teachers " + teachers.toString() + "...");
        for (User teacher : teachers) {
            sessions.stream()
                .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(teacher.getUsername()))
                .forEach(t -> {
                    try {
                        t.sendMessage(new TextMessage("{\"handle\":\"refresh\"}"));
                    } catch (IOException e) {
                        logger.error("Error sending websocket message: " + e.getMessage());
                    }
                });
        }
        logger.info("Updates sent to teachers");
    }

    private void handleRefresh(TextMessage message) throws EmptyJSONObjectException, MissingPropertyException {
        logger.info("Websockets: handling refresh");
        Map<String, String> objects = getMessageObjects(message);
        if (objects == null) throw new EmptyJSONObjectException();
        String teacherUsername = objects.get("teacher");
        if (teacherUsername == null) throw new MissingPropertyException("teacher");
        sessions.stream()
                .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(teacherUsername))
                .forEach(t -> {
                    try {
                        t.sendMessage(new TextMessage("{\"handle\":\"refresh\"}"));
                    } catch (IOException e) {
                        System.out.println("Error sending websocket message: " + e.getMessage());
                    }
                });
    }

    private void handleLiveshare(TextMessage message) throws EmptyJSONObjectException, MissingPropertyException {
        logger.info("Websockets: handling liveshare");
        Map<String, String> objects = getMessageObjects(message);
        if (objects == null) throw new EmptyJSONObjectException();
        String code = objects.get("code");
        String from = objects.get("from");
        String target = objects.get("target");
        if (code == null || target == null) throw new MissingPropertyException("code", "target");
        sessions.stream()
                .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(target))
                .forEach(t -> {
                    try {
                        t.sendMessage(new TextMessage("{\"handle\":\"liveshare\",\"from\":\"" + from + "\",\"code\":\"" + code + "\"}"));
                    } catch (IOException e) {
                        System.out.println("Error sending websocket message: " + e.getMessage());
                    }
                });


    }

    private Map<String, String> getMessageObjects(TextMessage message) {
        try {
            logger.info("Received WebSocket message");
            logger.info(message.getPayload());
            return new Gson().fromJson(message.getPayload(), Map.class);
        } catch (Exception e) {
            System.out.println("Error parsing websocket message: " + e.getMessage());
            return null;
        }
    }

    private void deleteClosedSessions() {
        sessions.removeIf(t -> !t.isOpen());
    }

}
