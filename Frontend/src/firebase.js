// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChDZvBI8DpxGMnujYQkYstxsFrPh-2VQA",
  authDomain: "fittracker-a6691.firebaseapp.com",
  projectId: "fittracker-a6691",
  storageBucket: "fittracker-a6691.firebasestorage.app",
  messagingSenderId: "753026528272",
  appId: "1:753026528272:web:6305891e249b5233d38695",
  measurementId: "G-VNZKGEXSTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };