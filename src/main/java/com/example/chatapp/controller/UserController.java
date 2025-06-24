package com.example.chatapp.controller;

import com.example.chatapp.User;
import com.example.chatapp.repository.UserRepository;
import com.example.chatapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
// allowCredentials expects a boolean value
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = true)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
}
