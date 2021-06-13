package com.vscode4teaching.vscode4teachingserver.services.websockets;

import com.google.gson.Gson;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;


@Component
public class SocketHandler extends TextWebSocketHandler {
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {

        URI uri = session.getUri();
        if (uri == null) return;
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
        if (uri == null) return;
        String path = uri.getPath();
        switch (path) {
            case "/dashboard-refresh":
            case "/liveshare": {
                sessions.add(session);
                break;
            }
        }
        deleteClosedSessions();
    }

    private void handleRefresh(TextMessage message) {
        Map<String, String> objects = getMessageObjects(message);
        if (objects == null) return;
        String teacherUsername = objects.get("teacher");
        if (teacherUsername == null) return;
        sessions.stream()
                .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(teacherUsername))
                .forEach(t -> {
                    try {
                        t.sendMessage(new TextMessage("refresh"));
                    } catch (IOException e) {
                        System.out.println("Error sending websocket message: " + e.getMessage());
                    }
                });


    }

    private void handleLiveshare(TextMessage message) {
        Map<String, String> objects = getMessageObjects(message);
        if (objects == null) return;
        String code = objects.get("code");
        String from = objects.get("from");
        String target = objects.get("target");
        if (code == null || target == null) return;
        sessions.stream()
                .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(target))
                .forEach(t -> {
                    try {
                        t.sendMessage(new TextMessage("{\"from\":\"" + from + "\",\"code\":\"" + code + "\"}"));
                    } catch (IOException e) {
                        System.out.println("Error sending websocket message: " + e.getMessage());
                    }
                });


    }

    private Map<String, String> getMessageObjects(TextMessage message) {
        try {
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
