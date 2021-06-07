package com.vscode4teaching.vscode4teachingserver.services.websockets;

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


    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {

        URI uri = session.getUri();
        if (uri == null) return;
        String path = uri.getPath();
        var channelSessions = channels.get(path);
        for (WebSocketSession webSocketSession : channelSessions) {
            webSocketSession.sendMessage(new TextMessage("refresh"));
        }

//        for (WebSocketSession webSocketSession : sessions) {
//            var value = new Gson().fromJson(message.getPayload(), Map.class);
//            webSocketSession.sendMessage(new TextMessage("Hello " + value.get("name") + " !"));
//        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        assignChannelFromSession(session);
    }

    private void assignChannelFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return;


        String key;
        String value;
        String[] params = uri.getQuery().split("&");
        for (String param : params) {
            int separator = param.indexOf("=");
            if (separator > 0) {
                key = param.substring(0, separator);
                value = param.substring(separator + 1);
            }
        }


        synchronized (channels) {
            if (channels.containsKey(uri.getPath()))
                channels.get(uri.getPath()).addIfAbsent(session);
            else {
                CopyOnWriteArrayList<WebSocketSession> newList = new CopyOnWriteArrayList<>();
                newList.add(session);
                channels.putIfAbsent(uri.getPath(), newList);
            }
        }
    }

}
