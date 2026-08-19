import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut,
  Unsubscribe 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    callback(user);
  });
};

export const loginWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Sheets OAuth access token from Firebase credential.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignIn = loginWithGoogle;

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const logout = logoutGoogle;
