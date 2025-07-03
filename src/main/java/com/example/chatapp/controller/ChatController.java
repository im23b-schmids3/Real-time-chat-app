package com.example.chatapp.controller;

import com.example.chatapp.model.ChatMessage;
import com.example.chatapp.model.PrivateMessage;
import com.example.chatapp.repository.PrivateMessageRepository;
import com.example.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/ws/info")
    @ResponseBody
    public String info() {
        return "WebSocket server is running";
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now().toString());
        return message;
    }

    @MessageMapping("/chat.private.{receiverId}")
    public void sendPrivateMessage(@DestinationVariable Integer receiverId,
                                   ChatMessage message,
                                   Principal principal) {
        if (principal == null) {
            return;
        }
        Integer senderId = userRepository.findByName(principal.getName()).getId();

        PrivateMessage pm = new PrivateMessage();
        pm.setSenderId(senderId);
        pm.setReceiverId(receiverId);
        pm.setContent(message.getContent());
        pm.setTimestamp(LocalDateTime.now());
        privateMessageRepository.save(pm);

        message.setSender(principal.getName());
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setTimestamp(pm.getTimestamp().toString());

        String receiverName = userRepository.findById(receiverId).get().getName();
        messagingTemplate.convertAndSendToUser(receiverName, "/queue/private", message);
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/private", message);
    }
}
