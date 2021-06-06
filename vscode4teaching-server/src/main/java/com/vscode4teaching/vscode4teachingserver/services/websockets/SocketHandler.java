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

    private final ConcurrentHashMap<String, WebSocketSession> channels = new ConcurrentHashMap<>();
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();


    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {
        for (WebSocketSession webSocketSession : sessions) {
            var value = new Gson().fromJson(message.getPayload(), Map.class);
            webSocketSession.sendMessage(new TextMessage("Hello " + value.get("name") + " !"));
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        //the messages will be broadcasted to all users.
        assignChannelFromSession(session);
        sessions.add(session);
    }

    private void assignChannelFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return;
        String[] params = uri.getQuery().split("&");
        for (String param : params) {
            int separator = param.indexOf("=");
            if (separator > 0) {
                String key = param.substring(0, separator);
                if (key.equals("channel")) {
                    String value = param.substring(separator + 1);
                    channels.putIfAbsent(value, session);
                }
            }
        }
    }
}
