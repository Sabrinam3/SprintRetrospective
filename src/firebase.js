// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
//authenticaion module
import "firebase/auth";

// Add the Firebase products that you want to use
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmcIIoWIddhC89oIkKoNgtFo-rQr1Kl2c",
  authDomain: "platfromnine-threequarters.firebaseapp.com",
  databaseURL: "https://platfromnine-threequarters.firebaseio.com",
  projectId: "platfromnine-threequarters",
  storageBucket: "platfromnine-threequarters.appspot.com",
  messagingSenderId: "276042197624",
  appId: "1:276042197624:web:deac9ce0b372f919b09b8d",
  measurementId: "G-ZDNWDM9TFF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const app = firebase.auth();
