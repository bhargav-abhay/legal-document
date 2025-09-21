import React, { useState } from 'react';
import { 
  Mail, 
  X, 
  Eye, 
  EyeOff, 
  Scale, 
  AlertCircle, 
  CheckCircle, 
  User 
} from "lucide-react";

const DARK_THEME = {
  bg: {
    card: "bg-gray-900/95 backdrop-blur-xl border border-gray-800/50",
  },
  text: {
    primary: "text-white",
    secondary: "text-gray-300",
    error: "text-red-400",
    success: "text-green-400",
  },
  input: "bg-gray-900/90 backdrop-blur-sm text-white placeholder-gray-400 border border-gray-800/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300",
  button: {
    primary: "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02]",
    secondary: "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-200 hover:bg-gray-700/90 hover:border-gray-600 transition-all duration-300",
    google: "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.02]",
    outline: "bg-transparent border-2 border-green-500/50 text-green-300 hover:bg-green-500/10 hover:border-green-400 transition-all duration-300",
  },
};

const AuthModal = ({ isOpen, onClose, auth, clearError, isLoading, error }) => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  if (!isOpen) return null;

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setMessage('');
    setMessageType('');
    if (clearError) {
      clearError();
    }
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    if (!auth?.signInWithGoogle) return;
    
    const result = await auth.signInWithGoogle();
    if (result.success) {
      handleClose();
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    setMessage('');

    if (!auth?.signInWithEmail) return;

    const result = await auth.signInWithEmail(email, password);
    if (result.success) {
      handleClose();
    } else {
      setMessage(result.error);
      setMessageType('error');
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    if (!auth?.signUpWithEmail) return;

    const result = await auth.signUpWithEmail(email, password, displayName);
    if (result.success) {
      setMessage('Account created successfully! Welcome to Legal AI!');
      setMessageType('success');
      setTimeout(() => handleClose(), 2000);
    } else {
      setMessage(result.error);
      setMessageType('error');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    if (!auth?.resetPassword) return;

    const result = await auth.resetPassword(email);
    if (result.success) {
      setMessage('Password reset email sent! Check your inbox.');
      setMessageType('success');
    } else {
      setMessage(result.error);
      setMessageType('error');
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Your Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getFormDescription = () => {
    switch (mode) {
      case 'signup': return 'Join thousands of users who trust Legal AI';
      case 'reset': return 'Enter your email to reset your password';
      default: return 'Access powerful AI tools to understand legal documents';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${DARK_THEME.bg.card} rounded-2xl p-8 max-w-md w-full transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{getFormTitle()}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Logo and Description */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl w-16 h-16 mx-auto"></div>
            <Scale className="relative w-16 h-16 text-orange-400 mx-auto" />
          </div>
          <p className="text-gray-300 text-sm">
            {getFormDescription()}
          </p>
        </div>

        {/* Error/Success Message */}
        {(message || error) && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
            messageType === 'error' || error 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            {messageType === 'error' || error ? (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm">
              {message || error}
            </div>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`${DARK_THEME.button.google} w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 mb-6`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={
          mode === 'signup' ? handleEmailSignUp : 
          mode === 'reset' ? handlePasswordReset : 
          handleEmailSignIn
        } className="space-y-4">
          
          {/* Display Name (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`${DARK_THEME.input} w-full pl-10 pr-4 py-3 rounded-xl`}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${DARK_THEME.input} w-full pl-10 pr-4 py-3 rounded-xl`}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password (Not for Reset) */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${DARK_THEME.input} w-full pl-4 pr-12 py-3 rounded-xl`}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${DARK_THEME.input} w-full pl-4 pr-12 py-3 rounded-xl`}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`${DARK_THEME.button.primary} w-full py-3 px-4 rounded-xl disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <>
                {mode === 'signup' ? 'Create Account' : 
                 mode === 'reset' ? 'Send Reset Email' : 
                 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 text-center text-sm">
          {mode === 'signin' && (
            <>
              <div className="mb-2">
                <button
                  onClick={() => setMode('reset')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
              <div>
                <span className="text-gray-400">Don't have an account? </span>
                <button
                  onClick={() => {
                    setMode('signup');
                    clearForm();
                  }}
                  className="text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <span className="text-gray-400">Already have an account? </span>
              <button
                onClick={() => {
                  setMode('signin');
                  clearForm();
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <span className="text-gray-400">Remember your password? </span>
              <button
                onClick={() => {
                  setMode('signin');
                  clearForm();
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
