import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                onLogin(userCredential.user);
            })
            .catch((error) => {
                console.error("Error logging in: ", error);
            });
    };

    return (
        <div>
            <input
                style={{ marginRight: 5, padding: 4 }}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                style={{ marginRight: 5, padding: 4 }}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button style={{ marginTop: "10px", padding: 5 }} onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;