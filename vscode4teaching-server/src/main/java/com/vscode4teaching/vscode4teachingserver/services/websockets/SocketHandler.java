package com.vscode4teaching.vscode4teachingserver.services.websockets;

import com.google.gson.Gson;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;


@Component
public class SocketHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<WebSocketSession>> channels = new ConcurrentHashMap<>();
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    private final List<WebSocketSession> refreshSession = new CopyOnWriteArrayList<>();


    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {

        URI uri = session.getUri();
        if (uri == null) return;
        String path = uri.getPath();
        switch (path) {
            case "/dashboard-refresh": {
                handleRefresh(session, message);
                break;
            }
            case "/liveshare": {
                handleLiveshare(session, message);
                break;
            }
        }

//        for (WebSocketSession webSocketSession : sessions) {
//            var value = new Gson().fromJson(message.getPayload(), Map.class);
//            webSocketSession.sendMessage(new TextMessage("Hello " + value.get("name") + " !"));
//        }
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
//        assignChannelFromSession(session);
    }

//    private void assignChannelFromSession(WebSocketSession session) {
//        URI uri = session.getUri();
//        if (uri == null) return;
//
//
//        String key;
//        String value;
//        String[] params = uri.getQuery().split("&");
//        for (String param : params) {
//            int separator = param.indexOf("=");
//            if (separator > 0) {
//                key = param.substring(0, separator);
//                value = param.substring(separator + 1);
//            }
//        }
//
//
//        synchronized (channels) {
//            if (channels.containsKey(uri.getPath()))
//                channels.get(uri.getPath()).addIfAbsent(session);
//            else {
//                CopyOnWriteArrayList<WebSocketSession> newList = new CopyOnWriteArrayList<>();
//                newList.add(session);
//                channels.putIfAbsent(uri.getPath(), newList);
//            }
//        }
//    }

    private void handleRefresh(WebSocketSession session, TextMessage message) {
        Map<String, String> value;
        try {
            value = new Gson().fromJson(message.getPayload(), Map.class);
        } catch (Exception e) {
            System.out.println("Error parsing websocket message: " + e.getMessage());
            return;
        }
        String teacherUsername = value.get("teacher");
        if (teacherUsername != null) {
            Optional<WebSocketSession> target = refreshSession.stream()
                    .filter(t -> {
                        var b = t.getPrincipal();
                        var a = t.getPrincipal().getName();
                        return Objects.requireNonNull(t.getPrincipal()).getName().equals(teacherUsername);
                    })
                    .findFirst();
            if (target.isPresent()) {
                try {
                    target.get().sendMessage(new TextMessage("refresh"));
                } catch (IOException e) {
                    System.out.println("Error sending websocket message: " + e.getMessage());
                }
            }
        }
    }

    private void handleLiveshare(WebSocketSession session, TextMessage message) {

    }

}
