import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { FaUserCircle, FaPaperPlane, FaEllipsisV } from 'react-icons/fa';
import ChatList from './ChatList';

function PrivateChat({ username }) {
    const [stompClient, setStompClient] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [partner, setPartner] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchHistory = async (id, name) => {
        try {
            const token = localStorage.getItem('token');
            const histRes = await fetch(`http://localhost:8080/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (histRes.ok) {
                const hist = await histRes.json();
                setAllMessages(
                    hist.map((m) => ({
                        ...m,
                        sender: m.senderId === id ? name : username,
                    }))
                );
            } else {
                setAllMessages([]);
            }
        } catch {
            setAllMessages([]);
        }
    };

    const handleSelectChat = (conv) => {
        setPartner({ id: conv.partnerId, name: conv.partnerName });
        setActiveChatId(conv.partnerId);
        fetchHistory(conv.partnerId, conv.partnerName);
    };

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
                    setAllMessages((prev) => [...prev, body]);
                    setRefreshKey((k) => k + 1);
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
            setActiveChatId(data.id);
            await fetchHistory(data.id, data.name);
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
            setRefreshKey((k) => k + 1);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const messages = allMessages.filter(
        (m) => m.senderId === activeChatId || m.receiverId === activeChatId
    );

    return (
        <div className="chat-wrapper">
            <ChatList 
                onSelectChat={handleSelectChat} 
                activeChatId={activeChatId} 
                refreshKey={refreshKey} 
                searchEmail={searchEmail} 
                setSearchEmail={setSearchEmail} 
                searchUser={searchUser} 
            />
            <div className="chat-container">
                {partner ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-avatar">
                                {partner.name ? partner.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="chat-header-info">
                                <div className="chat-header-name">{partner.name}</div>
                            </div>
                            <div className="chat-header-actions">
                                <button className="chat-header-button">
                                    <FaEllipsisV />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
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
                    </>
                ) : (
                    <>
                        {/* Empty State */}
                        <div className="chat-header">
                            <div className="chat-header-avatar">
                                <FaUserCircle />
                            </div>
                            <div className="chat-header-info">
                                <div className="chat-header-name">Wähle einen Chat aus</div>
                                <div className="chat-header-status">Kein Chat ausgewählt</div>
                            </div>
                        </div>
                        <div className="chat-messages">
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%',
                                color: '#667781',
                                fontSize: '16px',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                                    <div>Wähle einen Chat aus der Liste aus</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                                        oder suche nach einem Benutzer
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PrivateChat;
