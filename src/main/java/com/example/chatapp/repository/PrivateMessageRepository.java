package com.example.chatapp.repository;

import com.example.chatapp.model.PrivateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {
    List<PrivateMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
            Integer senderId, Integer receiverId, Integer senderId2, Integer receiverId2);

    @Query("""
       SELECT pm FROM PrivateMessage pm
       WHERE (pm.senderId = :userId OR pm.receiverId = :userId)
       AND pm.timestamp = (
           SELECT MAX(pm2.timestamp) FROM PrivateMessage pm2
           WHERE (pm2.senderId = pm.senderId AND pm2.receiverId = pm.receiverId)
              OR (pm2.senderId = pm.receiverId AND pm2.receiverId = pm.senderId)
       )
       ORDER BY pm.timestamp DESC
       """)
    List<PrivateMessage> findLatestMessagesForUser(@Param("userId") Integer userId);
}


