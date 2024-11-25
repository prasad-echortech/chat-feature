import React, { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, query, limitToLast, remove, update, get } from 'firebase/database';
import { database } from './firebaseConfig';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { Howl } from 'howler';

const sendSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3';
const receiveSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_805cb7cfaa.mp3';

const sendSound = new Howl({ src: [sendSoundUrl], volume: 0.5 });
const receiveSound = new Howl({ src: [receiveSoundUrl], volume: 0.5 });

const MESSAGES_PER_PAGE = 10;

const Chat = ({ user, recipient }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageCount, setMessageCount] = useState(MESSAGES_PER_PAGE);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const chatId = [user.email, recipient]
    .sort()
    .join('_')
    .replace(/\./g, '_');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user.email || !recipient) return;

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, limitToLast(messageCount));

    const unsubscribe = onValue(messagesQuery, async (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];

      if (data) {
        const messagePromises = Object.entries(data).map(async ([id, msg]) => {
          if (Array.isArray(msg.participants) && 
              msg.participants.includes(user.email) && 
              msg.participants.includes(recipient)) {
            
      
            if (msg.user !== user.email && (!msg.readBy || !msg.readBy.includes(user.email))) {
              const messageRef = ref(database, `chats/${chatId}/messages/${id}`);
              await update(messageRef, {
                readBy: [...(msg.readBy || []), user.email]
              });
            }

            return {
              id,
              ...msg,
              readBy: msg.readBy || []
            };
          }
          return null;
        });

        const processedMessages = await Promise.all(messagePromises);
        loadedMessages.push(...processedMessages.filter(msg => msg !== null));
      }

      const sortedMessages = loadedMessages
        .sort((a, b) => a.timestamp - b.timestamp);

      if (sortedMessages.length > messages.length && 
          sortedMessages[sortedMessages.length - 1]?.user !== user.email) {
        receiveSound.play();
      }

      setMessages(sortedMessages);
      setAllMessagesLoaded(sortedMessages.length < messageCount);

      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [messageCount, user.email, recipient, chatId]);

  const sendMessage = () => {
    if (message.trim() && recipient.trim()) {
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const chatRef = ref(database, `chats/${chatId}`);

      const newMessageRef = push(messagesRef, {
        text: message,
        user: user.email,
        timestamp: Date.now(),
        participants: [user.email, recipient],
        readBy: [user.email],
      });

      update(chatRef, {
        participants: [user.email, recipient],
        lastMessage: message,
        lastMessageTime: Date.now()
      });

      sendSound.play();
      setMessage('');
      setShowEmojiPicker(false);
      scrollToBottom();
    } else {
      alert('Message and recipient are required!');
    }
  };

  const loadMoreMessages = () => {
    setMessageCount((prevCount) => prevCount + MESSAGES_PER_PAGE);
  };

  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      try {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        await remove(messagesRef);
        setMessages([]);
        
        const chatRef = ref(database, `chats/${chatId}`);
        await update(chatRef, {
          lastMessage: '',
          lastMessageTime: Date.now()
        });
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  if (!recipient) {
    return <div style={{ padding: '20px' }}>Select a chat to start messaging</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '440px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3>Chat with {recipient}</h3>
        <button
          onClick={clearChat}
          style={{
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Chat
        </button>
      </div>

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
              width: '100%'
            }}
          >
            Load More
          </button>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
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
                display: 'flex',
                justifyContent: msg.user === user.email ? 'space-between' : 'flex-start',
                alignItems: 'center'
              }}
            >
              <span>{format(new Date(msg.timestamp), 'PPpp')}</span>
              {msg.user === user.email && (
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  {msg.readBy.includes(recipient) ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
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

      {showEmojiPicker && (
        <div style={{ position: 'absolute', bottom: '100px', right: '20px' }}>
          <EmojiPicker onEmojiClick={(emojiObject) => {
            setMessage((prevInput) => prevInput + emojiObject.emoji);
          }} />
        </div>
      )}
    </div>
  );
};

export default Chat;