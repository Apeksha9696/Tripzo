# ✅ Deployment Checklist - Tripzo OAuth Fix

Use this checklist to ensure all steps are completed before and after deployment.

---

## 📋 Pre-Deployment Checklist

### Code Changes
- [ ] Reviewed `backend/server.js` changes
- [ ] Reviewed `frontend/src/components/GoogleLogin.jsx` changes
- [ ] Reviewed `frontend/src/contexts/AuthContext.jsx` changes
- [ ] Reviewed `frontend/src/App.jsx` changes
- [ ] All changes look correct
- [ ] No syntax errors visible

### Environment Setup - Render Backend

#### Create/Update Environment Variables
- [ ] Go to https://dashboard.render.com
- [ ] Select your backend service
- [ ] Go to Settings > Environment
- [ ] Add/Update the following:

```
FRONTEND_URL = https://tripzo.vercel.app
NODE_ENV = production
PORT = 5001
MONGO_URI = (your MongoDB connection string)
JWT_SECRET = (generate new 32-char secret)
FIREBASE_PROJECT_ID = (your Firebase project ID)
FIREBASE_CLIENT_EMAIL = (your Firebase client email)
FIREBASE_PRIVATE_KEY = (your Firebase private key)
```

- [ ] Verified FRONTEND_URL is set correctly
- [ ] Verified NODE_ENV is "production" (not development)
- [ ] Verified JWT_SECRET is 32+ characters
- [ ] Verified MONGO_URI is correct
- [ ] Verified all Firebase credentials are correct
- [ ] Clicked "Save" to apply changes

### Environment Setup - Vercel Frontend

#### Create/Update Environment Variables
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your frontend project
- [ ] Go to Settings > Environment Variables
- [ ] Add/Update the following:

```
VITE_API_URL = https://your-render-backend.onrender.com
VITE_SOCKET_URL = https://your-render-backend.onrender.com
VITE_FIREBASE_API_KEY = (your Firebase API key)
VITE_FIREBASE_AUTH_DOMAIN = (your Firebase auth domain)
VITE_FIREBASE_PROJECT_ID = (your Firebase project ID)
VITE_FIREBASE_STORAGE_BUCKET = (your Firebase storage bucket)
VITE_FIREBASE_MESSAGING_SENDER_ID = (your Firebase messaging sender ID)
VITE_FIREBASE_APP_ID = (your Firebase app ID)
```

- [ ] Verified VITE_API_URL points to Render backend
- [ ] Verified VITE_SOCKET_URL points to Render backend
- [ ] Verified all Firebase credentials are correct
- [ ] Verified credentials match backend
- [ ] Clicked "Save" to apply changes

### Google Cloud OAuth Setup

#### Update OAuth 2.0 Credentials
- [ ] Go to https://console.cloud.google.com
- [ ] Select your Firebase project
- [ ] Go to APIs & Services > Credentials
- [ ] Find your OAuth 2.0 Client ID
- [ ] Click to edit it

#### Authorized JavaScript Origins
- [ ] Add: `https://tripzo.vercel.app`
- [ ] Add: `https://www.tripzo.vercel.app`
- [ ] Remove any localhost URLs
- [ ] Click "Save"

#### Authorized Redirect URIs
- [ ] Add: `https://tripzo.vercel.app/`
- [ ] Add: `https://www.tripzo.vercel.app/`
- [ ] Remove any localhost URLs
- [ ] Click "Save"

#### Verify OAuth Settings
- [ ] Redirect URIs match frontend origin
- [ ] OAuth credentials match frontend config
- [ ] No development/localhost URLs remain

### Code Deployment

#### Push Code to GitHub
- [ ] `git status` shows the correct files modified
- [ ] Reviewed all changes one more time
- [ ] `git add .`
- [ ] `git commit -m "fix: Production OAuth and session persistence for Vercel+Render"`
- [ ] `git push origin main`

#### Monitor Deployments
- [ ] Verify Render backend deploys (check dashboard)
- [ ] Wait for Render deployment to complete (~5-10 min)
- [ ] Verify Vercel frontend deploys (check dashboard)
- [ ] Wait for Vercel deployment to complete (~2-5 min)

