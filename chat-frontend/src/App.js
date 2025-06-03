import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function App(props) {
    const [username, setUsername] = useState(props?.username || '');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const stompClientRef = useRef(null);

    useEffect(() => {
        return () => {

            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    const connectToServer = () => {
        if (!username.trim()) {
            setError('Bitte gib einen Benutzernamen ein');
            return;
        }

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                setError('');


                stompClient.subscribe('/topic/public', (message) => {
                    try {
                        const body = JSON.parse(message.body);
                        setMessages((prev) => [...prev, `${body.sender}: ${body.content}`]);
                    } catch (e) {
                        console.error('Fehler beim Parsen der Nachricht:', e);
                    }
                });


                stompClient.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify({
                        sender: username,
                        content: 'hat den Chat betreten',
                    }),
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setError('Verbindung fehlgeschlagen');
            },
            onWebSocketError: (event) => {
                console.error('WebSocket-Fehler:', event);
                setError('WebSocket konnte nicht verbunden werden');
            },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;
    };

    const sendMessage = () => {
        if (message.trim() && stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({ sender: username, content: message }),
            });
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    if (!isConnected) {
        return (
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
                <h1>Chat Anmeldung</h1>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Benutzername eingeben"
                    style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
                />
                <button
                    onClick={connectToServer}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Beitreten
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>Chat</h1>
            <div
                style={{
                    height: '400px',
                    border: '1px solid #ccc',
                    marginBottom: '20px',
                    padding: '10px',
                    overflowY: 'auto',
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '5px',
                        }}
                    >
                        {msg}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                    placeholder="Nachricht eingeben..."
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Senden
                </button>
            </div>
        </div>
    );
}

export default App;
