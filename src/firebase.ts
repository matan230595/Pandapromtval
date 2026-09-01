import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  projectId: "sapient-question-mxfhk",
  appId: "1:708196504798:web:176b7b7354d2daf3295e4f",
  apiKey: "AIzaSyBB79fYRXqe5bzrBXXsIOmjTrOaMU_lNqw",
  authDomain: "sapient-question-mxfhk.firebaseapp.com",
  storageBucket: "sapient-question-mxfhk.firebasestorage.app",
  messagingSenderId: "708196504798",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.log("Sign-in popup closed by user.");
      return null;
    }
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
