import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import Login from './Login';
import ChatList from './ChatList';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        setSelectedChat(null);
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h1
        style={{
          color: 'white',
          fontWeight: 'bold',
          backgroundColor: 'green',
          padding: 7,
          textAlign: 'center',
        }}
      >
        Real-time Chat Website
      </h1>
      {user?.email ? (
        <p>
          <span style={{ color: 'blue', fontWeight: 'bold' }}>{user?.email}</span> Logged in
        </p>
      ) : (
        ''
      )}
      {user ? (
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Chat List */}
          <ChatList
            user={user}
            onSelectChat={(chatUser) => setSelectedChat(chatUser)}
          />

          {/* Chat Window */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <Chat user={user} recipient={selectedChat} />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1.2rem',
                  color: '#555',
                }}
              >
                Select a chat to start messaging
              </div>
            )}
            <button
              style={{
                margin: '1.4rem auto',
                padding: 6,
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;