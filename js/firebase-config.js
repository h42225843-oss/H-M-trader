// ⚠️ Replace these values with YOUR Firebase project's config.
// Firebase Console → Project Settings → General → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Keeps the app usable offline and syncs automatically when back online
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
