// Re-export Firestore functions from JS to keep TS analysis shallow
export { collection, doc, getDoc, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
