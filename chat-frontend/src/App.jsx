import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { FaPaperPlane, FaEllipsisV } from 'react-icons/fa';
import './styles/common.css';

function App({ username }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);

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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-wrapper">
            {/* Chat List Sidebar */}
            <div className="chat-list">
                <div className="chat-header">
                    <div className="chat-header-title">Chats</div>
                    <div className="chat-header-actions">
                        <button className="chat-header-button">
                            <FaEllipsisV />
                        </button>
                    </div>
                </div>
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Nach Chat suchen..."
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                    <div style={{ 
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        color: '#667781',
                        fontSize: '14px'
                    }}>
                        Wähle einen Chat aus
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-avatar">
                        {username ? username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="chat-header-info">
                        <div className="chat-header-name">Öffentlicher Chat</div>
                    </div>
                    <div className="chat-header-actions">
                        <button className="chat-header-button">
                            <FaEllipsisV />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message${msg.sender === username ? ' own' : ''}`}
                        >
                            {msg.sender !== username && (
                                <div className="message-sender">{msg.sender}</div>
                            )}
                            <div className="message-content">{msg.content}</div>
                            <div className="message-time">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <input
                            className="chat-input"
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nachricht eingeben..."
                        />
                        <div className="chat-input-actions">
                            <button className="chat-input-button">😊</button>
                        </div>
                    </div>
                    <button onClick={sendMessage} className="chat-send-button">
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App; 