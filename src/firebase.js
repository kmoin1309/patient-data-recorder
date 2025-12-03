import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDo4Q1lmUIHYWMTmkk07KAUOo_4L0GbgFQ",
    authDomain: "smart-care-f0ae2.firebaseapp.com",
    databaseURL: "https://smart-care-f0ae2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-care-f0ae2",
    storageBucket: "smart-care-f0ae2.firebasestorage.app",
    messagingSenderId: "389190238567",
    appId: "1:389190238567:web:0d7c0f593e2469a20eefc2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
