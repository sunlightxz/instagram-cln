import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBEYz-7oGEFbR2svufwfSwbAW2G2YJh4Gs",
  authDomain: "ig-viewr.firebaseapp.com",
  projectId: "ig-viewr",
  storageBucket: "ig-viewr.appspot.com",
  messagingSenderId: "653271561197",
  appId: "1:653271561197:web:c539327e97f9369474ade4"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
export { firestore, auth, storage, analytics };
