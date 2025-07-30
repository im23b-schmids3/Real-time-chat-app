import React, {useEffect, useState} from 'react';
import '../styles/common.css';
import { FaSearch } from 'react-icons/fa';

const ChatList = ({onSelectChat, activeChatId, refreshKey = 0, searchEmail, setSearchEmail, searchUser}) => {
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
            <div className="search-container" style={{ boxShadow: '0 2px 8px rgba(44,62,80,0.06)', background: '#fff', borderRadius: 'var(--border-radius)', marginBottom: 0, padding: '16px 18px 8px 18px' }}>
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
            {conversations.length === 0 && <div>Keine Chats vorhanden.</div>}
            {conversations.map(conv => (
                <div
                    key={conv.partnerId}
                    className={`chat-list-item${activeChatId === conv.partnerId ? ' active' : ''}`}
                    onClick={() => onSelectChat(conv)}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                        <div className="chat-list-avatar">
                            {conv.partnerName ? conv.partnerName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div style={{flex: 1}}>
                            <div className="chat-list-name">{conv.partnerName}</div>
                            <div className="chat-list-last">
                                {conv.lastSentByMe ? 'Du: ' : `${conv.partnerName}: `}
                                {conv.lastMessage}
                            </div>
                        </div>
                        <div className="chat-list-time">{new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList; 