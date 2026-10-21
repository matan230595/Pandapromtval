import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseAppletConfig from "../firebase-applet-config.json";

const firebaseConfig = {
  projectId: firebaseAppletConfig.projectId || "sapient-question-mxfhk",
  appId: firebaseAppletConfig.appId || "1:708196504798:web:176b7b7354d2daf3295e4f",
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyBB79fYRXqe5bzrBXXsIOmjTrOaMU_lNqw",
  authDomain: firebaseAppletConfig.authDomain || "sapient-question-mxfhk.firebaseapp.com",
  storageBucket: firebaseAppletConfig.storageBucket || "sapient-question-mxfhk.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "708196504798",
};

const app = initializeApp(firebaseConfig);
export const db = firebaseAppletConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
  : getFirestore(app);
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

export const loginWithEmail = async (email: string, pass: string) => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const signupWithEmail = async (email: string, pass: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
