import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase のウェブ設定は公開前提の識別情報。env があればそちらを優先する。
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCxVdxw6UR1aPr2krBLMTxlko4Kz5GsXs4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'flashingwind-github-io.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'flashingwind-github-io',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'flashingwind-github-io.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '850265188356',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:850265188356:web:8e356d1f54aeb3770d2d51',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-3Q5LDSW2S2',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
