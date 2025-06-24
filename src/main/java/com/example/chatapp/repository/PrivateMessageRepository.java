package com.example.chatapp.repository;

import com.example.chatapp.model.PrivateMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {
    List<PrivateMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
            Integer senderId, Integer receiverId, Integer senderId2, Integer receiverId2);
}

