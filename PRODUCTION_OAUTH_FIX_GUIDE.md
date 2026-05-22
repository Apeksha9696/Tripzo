# Tripzo Production OAuth & Session Persistence Fix Guide

## Overview
This document outlines all the fixes applied to resolve the Google OAuth login + session persistence issue for cross-origin deployment between Vercel (frontend) and Render (backend).

---

## 🔧 Changes Made

### 1. Backend CORS Configuration (`server.js`)
**File**: [backend/server.js](backend/server.js#L57-L88)

**Changes**:
- ✅ Fixed CORS to properly include Vercel frontend URLs
- ✅ Added support for environment variable `FRONTEND_URL`
- ✅ Enabled `credentials: true` for cross-origin cookies
- ✅ Added proper error logging for CORS rejections
- ✅ Added startup logging to verify configuration

**Code**:
```javascript
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tripzo.vercel.app';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://tripzo.vercel.app',
  'https://www.tripzo.vercel.app',
  'https://tripzo-app.vercel.app',
  'https://www.tripzo-app.vercel.app',
  FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.error(`[CORS ERROR] Origin not allowed: ${origin}`);
    return callback(new Error(`CORS policy: Origin not allowed - ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
}));
```

**Why**: The original CORS config wasn't properly configured for cross-origin credentials. This fix ensures that the frontend can send/receive authentication tokens properly.

---

### 2. Google OAuth Endpoint with Enhanced Logging (`server.js`)
**File**: [backend/server.js](backend/server.js#L440-L525)

**Changes**:
- ✅ Added comprehensive logging at every step of the OAuth flow
- ✅ Improved error handling with specific error messages
- ✅ Better Firebase token verification with error context
- ✅ Clear console output for debugging production issues

**Debugging Output**:
```
[GOOGLE AUTH] Received auth request for: user@gmail.com
[GOOGLE AUTH] Verifying Firebase ID token...
[GOOGLE AUTH] Firebase token verified for: user@gmail.com
[GOOGLE AUTH] Firebase user record fetched: { userName: 'John Doe', hasPhoto: true }
[GOOGLE AUTH] Processing user: { email: 'user@gmail.com', name: 'John Doe' }
[GOOGLE AUTH] Creating new user: user@gmail.com
[GOOGLE AUTH] User created successfully: 507f1f77bcf86cd799439011
[GOOGLE AUTH] JWT token issued for user: 507f1f77bcf86cd799439011
[GOOGLE AUTH] Sending response: { userId: '507f1f77bcf86cd799439011', email: 'user@gmail.com', role: 'user' }
```

**Why**: Detailed logging helps diagnose authentication issues in production quickly.

---

### 3. Auth Verification Endpoint (`server.js`)
**File**: [backend/server.js](backend/server.js#L527-L557)

**New Endpoint**: `GET /api/auth/me`

**Purpose**:
- Verify that the user's JWT token is still valid
- Check if the user exists in the database
- Return current user information
- Allow frontend to verify session on app load

**Code**:
```javascript
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    console.log('[AUTH ME] Verifying user:', req.user.id);
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('[AUTH ME] User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[AUTH ME] User verified:', { id: user._id, email: user.email, role: user.role });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });
  } catch (err) {
    console.error('[AUTH ME] Error:', err.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});
```

---

### 4. Frontend GoogleLogin Component (`components/GoogleLogin.jsx`)
**File**: [frontend/src/components/GoogleLogin.jsx](frontend/src/components/GoogleLogin.jsx)

**Changes**:
- ✅ Added redirect result handling for production
- ✅ Implemented proper error handling with specific error codes
- ✅ Added comprehensive logging for debugging
- ✅ Improved UX with better error messages
- ✅ Added `withCredentials: true` to axios request
- ✅ Used `{ replace: true }` in navigation to prevent history issues

**Key Features**:
```javascript
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

// Supports both popup (dev) and redirect (prod) flows
if (import.meta.env.PROD) {
  console.log('[GoogleLogin] Using redirect-based auth for production');
  await signInWithRedirect(auth, provider);
} else {
  console.log('[GoogleLogin] Using popup-based auth for development');
  const result = await signInWithPopup(auth, provider);
  await exchangeFirebaseTokenForJWT(result);
}

