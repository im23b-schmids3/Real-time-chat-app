package com.example.chatapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ChatOverviewDTO {
    private Integer partnerId;
    private String partnerName;
    private String lastMessage;
    private LocalDateTime timestamp;
} 