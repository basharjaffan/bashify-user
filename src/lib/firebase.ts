import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAop3F_OqJJwWH9nPtEBpzFsCQ_jI0RQAY",
  authDomain: "bashify-af01b.firebaseapp.com",
  projectId: "bashify-af01b",
  storageBucket: "bashify-af01b.firebasestorage.app",
  messagingSenderId: "710711085610",
  appId: "1:710711085610:web:b2f14fb7f1dd6b17c0b4dd",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
