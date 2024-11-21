import React, { useState, useEffect } from 'react';
import { ref, push, onValue, query, limitToLast, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { Howl } from 'howler';

// Sound URLs
const sendSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3';
const receiveSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_805cb7cfaa.mp3';

// Sound instances
const sendSound = new Howl({ src: [sendSoundUrl], volume: 0.5 });
const receiveSound = new Howl({ src: [receiveSoundUrl], volume: 0.5 });

const Chat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageCount, setMessageCount] = useState(10);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);

  // Load messages from Firebase
  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(messagesRef, limitToLast(messageCount));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data
        ? Object.entries(data)
            .map(([id, msg]) => ({
              id,
              ...msg,
              readBy: msg.readBy || [],
            }))
            .filter((msg) => msg.participants.includes(user.email))
        : [];

      const sortedMessages = loadedMessages.sort((a, b) => a.timestamp - b.timestamp);

      if (sortedMessages.length > messages.length && sortedMessages[sortedMessages.length - 1]?.user !== user.email) {
        receiveSound.play();
      }

      setMessages(sortedMessages);
      setAllMessagesLoaded(sortedMessages.length < messageCount);
    });

    return () => unsubscribe();
  }, [messageCount, messages.length, user.email]);

  const sendMessage = () => {
    if (message.trim() && recipient.trim()) {
      const messagesRef = ref(database, 'messages');
      push(messagesRef, {
        text: message,
        user: user.email,
        timestamp: Date.now(),
        participants: [user.email, recipient],
        readBy: [],
      });
      sendSound.play();
      setMessage('');
    } else {
      alert('Message and recipient are required!');
    }
  };

  const markAsRead = (msg) => {
    if (msg.user !== user.email && !msg.readBy.includes(user.email)) {
      const messageRef = ref(database, `messages/${msg.id}`);
      update(messageRef, {
        readBy: [...msg.readBy, user.email],
      });
    }
  };

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.user !== user.email && !msg.readBy.includes(user.email)) {
        markAsRead(msg);
      }
    });
  }, [messages, user.email]);

  const loadMoreMessages = () => {
    setMessageCount((prevCount) => prevCount + 10);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevInput) => prevInput + emojiObject.emoji);
  };


  const clearChat = () => {
    const userMessages = messages.filter((msg) => msg.user === user.email);
    userMessages.forEach((msg) => {
      const messageRef = ref(database, `messages/${msg.id}`);
      remove(messageRef);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '440px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <input
        type="email"
        placeholder="Recipient's email"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
      />
      <button
        onClick={clearChat}
        style={{
          marginBottom: '10px',
          padding: '8px 12px',
          backgroundColor: '#ff4d4d',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Clear Chat
      </button>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
          backgroundColor: '#f9f9f9',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {!allMessagesLoaded && (
          <button
            onClick={loadMoreMessages}
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Load More
          </button>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '10px',
              padding: '10px',
              borderRadius: '15px',
              backgroundColor: msg.user === user.email ? '#dcf8c6' : '#ffffff',
              maxWidth: '70%',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              marginLeft: msg.user === user.email ? 'auto' : '0',
              marginRight: msg.user === user.email ? '0' : 'auto',
            }}
          >
            <strong>{msg.user === user.email ? 'You' : msg.user}:</strong> {msg.text}
            <div
              style={{
                fontSize: '0.8em',
                color: '#555',
                marginTop: '5px',
                textAlign: msg.user === user.email ? 'right' : 'left',
              }}
            >
              {format(new Date(msg.timestamp), 'PPpp')}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '2px solid #007bff',
            marginRight: '5px',
          }}
        />
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            padding: '10px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '5px',
          }}
        >
          😊
        </button>
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
      {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
    </div>
  );
};

export default Chat;