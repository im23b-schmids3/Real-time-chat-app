import React, {useEffect, useState} from 'react';
import '../styles/common.css';
import { FaSearch, FaEllipsisV } from 'react-icons/fa';

const ChatList = ({onSelectChat, activeChatId, refreshKey = 0, searchEmail, setSearchEmail, searchUser, onLogout}) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

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

    if (loading) return (
        <div className="chat-list">
            <div className="chat-header">
                <div className="chat-header-title">Chats</div>
                <div className="chat-header-actions" style={{ position: 'relative' }}>
                    <button className="chat-header-button" onClick={() => setMenuOpen((v) => !v)}>
                        <FaEllipsisV />
                    </button>
                    {menuOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}>
                                Abmelden
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', color: '#667781' }}>
                Lädt...
            </div>
        </div>
    );

    return (
        <div className="chat-list">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-title">Chats</div>
                <div className="chat-header-actions" style={{ position: 'relative' }}>
                    <button className="chat-header-button" onClick={() => setMenuOpen((v) => !v)}>
                        <FaEllipsisV />
                    </button>
                    {menuOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}>
                                Abmelden
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Container */}
            <div className="search-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="E-Mail-Adresse eingeben..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                    <button 
                        className="search-button" 
                        onClick={searchUser}
                        style={{ 
                            background: 'var(--primary-color)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            padding: '6px 12px', 
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Suchen
                    </button>
                </div>
            </div>

            {/* Chat List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 && (
                    <div style={{ 
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        color: '#667781',
                        fontSize: '14px'
                    }}>
                        Keine Chats vorhanden.
                    </div>
                )}
                {conversations.map(conv => (
                    <div
                        key={conv.partnerId}
                        className={`chat-list-item${activeChatId === conv.partnerId ? ' active' : ''}`}
                        onClick={() => onSelectChat(conv)}
                    >
                        <div className="chat-list-avatar">
                            {conv.partnerName ? conv.partnerName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="chat-list-content">
                            <div className="chat-list-header">
                                <div className="chat-list-name">{conv.partnerName}</div>
                                <div className="chat-list-time">
                                    {new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            <div className="chat-list-last">
                                {conv.lastSentByMe ? 'Du: ' : `${conv.partnerName}: `}
                                {conv.lastMessage}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList; 