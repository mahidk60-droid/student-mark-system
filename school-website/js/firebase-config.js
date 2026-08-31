    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      databaseURL: "https://dhs-school-69e77-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    window.dbSave = async function(path, data) {
      try { return await set(ref(db, path), data); } catch (err) { console.error("Firebase Save Error:", err); }
    };

    window.dbGet = async function(path) {
      try {
        const snapshot = await get(child(ref(db), path));
        return snapshot.exists() ? snapshot.val() : null;
      } catch (err) { console.error("Firebase Get Error:", err); return null; }
    };

    window.dbRemove = async function(path) {
      try { return await remove(ref(db, path)); } catch (err) { console.error("Firebase Remove Error:", err); }
    };

    window.dispatchEvent(new Event('firebase-ready'));
