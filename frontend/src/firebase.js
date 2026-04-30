import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGDibnxRVlxVSu1Rz1_IsHGmmVYPl0F1g",
  authDomain: "tripzo-dade4.firebaseapp.com",
  projectId: "tripzo-dade4",
  storageBucket: "tripzo-dade4.firebasestorage.app",
  messagingSenderId: "144864890886",
  appId: "1:144864890886:web:cec33db097fd1ff6bf3387"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);