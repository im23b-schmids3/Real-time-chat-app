package com.example.chatapp.model;

public class ChatMessage {
    private String sender;
    private String content;
    private String timestamp;

    public ChatMessage() {}

    public ChatMessage(String sender, String content, String timestamp) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTimestamp() {  // 👈 Getter für timestamp
        return timestamp;
    }

    public void setTimestamp(String timestamp) {  // 👈 Setter für timestamp
        this.timestamp = timestamp;
    }
}
