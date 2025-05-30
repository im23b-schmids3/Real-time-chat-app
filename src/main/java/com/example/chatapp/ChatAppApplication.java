package com.example.chatapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class ChatAppApplication {
    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.load();
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        System.setProperty("SECRET_KEY", dotenv.get("SECRET_KEY"));

        SpringApplication.run(ChatAppApplication.class, args);
    }
}
