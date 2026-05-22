# Quick Deployment Guide - Tripzo OAuth Fix

## 🚀 5-Minute Deployment Setup

### Step 1: Update Backend Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your Tripzo backend service
3. Go to **Settings** > **Environment**
4. Update/add these variables:

```
FRONTEND_URL = https://tripzo.vercel.app
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = <generate_new_32_char_secret>
FIREBASE_PROJECT_ID = your_firebase_project_id
FIREBASE_CLIENT_EMAIL = your_firebase_client_email
FIREBASE_PRIVATE_KEY = your_firebase_private_key
NODE_ENV = production
PORT = 5001
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Click **Save**
6. Wait for automatic redeploy

---

### Step 2: Update Frontend Environment Variables on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Tripzo frontend project
3. Go to **Settings** > **Environment Variables**
4. Update/add these variables:

```
VITE_API_URL = https://your-render-backend.onrender.com
VITE_SOCKET_URL = https://your-render-backend.onrender.com
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_firebase_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_firebase_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID = your_firebase_app_id
```

5. Click **Save**
6. Wait for automatic redeploy

---

### Step 3: Update Google Cloud OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Update **Authorized JavaScript origins:**
   - `https://tripzo.vercel.app`
   - `https://www.tripzo.vercel.app`

6. Update **Authorized redirect URIs:**
   - `https://tripzo.vercel.app/`
   - `https://www.tripzo.vercel.app/`

7. Click **Save**

---

### Step 4: Deploy Code Changes

#### Option A: If using GitHub (Recommended)
```bash
# 1. Commit changes
git add .
git commit -m "fix: Production OAuth and session persistence for Vercel+Render"

# 2. Push to GitHub
git push origin main

# 3. Both Vercel and Render will auto-deploy
```

#### Option B: Manual git push to Render
```bash
# 1. Add Render remote
git remote add render https://git.render.com/your-service-name.git

# 2. Push to Render
git push render main
```

---

### Step 5: Verify Deployment

#### Check Backend
```bash
# Should return: "Tripzo Backend Running"
curl https://your-render-backend.onrender.com

# Should return 200 OK with CORS headers
curl -i -H "Origin: https://tripzo.vercel.app" \
  https://your-render-backend.onrender.com/api/auth/google
```

#### Check Frontend
1. Open `https://tripzo.vercel.app` in browser
2. Open DevTools (F12) > Console
3. Click "Continue with Google"
4. Look for logs starting with `[GoogleLogin]`

---

## 🧪 Test the OAuth Flow

### Test 1: Successful Login
1. Go to `https://tripzo.vercel.app/login`
2. Click "Continue with Google"
3. Complete Google authentication
4. **Expected**: Redirected to `/dashboard`
5. **Console logs** should show:
   ```
   [GoogleLogin] Starting authentication...
   [GoogleLogin] Redirect result received: your@email.com
   [GoogleLogin] Session persisted, redirecting to dashboard
   [UserRoute] Access granted for user: your@email.com
   ```

### Test 2: Session Persistence
1. After login, you should be on `/dashboard`
2. Press F5 to refresh the page
3. **Expected**: Still on `/dashboard`, not redirected to login
4. **Console logs** should show:
   ```
   [AuthContext] Session restored from localStorage
   [AuthContext] Verifying token with backend...
   [AuthContext] Token verified with backend
   [UserRoute] Access granted for user: your@email.com
   ```

### Test 3: Logout & Redirect
1. Click logout button
2. **Expected**: Redirected to home page (`/`)
3. Try visiting `/dashboard`
4. **Expected**: Redirected to `/login`

### Test 4: Invalid Token
1. Open DevTools > Console
2. Clear the token: `localStorage.removeItem('token')`
3. Refresh page
4. **Expected**: Redirected to `/login`
5. **Console logs** should show token verification failure

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ CORS error disappears from network requests
- ✅ `/api/auth/google` returns token
- ✅ `/dashboard` is accessible after login
- ✅ Session persists after page refresh
- ✅ Console shows `[GoogleLogin]`, `[App]`, `[AuthContext]` logs
- ✅ No "CORS policy" errors
- ✅ No redirect loops
- ✅ Logout works properly

---

## 🐛 Quick Troubleshooting

### "CORS policy: Origin not allowed"
```bash
# Check what Render thinks FRONTEND_URL is:
# Go to Render Settings > Environment
# Make sure FRONTEND_URL = https://tripzo.vercel.app
```

