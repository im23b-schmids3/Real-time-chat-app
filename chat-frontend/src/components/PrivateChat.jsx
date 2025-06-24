import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function PrivateChat({ username }) {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [partner, setPartner] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                client.subscribe('/user/queue/private', (msg) => {
                    const body = JSON.parse(msg.body);
                    setMessages(prev => [...prev, body]);
                });
            }
        });
        client.activate();
        setStompClient(client);
        return () => {
            client.deactivate();
        };
    }, []);

    const searchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/users/search?email=${encodeURIComponent(searchEmail)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Benutzer nicht gefunden');
            const data = await res.json();
            setPartner(data);
            const histRes = await fetch(`http://localhost:8080/api/messages/${data.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (histRes.ok) {
                const hist = await histRes.json();
                setMessages(hist.map(m => ({
                    sender: m.senderId === data.id ? data.name : username,
                    content: m.content,
                    timestamp: m.timestamp
                })));
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.error(err);
            setPartner(null);
            setMessages([]);
        }
    };

    const sendMessage = () => {
        if (stompClient && partner && newMessage.trim()) {
            stompClient.publish({
                destination: `/app/chat.private.${partner.id}`,
                body: JSON.stringify({ sender: username, content: newMessage })
            });
            setNewMessage('');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto' }}>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="E-Mail suchen"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px', width: '70%' }}
                />
                <button onClick={searchUser}>Suchen</button>
            </div>
            {partner && <h3>Chat mit {partner.name}</h3>}
            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                        <b>{msg.sender}: </b>{msg.content}
                    </div>
                ))}
            </div>
            {partner && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <input
                        style={{ flex: 1, padding: '5px' }}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Nachricht schreiben"
                    />
                    <button onClick={sendMessage}>Senden</button>
                </div>
            )}
        </div>
    );
}

export default PrivateChat;
