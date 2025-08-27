package com.example.chatapp.controller;

import com.example.chatapp.User;
import com.example.chatapp.repository.UserRepository;
import com.example.chatapp.repository.PrivateMessageRepository;
import com.example.chatapp.model.PrivateMessage;
import com.example.chatapp.security.JwtUtil;
import com.example.chatapp.model.ChatOverviewDTO;
import com.example.chatapp.security.EncryptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
// allowCredentials expects a boolean value
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    @Autowired
    private EncryptionService encryptionService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            if (userRepository.findByName(user.getName()) != null) {
                return ResponseEntity.badRequest().body("Benutzername ist bereits vergeben.");
            }

            if (userRepository.findByEmail(user.getEmail()) != null) {
                return ResponseEntity.badRequest().body("E-Mail-Adresse ist bereits registriert.");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return ResponseEntity.ok("Registrierung erfolgreich.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fehler bei der Registrierung: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        try {
            User user = userRepository.findByName(loginData.getName());

            if (user == null || !passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Ungültiger Benutzername oder Passwort.");
            }

            String token = jwtUtil.generateToken(user.getName());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fehler beim Login: " + e.getMessage());
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUser(@RequestParam String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/messages/{otherId}")
    public ResponseEntity<?> getMessages(@PathVariable Integer otherId, Principal principal) {
        User current = userRepository.findByName(principal.getName());
        List<PrivateMessage> msgs = privateMessageRepository
                .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                        current.getId(), otherId, otherId, current.getId());
        List<PrivateMessage> decrypted = msgs.stream().map(m -> {
            PrivateMessage copy = new PrivateMessage();
            copy.setId(m.getId());
            copy.setSenderId(m.getSenderId());
            copy.setReceiverId(m.getReceiverId());
            copy.setTimestamp(m.getTimestamp());
            copy.setEncryptedContent(encryptionService.decrypt(m.getEncryptedContent()));
            return copy;
        }).toList();
        return ResponseEntity.ok(decrypted);
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Principal principal) {
        User current = userRepository.findByName(principal.getName());
        List<PrivateMessage> messages = privateMessageRepository.findLatestMessagesForUser(current.getId());
        List<ChatOverviewDTO> overview = messages.stream().map(msg -> {
            Integer partnerId = msg.getSenderId().equals(current.getId()) ? msg.getReceiverId() : msg.getSenderId();
            User partner = userRepository.findById(partnerId).orElse(null);
            String partnerName = partner != null ? partner.getName() : "Unbekannt";
            boolean lastSentByMe = msg.getSenderId().equals(current.getId());
            String lastMessage = encryptionService.decrypt(msg.getEncryptedContent());
            return new ChatOverviewDTO(partnerId, partnerName, lastMessage, msg.getTimestamp(), lastSentByMe);
        }).toList();
        return ResponseEntity.ok(overview);
    }
}
