import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyCti26JJgYynsbPk4cdH5iNvTqyGtDEtJQ",
  authDomain: "vinculos-de-oro.firebaseapp.com",
  projectId: "vinculos-de-oro",
  storageBucket: "vinculos-de-oro.appspot.com",
  messagingSenderId: "1051816468161",
  appId: "1:1051816468161:web:79da2e868665a31686fe40"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { getFirestore, app, db };