# Real-time chat app

Dieses Projekt ist eine vollständige Echtzeit-Chat-Anwendung mit einem Java Spring Boot Backend und einem React-Frontend. Es unterstützt Benutzerregistrierung, Login, private Chats und verwendet WebSockets für die Echtzeit-Kommunikation.

# Features
 - **Benutzerregistrierung** und **Login** (JWT-Authentifizierung) </br>
 - **Private Chats** zwischen registrierten Benutzern </br>
 - **Echtzeit-Nachrichtenübertragung** mit WebSockets </br>
 - **Frontend**: React (Create React App) </br>
 - **Backend**: Spring Boot, Spring Security, WebSocket, JPA (MySQL) </br>
- **Sichere Kommunikation** durch JWT und eigene Security-Konfiguration </br>
- **Verschlüsselung privater Nachrichten** (AES, serverseitig) </br>

# Sicherheit
- **JWT-Authentifizierung** für REST und WebSocket </br>
- **Passwörter** werden **sicher** gespeichert </br>
- **CORS** und **CSRF** konfiguriert

## Verschlüsselung der Nachrichten

Private Nachrichten werden vor dem Speichern in der Datenbank mit AES
verschlüsselt. Der Schlüssel wird zur Laufzeit über die Umgebungsvariable
`ENCRYPTION_KEY` bereitgestellt und in der `SecurityConfig` als Bean
registriert. Beim Ausliefern an Clients entschlüsselt der Server die
Nachrichten wieder.

# Autor:

**[im23b-schmids3](https://github.com/im23b-schmids3)** </br>
Feedback oder Vorschläge? Öffne ein Issue oder erstelle einen Pull-Request!