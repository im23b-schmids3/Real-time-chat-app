package com.example.chatapp.security;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.server.ServletServerHttpRequest;
import java.net.URI;

import java.security.Principal;
import java.util.Map;

public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String token = null;
        // 1. Versuche, Token aus Header zu lesen (wie bisher)
        if (request.getHeaders().containsKey("Authorization")) {
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }
        // 2. Versuche, Token aus Query-Parameter zu lesen
        if (token == null && request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String query = servletRequest.getServletRequest().getQueryString();
            if (query != null && query.contains("token=")) {
                for (String param : query.split("&")) {
                    if (param.startsWith("token=")) {
                        token = param.substring(6);
                        break;
                    }
                }
            }
        }
        if (token != null) {
            try {
                // JWT dekodieren (Achtung: Secret muss wie in JwtUtil sein!)
                String secret = System.getenv("SECRET_KEY");
                if (secret == null) {
                    secret = System.getProperty("SECRET_KEY");
                }
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                String username = claims.getSubject();
                attributes.put("user", (Principal) () -> username);
            } catch (Exception e) {
                System.out.println("Ungültiger JWT im WebSocket-Handshake: " + e.getMessage());
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        // nichts
    }
} 