---

## 🧪 Post-Deployment Testing

### Backend Testing

#### Test 1: Backend is Running
```bash
curl https://your-render-backend.onrender.com
```
- [ ] Returns: "Tripzo Backend Running"
- [ ] Status: 200 OK

#### Test 2: CORS Configuration
```bash
curl -i -H "Origin: https://tripzo.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-render-backend.onrender.com/api/auth/google
```
- [ ] Returns: 200 OK
- [ ] Has Access-Control-Allow-Origin header
- [ ] Header value: https://tripzo.vercel.app

#### Test 3: Auth Verification Endpoint
```bash
# First, perform OAuth to get a token, then:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-render-backend.onrender.com/api/auth/me
```
- [ ] Returns: 200 OK with user data
- [ ] User data includes: id, name, email, role

### Frontend Testing

#### Test 1: Frontend Loads
- [ ] Open https://tripzo.vercel.app
- [ ] Page loads without errors
- [ ] Login page appears

#### Test 2: Google OAuth Flow
- [ ] Click "Continue with Google"
- [ ] Google authentication dialog appears
- [ ] Complete authentication with your Google account
- [ ] Should redirect to dashboard

#### Test 3: Console Logs - OAuth Flow
Open DevTools (F12) > Console tab before clicking Google login:
- [ ] See `[GoogleLogin] Starting authentication...`
- [ ] See `[GoogleLogin] Environment: PRODUCTION`
- [ ] See `[GoogleLogin] API URL: https://your-render-backend.onrender.com`
- [ ] See `[GoogleLogin] Using redirect-based auth for production`
- [ ] (Page redirects to Google)
- [ ] After auth completes:
- [ ] See `[GoogleLogin] Redirect result received: your@email.com`
- [ ] See `[GoogleLogin] User authenticated with Firebase`
- [ ] See `[GoogleLogin] Firebase ID token obtained`
- [ ] See `[GoogleLogin] Sending token to backend`
- [ ] See `[GoogleLogin] Backend response received`
- [ ] See `[GoogleLogin] Session persisted, redirecting to dashboard`

#### Test 4: Dashboard Access
- [ ] After redirect, you're on the dashboard page
- [ ] Your user info displays correctly
- [ ] No redirect back to login

#### Test 5: Session Persistence
- [ ] You're on the dashboard
- [ ] Press F5 to refresh the page
- [ ] **Expected**: Dashboard remains (you stay on same page)
- [ ] **NOT Expected**: Redirected back to login page
- [ ] Open DevTools > Console:
- [ ] See `[AuthContext] Session restored from localStorage`
- [ ] See `[AuthContext] Verifying token with backend...`
- [ ] See `[AuthContext] Token verified with backend`

#### Test 6: Logout Functionality
- [ ] Click logout button
- [ ] Should redirect to home page
- [ ] Session should be cleared

#### Test 7: Protected Routes
- [ ] Try accessing `/dashboard` without logging in
- [ ] **Expected**: Redirected to login page
- [ ] After login, try accessing different routes:
- [ ] `/my-bookings` should work (user route)
- [ ] `/driver-dashboard` should redirect to `/` (wrong role)
- [ ] `/admin-dashboard` should redirect to `/` (wrong role)

#### Test 8: Local Storage Check
In browser console (F12):
```javascript
localStorage.getItem('token')
```
- [ ] Returns a long JWT token string (not empty)
- [ ] Format: `xxxxx.yyyyy.zzzzz` (three parts separated by dots)

```javascript
JSON.parse(localStorage.getItem('user'))
```
- [ ] Returns user object: `{ id: '...', email: '...', role: '...', ... }`
- [ ] Not null or undefined

### Security Testing

#### Test 1: Invalid Token Handling
In browser console:
```javascript
localStorage.removeItem('token')
```
- [ ] Refresh page
- [ ] Should be redirected to login
- [ ] No errors in console

#### Test 2: Expired Token Simulation
In browser console:
```javascript
localStorage.setItem('token', 'invalid.token.here')
```
- [ ] Refresh page
- [ ] Should redirect to login
- [ ] `/api/auth/me` should return 401 error

