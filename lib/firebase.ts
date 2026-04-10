import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCzDPUYKRHLYyuELN-5vyQMDLKsh8ln038',
  authDomain: 'odza-1af37.firebaseapp.com',
  projectId: 'odza-1af37',
  storageBucket: 'odza-1af37.firebasestorage.app',
  messagingSenderId: '64171880266',
  appId: '1:64171880266:web:348c08af8844f444049bb3',
  measurementId: 'G-XQKYJVZ950',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
export const db = getFirestore(app);