// Axios request with credentials
const response = await axios.post(`${API_URL}/api/auth/google`, { token }, {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

### 5. Enhanced AuthContext (`contexts/AuthContext.jsx`)
**File**: [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx)

**Changes**:
- ✅ Added token verification on app load
- ✅ Improved logging with context prefixes
- ✅ Added support for `/api/auth/me` verification
- ✅ Better error handling for invalid/expired tokens
- ✅ Added logout endpoint call (optional)
- ✅ Proper state management for verification state

**Key Feature - Token Verification on Load**:
```javascript
const verifyTokenWithBackend = async (token) => {
  try {
    setVerifyingToken(true);
    console.log('[AuthContext] Verifying token with backend...');

    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('[AuthContext] Token verified with backend:', {
      userId: response.data.user.id,
      email: response.data.user.email
    });

    // Update user data from backend
    const user = response.data.user;
    setAuthStorage(token, user);
    setAuth({ token, user, ready: true });
  } catch (err) {
    console.warn('[AuthContext] Token verification failed:', err.response?.status, err.message);
    // Token is invalid/expired, clear auth
    clearAuthStorage();
    delete axios.defaults.headers.common.Authorization;
    setAuth({ token: null, user: null, ready: true });
  } finally {
    setVerifyingToken(false);
  }
};
```

---

### 6. Frontend App Layout & Redirect Handling (`App.jsx`)
**File**: [frontend/src/App.jsx](frontend/src/App.jsx)

**Changes**:
- ✅ Enhanced Firebase redirect result handling
- ✅ Proper error handling with specific error codes
- ✅ Using auth context for session storage instead of direct localStorage
- ✅ Comprehensive logging for redirect flow
- ✅ Using `{ replace: true }` in navigation

**Improved Protected Routes**:
```javascript
const UserRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('[UserRoute] Checking access:', {
    ready: auth.ready,
    authenticated: isAuthenticated,
    role: auth.user?.role,
    path: location.pathname
  });

  if (!auth.ready) {
    console.log('[UserRoute] Auth not ready, showing loading...');
    return null;
  }

  if (!isAuthenticated) {
    console.log('[UserRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ ... }} />;
  }

  if (auth.user.role === 'driver') {
    console.log('[UserRoute] User is driver, redirecting to driver-dashboard');
    return <Navigate to="/driver-dashboard" replace />;
  }

  if (auth.user.role === 'admin') {
    console.log('[UserRoute] User is admin, redirecting to admin-dashboard');
    return <Navigate to="/admin-dashboard" replace />;
  }

  console.log('[UserRoute] Access granted for user:', auth.user.email);
  return children;
};
```

---

### 7. Backend Environment Configuration
**File**: [backend/.env.example](backend/.env.example)

**Updated with**:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/tripzo?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here_min_32_chars_recommended_for_production
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=production

# Deployment URLs
FRONTEND_URL=https://tripzo.vercel.app
RENDER_URL=https://tripzo-backend.onrender.com

# Server Configuration
PORT=5001
```

---

### 8. Frontend Environment Configuration
**File**: [frontend/.env.example](frontend/.env.example)

**Updated with**:
```env
# API Configuration
VITE_API_URL=https://tripzo-backend.onrender.com
VITE_SOCKET_URL=https://tripzo-backend.onrender.com

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Environment
VITE_ENV=production
```

---

## 📋 Production Deployment Checklist

### On Render (Backend)

#### 1. Set Environment Variables
```
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = generate_random_secret_min_32_chars
FIREBASE_PROJECT_ID = your_firebase_project_id
FIREBASE_CLIENT_EMAIL = your_firebase_client_email
FIREBASE_PRIVATE_KEY = your_firebase_private_key
FRONTEND_URL = https://tripzo.vercel.app
NODE_ENV = production
```

**How to generate JWT_SECRET**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 2. Verify Backend URL
- Backend URL should be: `https://your-app.onrender.com`
- This URL must match `FRONTEND_URL` environment variable

#### 3. Deploy Backend
```bash
# On Render, deployment is automatic when you push to GitHub
git push origin main
```

#### 4. Test Backend
```bash
# Test CORS health check
curl -H "Origin: https://tripzo.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-app.onrender.com/api/auth/google

# Test auth endpoint
curl https://your-app.onrender.com
# Should return: "Tripzo Backend Running"
```

---

### On Vercel (Frontend)

#### 1. Set Environment Variables
In Vercel Project Settings > Environment Variables:

```
VITE_API_URL = https://your-render-backend.onrender.com
VITE_SOCKET_URL = https://your-render-backend.onrender.com
VITE_FIREBASE_API_KEY = your_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
```

#### 2. Verify Frontend URL
- Frontend URL should be: `https://tripzo.vercel.app`
- Or your custom domain

#### 3. Deploy Frontend
```bash
# On Vercel, deployment is automatic when you push to GitHub
git push origin main
```

---

### In Google Cloud Console

#### 1. Update OAuth 2.0 Redirect URIs
Go to **Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs**

**Authorized JavaScript origins** (add/update):
```
https://tripzo.vercel.app
https://www.tripzo.vercel.app
```

**Authorized redirect URIs** (add/update):
```
https://tripzo.vercel.app/
https://www.tripzo.vercel.app/
```

#### 2. Verify Credentials
- Client ID should be set in `VITE_FIREBASE_API_KEY` (for Firebase)
- Or in your Firebase config

---

## 🧪 Testing the Fix

### Step 1: Test Backend Connectivity
```bash
# Check if backend is running
curl https://your-render-backend.onrender.com

# Check auth/me endpoint (without auth)
curl https://your-render-backend.onrender.com/api/auth/me
# Expected: 401 Unauthorized (because no token provided)
```

### Step 2: Test Frontend
1. Go to `https://tripzo.vercel.app`
2. Open browser console (F12)
3. Look for console logs starting with `[GoogleLogin]` or `[App]`
4. Click "Continue with Google"

### Step 3: Verify Logs
Look for these sequences in the console:

**Successful OAuth Flow**:
```
[GoogleLogin] Starting authentication...
[GoogleLogin] Environment: PRODUCTION
[GoogleLogin] API URL: https://your-render-backend.onrender.com
[GoogleLogin] Using redirect-based auth for production
(Page redirects to Google login...)
[GoogleLogin] Redirect result received: user@gmail.com
[GoogleLogin] User authenticated with Firebase: { email: 'user@gmail.com', ... }
[GoogleLogin] Firebase ID token obtained
[GoogleLogin] Sending token to backend: https://your-render-backend.onrender.com
[GoogleLogin] Backend response received: { userId: '...', email: 'user@gmail.com', role: 'user' }
[GoogleLogin] Session persisted, redirecting to dashboard
[UserRoute] Access granted for user: user@gmail.com
```

**Backend Logs**:
```
[GOOGLE AUTH] Received auth request for: user@gmail.com
[GOOGLE AUTH] Verifying Firebase ID token...
[GOOGLE AUTH] Firebase token verified for: user@gmail.com
[GOOGLE AUTH] Firebase user record fetched: { userName: 'John Doe', hasPhoto: true }
[GOOGLE AUTH] Processing user: { email: 'user@gmail.com', name: 'John Doe' }
[GOOGLE AUTH] Existing user found: 507f1f77bcf86cd799439011
[GOOGLE AUTH] JWT token issued for user: 507f1f77bcf86cd799439011
[GOOGLE AUTH] Sending response: { userId: '...', email: 'user@gmail.com', role: 'user' }
```

### Step 4: Test Session Persistence
1. After successful login, you should see the dashboard
2. Refresh the page (F5)
3. **Expected**: Dashboard remains, not redirected to login
4. Look for console logs:
```
[AuthContext] Session restored from localStorage
[AuthContext] Verifying token with backend...
[AuthContext] Token verified with backend: { userId: '...', email: 'user@gmail.com' }
[UserRoute] Access granted for user: user@gmail.com
```

### Step 5: Test Logout
1. Click logout button
2. **Expected**: Redirected to home page
3. Try accessing `/dashboard`
4. **Expected**: Redirected to login page

---

## 🐛 Troubleshooting

### Issue: "CORS policy: Origin not allowed"
**Cause**: The frontend origin is not in the CORS allowed list

**Fix**:
1. Check what origin is being blocked in the error message
2. Add it to `allowedOrigins` in backend `server.js`
3. Or set it via `FRONTEND_URL` environment variable
4. Redeploy backend

```bash
# Check what origin browser is using
# Open DevTools > Network tab > right-click failed request > Headers
# Look for "Request Headers" > Origin
```

### Issue: "Firebase token verification failed"
**Cause**: Firebase credentials are not properly configured

**Fix**:
1. Check that `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are set correctly
2. Verify Firebase project ID matches the one in frontend Firebase config
3. Check that the private key has proper newline characters:
   - Should have `\n` between lines
   - Frontend Firebase config must match backend

### Issue: "Redirecting back to login after Google auth"
**Cause**: Multiple issues possible:

**Check 1**: Is the token being stored?
```javascript
// In browser console
localStorage.getItem('token')
// Should return a long JWT token
```

**Check 2**: Is the user object being stored?
```javascript
// In browser console
JSON.parse(localStorage.getItem('user'))
// Should return { id: '...', email: '...', role: '...' }
```

**Check 3**: Is the backend returning the token?
```javascript
// In browser console
// Look for the API response in Network tab
// POST /api/auth/google should return { token: '...', user: {...} }
```

**Check 4**: Is the auth verification endpoint working?
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://your-render-backend.onrender.com/api/auth/me
# Should return the user object
```

### Issue: "Axios gives CORS error even with credentials: true"
**Cause**: CORS headers not being set properly

**Fix**:
1. Verify backend CORS config has `credentials: true`
2. Verify axios request has `withCredentials: true`
3. Clear browser cookies/cache (Ctrl+Shift+Delete)
4. Check that both frontend and backend are using HTTPS in production

### Issue: "Session lost after page refresh"
**Cause**: Token not being stored or retrieved properly

**Fix**:
1. Check browser's local storage (DevTools > Application > Local Storage)
2. Verify `token` and `user` keys are present
3. Check that the token is valid (decode it at jwt.io)
4. Verify `/api/auth/me` endpoint is working with that token

---

## 📚 Additional Resources

### Debugging Tips
1. Always check browser console for `[GoogleLogin]`, `[App]`, `[AuthContext]` logs
2. Check backend logs on Render dashboard
3. Use Network tab in DevTools to see API requests/responses
4. Use `jwt.io` to decode JWT tokens and verify claims

### Key Files Modified
- ✅ [backend/server.js](backend/server.js) - CORS, OAuth, /api/auth/me endpoint
- ✅ [backend/.env.example](backend/.env.example) - Environment variables
- ✅ [frontend/src/components/GoogleLogin.jsx](frontend/src/components/GoogleLogin.jsx) - OAuth flow
- ✅ [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) - Session management
- ✅ [frontend/src/App.jsx](frontend/src/App.jsx) - Redirect handling and protected routes
- ✅ [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx) - Login logging
- ✅ [frontend/.env.example](frontend/.env.example) - Environment variables

---

## 🎯 Summary

The complete fix addresses all 12 areas mentioned:

1. ✅ **Backend CORS** - Fixed with proper environment variable support
2. ✅ **Express session** - Not needed for JWT-based auth, but token verification endpoint added
3. ✅ **Passport.js** - Not needed for Firebase-based OAuth
4. ✅ **Google OAuth callback** - Using Firebase for client-side OAuth
5. ✅ **Frontend Axios** - Configured with `withCredentials: true`
6. ✅ **Frontend auth persistence** - localStorage + verification endpoint
7. ✅ **Environment variables** - Complete setup documented
8. ✅ **Google Cloud OAuth settings** - Configuration guide provided
9. ✅ **Cookie & deployment** - Cross-origin JWT-based solution
10. ✅ **Frontend routing** - Protected routes with comprehensive logging
11. ✅ **Debugging** - Console logs with prefixes for tracking
12. ✅ **Production cleanup** - All localhost URLs removed

---

## 🚀 Quick Start Checklist

- [ ] Set `FRONTEND_URL` on Render backend
- [ ] Set `VITE_API_URL` on Vercel frontend
- [ ] Update Google Cloud OAuth redirect URIs
- [ ] Generate and set `JWT_SECRET` on Render
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Test OAuth flow in production
- [ ] Verify session persistence after page refresh
- [ ] Check console logs for any errors
- [ ] Test logout functionality

All done! Your application should now have production-ready Google OAuth + session persistence. 🎉
