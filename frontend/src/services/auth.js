import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, provider } from '../firebase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    this.isInitialized = false;
    this.initializeAuthListener();
  }

  initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await this.getUserDocument(user.uid);
          
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            lastLoginAt: user.metadata.lastSignInTime,
            ...userDoc
          };

          await this.updateUserDocument(user.uid, {
            lastActive: serverTimestamp()
          });

        } catch (error) {
          console.error('Error fetching user document:', error);
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
        }
      } else {
        this.currentUser = null;
      }
      
      this.isInitialized = true;
      this.notifyListeners();
    });
  }

  async getUserDocument(uid) {
    if (!db) return {};
    
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        // Create initial user document
        const initialData = {
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true
          },
          stats: {
            documentsAnalyzed: 0,
            queriesSubmitted: 0,
            totalSavings: 0
          },
          subscription: {
            tier: 'free',
            limits: {
              documentsPerMonth: 5,
              queriesPerMonth: 50
            }
          },
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        };
        
        await setDoc(userDocRef, initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Error with user document:', error);
      return {};
    }
  }

  async updateUserDocument(uid, data) {
    if (!db) return;
    
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...data,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  }

  addAuthListener(callback) {
    this.listeners.add(callback);
    
    if (this.isInitialized) {
      callback(this.currentUser);
    }
    
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await this.updateUserDocument(user.uid, {
        lastLoginMethod: 'google',
        lastActive: serverTimestamp()
      });

      return { success: true, user: this.currentUser };
    } catch (error) {
        console.error('Google sign-in error:', error);
        let errorMessage = 'Failed to sign in with Google';
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in was cancelled';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection';
                break;
            default:
                errorMessage = error.message || 'An error occurred during sign-in';
        }
        return { success: false, error: errorMessage };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await this.updateUserDocument(user.uid, {
        lastLoginMethod: 'email',
        lastActive: serverTimestamp()
      });

      return { success: true, user: this.currentUser };
    } catch (error) {
        console.error('Email sign-in error:', error);
        let errorMessage = 'Failed to sign in';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later';
                break;
            default:
                errorMessage = error.message || 'An error occurred during sign-in';
        }
        return { success: false, error: errorMessage };
    }
  }

  async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (displayName) {
        await updateProfile(user, { displayName: displayName.trim() });
      }

      await this.updateUserDocument(user.uid, {
        email: email,
        displayName: displayName?.trim() || email.split('@')[0],
        registrationMethod: 'email'
      });

      return { success: true, user: this.currentUser };
    } catch (error) {
        console.error('Email sign-up error:', error);
        let errorMessage = 'Failed to create account';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            default:
                errorMessage = error.message || 'An error occurred during registration';
        }
        return { success: false, error: errorMessage };
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        let errorMessage = 'Failed to send password reset email';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            default:
                errorMessage = error.message || 'An error occurred';
        }
        return { success: false, error: errorMessage };
    }
  }

  async signOut() {
    try {
      if (this.currentUser) {
        await this.updateUserDocument(this.currentUser.uid, {
          lastActive: serverTimestamp()
        });
      }
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign-out error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateUserProfile(updates) {
    if (!this.currentUser) throw new Error('No user signed in');
    // Logic to update profile in Firebase Auth and Firestore
    await updateProfile(auth.currentUser, updates);
    await this.updateUserDocument(this.currentUser.uid, updates);
    this.currentUser = { ...this.currentUser, ...updates };
    this.notifyListeners();
    return { success: true };
  }

  async deleteAccount() {
    if (!auth.currentUser) throw new Error('No user is signed in to delete.');
    await deleteUser(auth.currentUser);
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }
  
  waitForAuthInit() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(this.currentUser);
      } else {
        const unsubscribe = this.addAuthListener((user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }
}

const authService = new AuthService();

export default authService;


