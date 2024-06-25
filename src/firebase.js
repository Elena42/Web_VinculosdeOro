import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
  apiKey: "AIzaSyCti26JJgYynsbPk4cdH5iNvTqyGtDEtJQ",
  authDomain: "vinculos-de-oro.firebaseapp.com",
  projectId: "vinculos-de-oro",
  storageBucket: "vinculos-de-oro.appspot.com",
  messagingSenderId: "1051816468161",
  appId: "1:1051816468161:web:79da2e868665a31686fe40"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Acceder a los servicios de autenticación y Firestore
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

export default firebase;