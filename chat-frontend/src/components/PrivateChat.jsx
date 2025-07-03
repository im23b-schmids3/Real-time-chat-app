import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import ChatList from './ChatList';

function PrivateChat({ username }) {
    const [stompClient, setStompClient] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [partner, setPartner] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                client.subscribe('/user/queue/private', (msg) => {
                    const body = JSON.parse(msg.body);
                    setAllMessages(prev => [...prev, body]);
                });
            }
        });
        client.activate();
        setStompClient(client);
        return () => {
            client.deactivate();
        };
    }, []);

    useEffect(() => {
        if (activeChatId) {
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const histRes = await fetch(`http://localhost:8080/api/messages/${activeChatId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (histRes.ok) {
                        const hist = await histRes.json();
                        setAllMessages(hist.map(m => ({
                            ...m,
                            sender: m.senderId === activeChatId ? (partner ? partner.name : 'Partner') : username
                        })));
                    } else {
                        setAllMessages([]);
                    }
                } catch {}
            })();
        }
    }, [activeChatId]);

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
                setAllMessages(hist.map(m => ({
                    ...m,
                    sender: m.senderId === data.id ? data.name : username
                })));
            } else {
                setAllMessages([]);
            }
        } catch (err) {
            console.error(err);
            setPartner(null);
            setAllMessages([]);
        }
    };

    const sendMessage = () => {
        if (stompClient && partner && newMessage.trim()) {
            console.log("Sende private Nachricht an", partner && partner.id, "Inhalt:", newMessage);
            console.log("stompClient connected:", stompClient && stompClient.connected);
            try {
                stompClient.publish({
                    destination: `/app/chat.private.${partner.id}`,
                    body: JSON.stringify({ sender: username, content: newMessage })
                });
            } catch (e) {
                console.error("Fehler beim Senden der Nachricht:", e);
            }
            setNewMessage('');
        }
    };

    const messages = allMessages.filter(m =>
        (m.senderId === activeChatId && m.receiverId === partner?.id) ||
        (m.senderId === partner?.id && m.receiverId === activeChatId)
    );

    return (
        <div className="chat-wrapper">
            <ChatList onSelectChat={setActiveChatId} activeChatId={activeChatId} />
            <div className="chat-container">
                <div className="search-container" style={{ boxShadow: '0 2px 8px rgba(44,62,80,0.06)', background: '#fff', borderRadius: 'var(--border-radius)', marginBottom: 0 }}>
                    <span style={{ color: 'var(--primary-color)', fontSize: 20, marginRight: 8 }}><FaSearch /></span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="E-Mail-Adresse eingeben..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}
                    />
                    <button className="search-button" onClick={searchUser} style={{ minWidth: 90 }}>Suchen</button>
                </div>
                {partner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8f9fa', borderRadius: 'var(--border-radius)', margin: '18px 0 0 0', padding: '12px 24px', boxShadow: '0 1px 4px rgba(44,62,80,0.04)' }}>
                        <span style={{ fontSize: 32, color: 'var(--primary-color)' }}><FaUserCircle /></span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--secondary-color)' }}>{partner.name}</div>
                            <div style={{ fontSize: 14, color: '#888' }}>{partner.email}</div>
                        </div>
                    </div>
                )}
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={
                                'message' + (msg.sender === username ? ' own' : '')
                            }
                        >
                            <div className="message-sender">{msg.sender}</div>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))}
                </div>
                {partner && (
                    <div className="chat-input-container">
                        <input
                            className="chat-input"
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Nachricht schreiben"
                        />
                        <button className="chat-button" onClick={sendMessage}>Senden</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrivateChat;
