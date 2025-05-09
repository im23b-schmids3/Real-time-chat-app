package org.example;
import java.io.*;
import java.net.*;
import java.util.Scanner;

public class ChatClient {
    private static Socket socket;
    private static BufferedReader reader;
    private static PrintWriter writer;
    private static String username;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Choose a username: ");
        username = scanner.nextLine();

        try {
            socket = new Socket("localhost", 3001);
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            writer = new PrintWriter(socket.getOutputStream(), true);

            new Thread(ChatClient::receive).start();
            new Thread(ChatClient::send).start();

        } catch (IOException e) {
            System.out.println("Unable to connect to the server.");
            System.exit(0);
        }
    }

    private static void receive() {
        try {
            String message;
            while ((message = reader.readLine()) != null) {
                if (message.equals("USERNAME")) {
                    writer.println(username);
                } else if (message.startsWith("ERROR:")) {
                    System.out.println(message);
                    socket.close();
                    System.exit(0);
                } else {
                    System.out.println(message);
                }
            }
        } catch (IOException e) {
            System.out.println("An error occurred while receiving messages.");
        }
    }

    private static void send() {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            try {
                String message = scanner.nextLine();
                writer.println(username + ": " + message);
            } catch (Exception e) {
                System.out.println("An error occurred while sending messages.");
                break;
            }
        }
    }
}
