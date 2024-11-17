// import React, { useState, useEffect } from 'react';
// import { ref, push, onValue, query, limitToLast, remove, update } from 'firebase/database';
// import { database } from './firebaseConfig';
// import EmojiPicker from 'emoji-picker-react';
// import { format } from 'date-fns';

// const Chat = ({ user }) => {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [messageCount, setMessageCount] = useState(10); // Number of messages to load
//   const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);

//   useEffect(() => {
//     const messagesRef = ref(database, 'messages');
//     const messagesQuery = query(messagesRef, limitToLast(messageCount));

//     onValue(messagesQuery, (snapshot) => {
//       const data = snapshot.val();
//       const messagesList = data ? Object.entries(data).map(([id, msg]) => ({ id, ...msg, readBy: msg.readBy || [] })).reverse() : [];
//       setMessages(messagesList);
//       setAllMessagesLoaded(messagesList.length < messageCount); // Check if all messages are loaded
//     });
//   }, [messageCount]);

//   const sendMessage = () => {
//     if (message.trim()) {
//       const messagesRef = ref(database, 'messages');
//       push(messagesRef, {
//         text: message,
//         user: user.email,
//         timestamp: Date.now(),
//         readBy: [], // Initialize as empty
//       });
//       setMessage('');
//     }
//   };

//   const onEmojiClick = (emojiObject) => {
//     setMessage(prevInput => prevInput + emojiObject.emoji);
//   };

//   const loadMoreMessages = () => {
//     setMessageCount(prevCount => prevCount + 10); // Load 10 more messages
//   };

//   const markAsRead = (msg) => {
//     if (msg.user !== user.email && !msg.readBy.includes(user.email)) {
//       const messageRef = ref(database, `messages/${msg.id}`);
//       update(messageRef, {
//         readBy: [...msg.readBy, user.email], // Add the current user to the readBy array
//       });
//     }
//   };

//   const clearChat = () => {
//     const userMessages = messages.filter(msg => msg.user === user.email);
//     userMessages.forEach(msg => {
//       const messageRef = ref(database, `messages/${msg.id}`);
//       remove(messageRef); // Remove only the user's messages
//     });
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
//       <button onClick={clearChat} style={{ marginBottom: '10px' }}>Clear My Chat</button>
//       <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px', backgroundColor: '#fff' }}>
//         {messages.map((msg, index) => (
//           <div key={index} style={{
//             marginBottom: '10px',
//             padding: '10px',
//             borderRadius: '10px',
//             backgroundColor: msg.user === user.email ? '#e1ffc7' : '#f0f0f0',
//             alignSelf: msg.user === user.email ? 'flex-end' : 'flex-start',
//             maxWidth: '80%',
//             position: 'relative'
//           }} onClick={() => markAsRead(msg)}>
//             <strong>{msg.user === user.email ? 'You' : msg.user}:</strong> {msg.text}
//             <div style={{ fontSize: '0.8em', color: '#555', marginTop: '5px' }}>
//               {format(new Date(msg.timestamp), 'PPpp')}
//             </div>
//             <div>
//               {msg.user === user.email && (
//                 <>
//                   <span style={{ color: 'green' }}>✓</span>
//                   {msg.readBy.length > 0 && <span style={{ color: 'green' }}>✓</span>}
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//         {!allMessagesLoaded && (
//           <button onClick={loadMoreMessages} style={{ marginTop: '10px' }}>Load More</button>
//         )}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         style={{ width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
//       />
//       <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ marginLeft: '5px' }}>😊</button>
//       <button onClick={sendMessage} style={{ marginLeft: '5px' }}>Send</button>
//       {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
//     </div>
//   );
// };

// export default Chat;


import React, { useState, useEffect } from 'react';
import { ref, push, onValue, query, limitToLast, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';

const Chat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageCount, setMessageCount] = useState(10); // Number of messages to load
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(messagesRef, limitToLast(messageCount));

    onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const messagesList = data ? Object.entries(data).map(([id, msg]) => ({ id, ...msg, readBy: msg.readBy || [] })).reverse() : [];
      setMessages(messagesList);
      setAllMessagesLoaded(messagesList.length < messageCount); // Check if all messages are loaded
    });
  }, [messageCount]);

  const sendMessage = () => {
    if (message.trim()) {
      const messagesRef = ref(database, 'messages');
      push(messagesRef, {
        text: message,
        user: user.email,
        timestamp: Date.now(),
        readBy: [], // Initialize as empty
      });
      setMessage('');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const loadMoreMessages = () => {
    setMessageCount(prevCount => prevCount + 10); // Load 10 more messages
  };

  const markAsRead = (msg) => {
    if (msg.user !== user.email && !msg.readBy.includes(user.email)) {
      const messageRef = ref(database, `messages/${msg.id}`);
      update(messageRef, {
        readBy: [...msg.readBy, user.email], // Add the current user to the readBy array
      });
    }
  };

  useEffect(() => {
    // Mark messages as read when they are viewed
    messages.forEach(msg => {
      if (msg.user !== user.email && !msg.readBy.includes(user.email)) {
        markAsRead(msg);
      }
    });
  }, [messages]);

  const clearChat = () => {
    const userMessages = messages.filter(msg => msg.user === user.email);
    userMessages.forEach(msg => {
      const messageRef = ref(database, `messages/${msg.id}`);
      remove(messageRef); // Remove only the user's messages
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={clearChat} style={{ marginBottom: '10px' }}>Clear My Chat</button>
      <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px', backgroundColor: '#fff' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: msg.user === user.email ? '#e1ffc7' : '#f0f0f0',
            alignSelf: msg.user === user.email ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            position: 'relative'
          }}>
            <strong>{msg.user === user.email ? 'You' : msg.user}:</strong> {msg.text}
            <div style={{ fontSize: '0.8em', color: '#555', marginTop: '5px' }}>
              {format(new Date(msg.timestamp), 'PPpp')}
            </div>
            <div>
              {msg.user === user.email && (
                <>
                  <span style={{ color: 'green' }}>✓</span>
                  {msg.readBy.length > 0 && <span style={{ color: 'green' }}>✓</span>}
                </>
              )}
            </div>
          </div>
        ))}
        {!allMessagesLoaded && (
          <button onClick={loadMoreMessages} style={{ marginTop: '10px' }}>Load More</button>
        )}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ marginLeft: '5px' }}>😊</button>
      <button onClick={sendMessage} style={{ marginLeft: '5px' }}>Send</button>
      {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
    </div>
  );
};

export default Chat;