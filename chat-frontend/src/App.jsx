import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './styles/common.css';

function App({ username }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('Verbunden mit WebSocket');
                client.subscribe('/topic/public', (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP Fehler:', frame);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() && stompClient) {
            const message = {
                sender: username,
                content: newMessage,
                type: 'CHAT'
            };
            stompClient.publish({
                destination: '/app/chat.send',
                body: JSON.stringify(message)
            });
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
            </div>
            <div className="chat-input-container">
                <input
                    className="chat-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nachricht eingeben..."
                />
                <button onClick={sendMessage} className="chat-button">
                    Senden
                </button>
            </div>
        </div>
    );
}

export default App; 