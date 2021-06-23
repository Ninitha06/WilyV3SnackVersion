import firebase from "firebase";
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyA0O_wiGAydxxPi34eOUjTIMEsmlLN1Ag4",
  authDomain: "wili-v2.firebaseapp.com",
  databaseURL: "https://wili-v2-default-rtdb.firebaseio.com",
  projectId: "wili-v2",
  storageBucket: "wili-v2.appspot.com",
  messagingSenderId: "1059796611045",
  appId: "1:1059796611045:web:6621c19b921529cf8b090c",
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase.firestore();