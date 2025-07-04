import React, {useEffect, useState} from 'react';
import '../styles/common.css';

const ChatList = ({onSelectChat, activeChatId, refreshKey = 0}) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:8080/api/conversations', {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [refreshKey]);

    if (loading) return <div className="chat-list">Lädt...</div>;

    return (
        <div className="chat-list">
            {conversations.length === 0 && <div>Keine Chats vorhanden.</div>}
            {conversations.map(conv => (
                <div
                    key={conv.partnerId}
                    className={`chat-list-item${activeChatId === conv.partnerId ? ' active' : ''}`}
                    onClick={() => onSelectChat(conv)}
                >
                    <div className="chat-list-name">{conv.partnerName}</div>
                    <div className="chat-list-last">
                        {conv.lastSentByMe ? 'Du: ' : `${conv.partnerName}: `}
                        {conv.lastMessage}
                    </div>
                    <div className="chat-list-time">{new Date(conv.timestamp).toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
};

export default ChatList; 