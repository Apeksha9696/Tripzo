import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  // Handle redirect result on component mount (for redirect-based OAuth in production)
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (result) {
            console.log('[GoogleLogin] Redirect result received:', result.user.email);
            await exchangeFirebaseTokenForJWT(result);
          }
        })
        .catch((err) => {
          console.error('[GoogleLogin] Redirect error:', err);
          setError(err.message || 'Failed to handle redirect');
        });
    }
  }, []);

  const exchangeFirebaseTokenForJWT = async (result) => {
    try {
      const user = result.user;
      console.log('[GoogleLogin] User authenticated with Firebase:', {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      });

      // Get Firebase ID token
      const token = await user.getIdToken();
      console.log('[GoogleLogin] Firebase ID token obtained');

      // Send to backend
      const API_URL = import.meta.env.VITE_API_URL;
      console.log('[GoogleLogin] Sending token to backend:', API_URL);

      const response = await axios.post(`${API_URL}/api/auth/google`, { token }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[GoogleLogin] Backend response received:', {
        userId: response.data.user.id,
        email: response.data.user.email,
        role: response.data.user.role
      });

      // Store token and user data
      login(response.data.token, response.data.user);

      console.log('[GoogleLogin] Session persisted, redirecting to dashboard');

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[GoogleLogin] Error exchanging token:', err.message);
      if (err.response?.data?.error) {
        setError(`Authentication failed: ${err.response.data.error}`);
      } else {
        setError(err.message || 'Failed to authenticate with backend');
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      
      console.log('[GoogleLogin] Starting authentication...');
      console.log('[GoogleLogin] Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
      console.log('[GoogleLogin] API URL:', import.meta.env.VITE_API_URL);

      // Use redirect flow in production, popup in development
      if (import.meta.env.PROD) {
        console.log('[GoogleLogin] Using redirect-based auth for production');
        await signInWithRedirect(auth, provider);
        return; // Redirect will reload the page
      }

      // Development: use popup
      console.log('[GoogleLogin] Using popup-based auth for development');
      const result = await signInWithPopup(auth, provider);
      await exchangeFirebaseTokenForJWT(result);
      
    } catch (err) {
      console.error('[GoogleLogin] Error during Google login:', err.message, err.code);
      
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Login was cancelled.');
      } else {
        setError(err.message || 'Failed to login with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            <p className="font-semibold mb-1">❌ {error}</p>
            <p className="text-xs text-red-500">
              If the issue persists, check the browser console for more details.
            </p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          By clicking above, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
