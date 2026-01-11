import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, remove, update, child, runTransaction, DatabaseReference } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBxVo6js70ZSSb-W8Qo77tbcM63EHJ6f0o",
  authDomain: "khnpmeeting-7e554.firebaseapp.com",
  projectId: "khnpmeeting-7e554",
  storageBucket: "khnpmeeting-7e554.firebasestorage.app",
  messagingSenderId: "604104074596",
  appId: "1:604104074596:web:d85fa8cacfb9fdf8810671",
  databaseURL: "https://khnpmeeting-7e554-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export { ref, set, get, onValue, push, remove, update, child, runTransaction };
export type { DatabaseReference };