### Performance Testing

#### Test 1: Initial Page Load
- [ ] Measure initial page load time
- [ ] Should load in <3 seconds
- [ ] No loading spinners or delays

#### Test 2: OAuth Flow Speed
- [ ] Measure OAuth flow time
- [ ] From Google login button to dashboard should be <5 seconds
- [ ] No network delays or timeouts

#### Test 3: Page Refresh Speed
- [ ] Measure page refresh time
- [ ] Dashboard should remain (not redirect)
- [ ] Refresh should complete in <2 seconds

---

## 🐛 Post-Deployment Troubleshooting

### Issue: CORS Error
- [ ] Check backend logs on Render dashboard
- [ ] Verify FRONTEND_URL is set correctly
- [ ] Verify frontend URL is in CORS allowed origins
- [ ] Check browser console for exact origin error

### Issue: "Cannot find module" or 500 error
- [ ] Check Render backend logs
- [ ] Verify all environment variables are set
- [ ] Verify MONGO_URI is correct and accessible
- [ ] Verify Firebase credentials are correct

### Issue: OAuth not working
- [ ] Check frontend console for [GoogleLogin] logs
- [ ] Check backend logs for [GOOGLE AUTH] logs
- [ ] Verify Google Cloud OAuth redirect URIs are updated
- [ ] Verify Firebase config matches backend and frontend
- [ ] Try incognito mode (clear cache issues)

### Issue: Session lost on refresh
- [ ] Check if token is in localStorage (F12 console)
- [ ] Check if `/api/auth/me` endpoint works
- [ ] Check backend logs for [AUTH ME] logs
- [ ] Verify JWT_SECRET is same on backend
- [ ] Verify token wasn't tampered with

### Issue: Redirect loop
- [ ] Check protected routes logging
- [ ] Verify isAuthenticated check is working
- [ ] Check if token is valid (decode at jwt.io)
- [ ] Clear browser cache and try again
- [ ] Check for infinite redirects in browser history

---

## ✅ Final Verification

### Everything Working?
- [ ] OAuth login works
- [ ] Session persists on refresh
- [ ] No CORS errors
- [ ] No console errors
- [ ] All logs show correct flow
- [ ] Logout works
- [ ] Protected routes work
- [ ] Performance is acceptable

### Documentation
- [ ] Reviewed README_OAUTH_FIX.md
- [ ] Reviewed QUICK_DEPLOYMENT_GUIDE.md
- [ ] Saved this checklist for reference
- [ ] Bookmarked Render dashboard
- [ ] Bookmarked Vercel dashboard

### Team Communication
- [ ] Notified team that OAuth is fixed
- [ ] Shared production URL with team
- [ ] Documented any custom changes
- [ ] Created runbook for future deployments
- [ ] Saved all documentation

---

## 📊 Deployment Summary

### Date: ________________
### Time Started: ________________
### Time Completed: ________________

### Issues Encountered:
________________
________________
________________

### Resolution:
________________
________________
________________

### Notes:
________________
________________
________________

---

## 🎉 Deployment Complete!

**Status**: ✅ Production Deployed

You've successfully:
- ✅ Fixed Google OAuth authentication
- ✅ Enabled session persistence
- ✅ Configured cross-origin communication
- ✅ Deployed to production
- ✅ Verified all functionality

**Your Tripzo application is now ready for users!** 🚀

---

## 📞 Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://tripzo.vercel.app | ✅ |
| Backend | https://your-render-backend.onrender.com | ✅ |
| API Auth | /api/auth/google | ✅ |
| API Verify | /api/auth/me | ✅ |

---

## 🔐 Security Reminders

- 🔒 Never commit .env files
- 🔒 Never share JWT_SECRET
- 🔒 Never hardcode URLs
- 🔒 Always use HTTPS in production
- 🔒 Verify Firebase credentials are correct
- 🔒 Monitor backend logs for suspicious activity

---

## 📚 Additional Resources

- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- JWT Decoder: https://jwt.io

---

**Checklist Version**: 1.0  
**Last Updated**: May 2026  
**Status**: ✅ Ready for Use

Print this checklist or save it for future reference!
