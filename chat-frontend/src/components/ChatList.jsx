import React, { useEffect, useState } from 'react';
import '../styles/common.css';

const ChatList = ({ onSelectChat, activeChatId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/conversations', {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setConversations(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="chat-list">Lädt...</div>;

    return (
        <div className="chat-list">
            {conversations.length === 0 && <div>Keine Chats vorhanden.</div>}
            {conversations.map(conv => (
                <div
                    key={conv.partnerId}
                    className={`chat-list-item${activeChatId === conv.partnerId ? ' active' : ''}`}
                    onClick={() => onSelectChat(conv.partnerId)}
                >
                    <div className="chat-list-name">{conv.partnerName}</div>
                    <div className="chat-list-last">{conv.lastMessage}</div>
                    <div className="chat-list-time">{new Date(conv.timestamp).toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
};

export default ChatList; 