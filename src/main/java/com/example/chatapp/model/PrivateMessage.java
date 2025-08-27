package com.example.chatapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
@Table(name = "private_messages")
public class PrivateMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "receiver_id", nullable = false)
    private Integer receiverId;

    /**
     * Encrypted message body. The actual plaintext is encrypted before
     * persistence and stored in this field.
     */
    @JsonProperty("content")
    @Column(name = "content", nullable = false)
    private String encryptedContent;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}

