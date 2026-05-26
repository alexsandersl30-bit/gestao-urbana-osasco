import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyAUe06QZA4IOPJvqiGr1gGcuJlKmjUch1Q',
  authDomain: 'gestao-urbana-osasco.firebaseapp.com',
  projectId: 'gestao-urbana-osasco',
  appId: '1:387897890664:web:ec45a0e605d4dd0db6a8dd',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