### "Token verification failed"
```bash
# Check Firebase credentials:
# 1. Backend: FIREBASE_PROJECT_ID matches frontend
# 2. Backend: FIREBASE_PRIVATE_KEY is properly formatted
# 3. Frontend: VITE_FIREBASE_PROJECT_ID matches
```

### "Redirecting back to login"
```javascript
// Check if token exists in browser console:
localStorage.getItem('token')  // Should return long JWT string
localStorage.getItem('user')   // Should return user object
```

### "API returns 401 Unauthorized"
```bash
# Check if /api/auth/me endpoint works:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-render-backend.onrender.com/api/auth/me
```

---

## 📋 File Changes Reference

| File | Change | Impact |
|------|--------|--------|
| `backend/server.js` | ✅ CORS fix + OAuth logging + /api/auth/me | Backend now accepts requests from Vercel |
| `backend/.env.example` | ✅ Updated with FRONTEND_URL | Easier setup |
| `frontend/components/GoogleLogin.jsx` | ✅ Better error handling + logging | Clearer OAuth flow |
| `frontend/contexts/AuthContext.jsx` | ✅ Token verification on load | Session persists on refresh |
| `frontend/App.jsx` | ✅ Improved redirect handling | No more redirect loops |
| `frontend/pages/Login.jsx` | ✅ Added logging | Better debugging |
| `frontend/.env.example` | ✅ Updated API URL | Correct backend endpoint |

---

## 🔗 Important URLs

Replace `your-render-backend` with your actual Render backend URL:

- **Frontend**: `https://tripzo.vercel.app`
- **Backend**: `https://your-render-backend.onrender.com`
- **Auth Endpoint**: `https://your-render-backend.onrender.com/api/auth/google`
- **Verify Auth**: `https://your-render-backend.onrender.com/api/auth/me`

---

## 📞 Render Dashboard

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Find your Tripzo backend service
3. Check these sections:
   - **Settings** > **Environment** (for env variables)
   - **Logs** (for debugging)
   - **Events** (to see deploy status)

---

## 📱 Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your Tripzo project
3. Check these sections:
   - **Settings** > **Environment Variables** (for env variables)
   - **Deployments** (to see deploy status)
   - **Logs** (for debugging)

---

## 🎯 Common Mistakes to Avoid

❌ **Don't**: Use `http://` URLs in production (use `https://`)
❌ **Don't**: Forget to set `FRONTEND_URL` on Render
❌ **Don't**: Forget to set `VITE_API_URL` on Vercel
❌ **Don't**: Use different URLs than what's in Google Cloud OAuth
❌ **Don't**: Keep `NODE_ENV=development` on Render
❌ **Don't**: Hardcode URLs in code (use env variables)

---

## ✅ Pre-Deployment Checklist

Before deploying:

- [ ] All environment variables set on Render
- [ ] All environment variables set on Vercel
- [ ] Google Cloud OAuth updated with Vercel URL
- [ ] Google Cloud OAuth redirect URIs updated
- [ ] Code changes committed to GitHub
- [ ] No hardcoded URLs in code
- [ ] `NODE_ENV=production` on Render
- [ ] Firebase credentials match frontend and backend

---

## 🚀 That's It!

Your OAuth flow should now work perfectly! 

**Timeline**:
1. ⏱️ 2 min - Update Render environment variables
2. ⏱️ 2 min - Update Vercel environment variables  
3. ⏱️ 1 min - Update Google Cloud OAuth
4. ⏱️ Auto - Both services redeploy automatically
5. ⏱️ 5 min total

After deployment, test the OAuth flow as described above.

For detailed troubleshooting and full explanation, see [PRODUCTION_OAUTH_FIX_GUIDE.md](PRODUCTION_OAUTH_FIX_GUIDE.md)

---

## 📞 Support

If you encounter issues:

1. Check the **Console Logs** in browser (F12)
2. Check the **Render Logs** in dashboard
3. Look for error messages with prefixes: `[GoogleLogin]`, `[GOOGLE AUTH]`, `[CORS ERROR]`
4. See TROUBLESHOOTING section in [PRODUCTION_OAUTH_FIX_GUIDE.md](PRODUCTION_OAUTH_FIX_GUIDE.md)

Good luck! 🎉
