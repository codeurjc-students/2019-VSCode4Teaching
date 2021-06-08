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
    private final List<WebSocketSession> refreshSession = new CopyOnWriteArrayList<>();

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
                handleLiveshare(session, message);
                break;
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) return;
        String path = uri.getPath();
        switch (path) {
            case "/dashboard-refresh": {
                refreshSession.add(session);
                break;
            }
            case "/liveshare": {
                break;
            }
        }
    }

    private void handleRefresh(TextMessage message) {
        Map<String, String> value;
        try {
            value = new Gson().fromJson(message.getPayload(), Map.class);
        } catch (Exception e) {
            System.out.println("Error parsing websocket message: " + e.getMessage());
            return;
        }
        String teacherUsername = value.get("teacher");
        if (teacherUsername != null) {
            refreshSession.stream()
                    .filter(t -> t.isOpen() && Objects.requireNonNull(t.getPrincipal()).getName().equals(teacherUsername))
                    .forEach(t -> {
                        try {
                            t.sendMessage(new TextMessage("refresh"));
                        } catch (IOException e) {
                            System.out.println("Error sending websocket message: " + e.getMessage());
                        }
                    });
        }
        refreshSession.removeIf(t -> !t.isOpen());
    }

    private void handleLiveshare(WebSocketSession session, TextMessage message) {

    }

}
