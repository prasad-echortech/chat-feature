import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from './firebaseConfig';

const ChatList = ({ user, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);

  useEffect(() => {
    const chatsRef = ref(database, 'chats');
    
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const userChats = [];

      if (data) {
        Object.entries(data).forEach(([chatId, chat]) => {
          // console.log([chatId, chat], "------------------")

          if (chat.participants?.includes(user.email)) {
            const otherUser = chat.participants.find(p => p !== user.email);
            userChats.push({
              chatId,
              recipient: otherUser,
              lastMessage: chat.lastMessage,
              lastMessageTime: chat.lastMessageTime
            });
          }
        });
      }

      setChats(userChats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0)));
    });

    return () => unsubscribe();
  }, [user.email]);

  const createNewChat = async (e) => {
    e.preventDefault();
    if (newChatEmail && newChatEmail !== user.email) {
      const chatId = [user.email, newChatEmail]
        .sort()
        .join('_')
        .replace(/\./g, '_');

      const chatRef = ref(database, `chats/${chatId}`);
      
      await set(chatRef, {
        participants: [user.email, newChatEmail],
        lastMessageTime: Date.now(),
        lastMessage: ''
      });

      setNewChatEmail('');
      setShowNewChatForm(false);
      onSelectChat(newChatEmail);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', borderRight: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>All Chats</h3>
        <button
          onClick={() => setShowNewChatForm(!showNewChatForm)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          New Chat
        </button>
      </div>

      {showNewChatForm && (
        <form onSubmit={createNewChat} style={{ marginBottom: '20px' }}>
          <input
            type="email"
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            placeholder="Enter email address"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Start Chat
          </button>
        </form>
      )}

      {chats.length === 0 ? (
        <p>No chats yet. Start a new conversation!</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat(chat.recipient)}
            style={{
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
          >
            <div style={{ fontWeight: 'bold' }}>{chat.recipient}</div>
            {chat.lastMessage && (
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                {chat.lastMessage.length > 30 
                  ? chat.lastMessage.substring(0, 30) + '...' 
                  : chat.lastMessage}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;