package org.example;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

public class ChatServer {
    private static final int PORT = 3001;
    private static Set<Socket> users = ConcurrentHashMap.newKeySet();
    private static Map<Socket, String> usernames = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        System.out.println("Server is activated and running.");
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket user = serverSocket.accept();
                System.out.println("Connected with " + user.getInetAddress());

                new Thread(() -> handleUser(user)).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleUser(Socket user) {
        try {
            InputStream input = user.getInputStream();
            OutputStream output = user.getOutputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(input));
            PrintWriter writer = new PrintWriter(output, true);

            writer.println("USERNAME");
            String username = reader.readLine();

            synchronized (usernames) {
                if (usernames.containsValue(username)) {
                    writer.println("ERROR: Username already taken.");
                    user.close();
                    return;
                }

                usernames.put(user, username);
                users.add(user);
            }

            System.out.println("Username: " + username);
            broadcast(username + " joined the chat", user);

            String message;
            while ((message = reader.readLine()) != null) {
                broadcast(message, user);
            }
        } catch (IOException e) {

        } finally {
            String username = usernames.remove(user);
            users.remove(user);
            if (username != null) {
                broadcast(username + " left the chat", null);
            }
            try {
                user.close();
            } catch (IOException ignored) {}
        }
    }

    private static void broadcast(String message, Socket sender) {
        for (Socket user : users) {
            if (user != sender) {
                try {
                    PrintWriter writer = new PrintWriter(user.getOutputStream(), true);
                    writer.println(message);
                } catch (IOException e) {
                    try {
                        user.close();
                    } catch (IOException ignored) {}
                    users.remove(user);
                    usernames.remove(user);
                }
            }
        }
    }
}
