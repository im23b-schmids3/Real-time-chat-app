package com.example.chatapp.security;

import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.http.server.ServerHttpRequest;
import java.security.Principal;
import java.util.Map;

public class CustomHandshakeHandler extends DefaultHandshakeHandler {
    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Principal user = (Principal) attributes.get("user");
        return user != null ? user : super.determineUser(request, wsHandler, attributes);
    }
} 