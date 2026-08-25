// Firebase project: hm-traders-pro
const firebaseConfig = {
  apiKey: "AIzaSyAuHtjgiRR6l1PAQrgez7X7vG9-3L8C35g",
  authDomain: "hm-traders-pro.firebaseapp.com",
  projectId: "hm-traders-pro",
  storageBucket: "hm-traders-pro.firebasestorage.app",
  messagingSenderId: "714339675790",
  appId: "1:714339675790:web:f8da9e83e1afc43847a3df"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Keeps the app usable offline and syncs automatically when back online
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
