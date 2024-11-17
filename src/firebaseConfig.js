// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDcb44uz5oGOfZucUMZvtGzktHMw5FMc70",
    authDomain: "chatfetureproj.firebaseapp.com",
    projectId: "chatfetureproj",
    storageBucket: "chatfetureproj.firebasestorage.app",
    messagingSenderId: "514575659186",
    appId: "1:514575659186:web:3eafa3b143d0bf1cce59ab"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };