import { initializeApp } from 'firebase/app';
import { getAuth} from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBpIOdTp2aOgm1bLcNlW5v7Ou_G1I47ePY",
    authDomain: "final-58cb5.firebaseapp.com",
    projectId: "final-58cb5",
    storageBucket: "final-58cb5.appspot.com",
    messagingSenderId: "216161773917",
    appId: "1:216161773917:web:e4841920fc7e04a5eda0b4"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const storage = getStorage(app);

