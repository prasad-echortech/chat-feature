import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import Login from './Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error logging out: ", error);
    });
  };

  return (
    <div className="App">
      <h1 style={{ color: "white", fontWeight: "bold", backgroundColor: "green", padding: 7 }}>Real-time Chat Website</h1>
      {user?.email ? (<p><span style={{ color: "blue", fontWeight: "bold" }}>{user?.email}</span> Logged in </p>
      ) : ""}
      {user ? (
        <>
          <Chat user={user} />
          <button style={{marginBottom:"1.4rem", padding:6}} onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;